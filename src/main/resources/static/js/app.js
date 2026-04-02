const API_BASE_URL = 'http://localhost:8080/api';

const originalFetch = window.fetch;
window.fetch = async function() {
    let [resource, config] = arguments;
    if(config === undefined) config = {};
    if(config.headers === undefined) config.headers = {};
    const token = localStorage.getItem('auth_token');
    if(token && !resource.includes('/auth/login')) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }
    return originalFetch(resource, config);
};

// State
let students = [];
let attendanceRecords = [];
let feedbacks = [];
let events = [];
let classesArr = [];
let subjectsArr = [];
let branchesArr = [];
let leavesArr = [];
let timetableSlots = [];
let currentMonthOffset = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if(!localStorage.getItem('auth_token')) { window.location.href = '/login.html'; return; }

    if(localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        setTimeout(() => { 
            const tgt = document.querySelector('#theme-toggle i');
            if(tgt) tgt.className = 'fa-solid fa-sun'; 
        }, 100);
    }

    setupNavigation();
    setupForms();
    
    // Core loads
    fetchProfile();
    fetchClassesAndSubjects();
    fetchStudents();
    fetchAttendance();
    fetchFeedbacks();
    
    // V3 & V4 Widget initializations
    initClock();
    renderCalendar();
    fetchEvents();
    
    fetchAIReminders();
});

function logout() { localStorage.removeItem('auth_token'); window.location.href = '/login.html'; }

// ----- Profile & Header -----
function toggleProfileDropdown() { document.getElementById('profile-dropdown').classList.toggle('active'); }
window.onclick = function(e) { if (!e.target.closest('.user-profile-btn') && !e.target.closest('.dropdown-menu')) { document.getElementById('profile-dropdown').classList.remove('active'); } }

async function fetchProfile() {
    const id = localStorage.getItem('auth_token');
    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile/${id}`);
        if(res.ok) {
            const up = await res.json();
            document.getElementById('header-username').textContent = up.username;
            document.getElementById('profile-username').value = up.username;
            
            const avatarImg = document.getElementById('header-avatar');
            const avatarFb = document.querySelector('.avatar-fallback');
            if(up.profilePicBase64) {
                avatarImg.src = up.profilePicBase64; avatarImg.style.display = 'block'; avatarFb.style.display = 'none';
                document.getElementById('profile-preview').src = up.profilePicBase64; document.getElementById('profile-base64').value = up.profilePicBase64;
            } else { avatarImg.style.display = 'none'; avatarFb.style.display = 'flex'; }
        }
    } catch(e) {}
}

window.previewProfileImage = function(e) {
    const file = e.target.files[0];
    if(file) {
        const r = new FileReader();
        r.onload = ev => { document.getElementById('profile-preview').src = ev.target.result; document.getElementById('profile-base64').value = ev.target.result; }
        r.readAsDataURL(file);
    }
}

// ----- V4 Data Fetching (Classes, Subjects, Timetable) -----
async function fetchClassesAndSubjects() {
    try {
        const [bRes, cRes, sRes] = await Promise.all([fetch(`${API_BASE_URL}/branches`), fetch(`${API_BASE_URL}/classes`), fetch(`${API_BASE_URL}/subjects`)]);
        branchesArr = await bRes.json();
        classesArr = await cRes.json();
        subjectsArr = await sRes.json();
        populateBranchDropdowns();
        populateClassDropdowns();
        populateSubjectDropdowns();
        if(classesArr.length > 0) { document.getElementById('tt-class-filter').value = classesArr[0].id; renderTimetable(); }
    } catch(e) { console.error("Error fetching classes/subjects", e); }
}

function populateBranchDropdowns() {
    const opts = branchesArr.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    document.getElementById('new-class-branch').innerHTML = `<option value="">Select a Branch</option>` + opts;
}

function populateClassDropdowns() {
    const opts = classesArr.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.getElementById('student-class').innerHTML = opts;
    document.getElementById('slot-class').innerHTML = opts;
    document.getElementById('tt-class-filter').innerHTML = `<option value="">Select a Class Section</option>` + opts;
}

function populateSubjectDropdowns() {
    const opts = subjectsArr.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('slot-subject').innerHTML = opts;
    document.getElementById('att-subject-id').innerHTML = opts;
    document.getElementById('marks-subject').innerHTML = `<option value="">-- Choose Subject --</option>` + opts;
}

window.renderTimetable = async function() {
    const cid = document.getElementById('tt-class-filter').value;
    const tBody = document.getElementById('timetable-body');
    if(!cid) { tBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Select a Class to view the schedule.</td></tr>'; return; }
    
    try {
        const res = await fetch(`${API_BASE_URL}/timetable/class/${cid}`);
        timetableSlots = await res.json();
        
        tBody.innerHTML = '';
        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
        const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
        
        days.forEach(day => {
            let row = `<tr><td style="font-weight:700;">${day.substring(0,3)}</td>`;
            times.forEach(tCode => {
                const slot = timetableSlots.find(s => s.dayOfWeek === day && s.startTime === (tCode + ":00"));
                if(slot) {
                    row += `<td><div class="tt-slot"><div class="subj">${slot.subject.name}</div><button onclick="deleteSlot(${slot.id})" class="btn btn-sm text-danger" style="background:none;border:none;padding:0;font-size:10px;"><i class="fa-solid fa-trash"></i></button></div></td>`;
                } else {
                    row += `<td style="color:#e5e7eb; font-size:12px;">Free</td>`;
                }
            });
            row += `</tr>`;
            tBody.innerHTML += row;
        });
        
    } catch(e) { tBody.innerHTML = '<tr><td colspan="9" class="text-danger text-center">Failed to load Timetable</td></tr>'; }
}

window.deleteSlot = async function(id) {
    if(!confirm('Clear this slot?')) return;
    await fetch(`${API_BASE_URL}/timetable/${id}`, { method: 'DELETE' });
    renderTimetable();
}

function renderClassSummaries() {
    const container = document.getElementById('class-summary-container');
    container.innerHTML = '';
    
    if(classesArr.length === 0) {
        container.innerHTML = '<p>No classes available to construct summaries.</p>';
        return;
    }
    
    classesArr.forEach(c => {
        const classStudents = students.filter(s => s.classSection && s.classSection.id === c.id);
        const classAttList = attendanceRecords.filter(a => classStudents.some(cs => cs.id === (a.student ? a.student.id : -1)));
        
        let attScore = 0;
        if(classAttList.length > 0) {
            const pres = classAttList.filter(a => a.status === 'PRESENT').length;
            attScore = Math.round((pres / classAttList.length) * 100);
        }
        
        container.innerHTML += `
            <div class="summary-card-v4 fade-in-up">
                <h3>${c.name}</h3>
                <p>${classStudents.length} Students</p>
                <div class="progress-ring-container" style="background: conic-gradient(var(--secondary) ${attScore}%, var(--surface) 0%);">
                    <div class="progress-inner">${attScore}%</div>
                </div>
                <p style="font-size:12px; font-weight:600;">Overall Attendance</p>
            </div>
        `;
    });
}

// ----- Dashboard Widgets (Clock & Calendar) -----
function initClock() {
    setInterval(() => {
        const d = new Date();
        document.getElementById('live-time').textContent = d.toLocaleTimeString('en-US', {hour12: false});
        document.getElementById('live-date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    }, 1000);
}

window.changeMonth = function(delta) { currentMonthOffset += delta; renderCalendar(); }

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    document.getElementById('calendar-month').textContent = targetMonth.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
    
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
    const firstDayIndex = targetMonth.getDay();
    
    for(let i=0; i<firstDayIndex; i++) grid.innerHTML += `<div class="calendar-day empty"></div>`;
    
    for(let i=1; i<=daysInMonth; i++) {
        const isToday = (currentMonthOffset === 0 && i === now.getDate());
        
        // V4: Highlight Holidays vs Events
        const dtStr = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const hasEvent = events.find(ev => ev.eventDate === dtStr);
        let indicator = '';
        if(hasEvent) {
            indicator = hasEvent.description.toLowerCase().includes('holiday') ? '<span style="color:var(--danger);font-size:8px;position:absolute;top:2px;">●</span>' : '<span style="color:var(--secondary);font-size:8px;position:absolute;top:2px;">●</span>';
        }
        
        grid.innerHTML += `<div style="position:relative;" class="calendar-day ${isToday ? 'active' : ''}">${indicator}${i}</div>`;
    }
}

async function fetchEvents() {
    try {
        const res = await fetch(`${API_BASE_URL}/events`);
        events = await res.json();
        renderEvents();
        renderCalendar(); // Re-render calendar so dots show up
    } catch(e) { console.error(e); }
}

function renderEvents() {
    const list = document.getElementById('events-list');
    list.innerHTML = '';
    if(events.length === 0) { list.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:8px;">No upcoming events.</p>'; return; }
    
    [...events].sort((a,b) => new Date(a.eventDate) - new Date(b.eventDate)).forEach(ev => {
        const dateObj = new Date(ev.eventDate);
        list.innerHTML += `
            <div class="event-item fade-in-up">
                <div class="event-date-box">
                    <span class="event-month">${dateObj.toLocaleString('en-US', {month:'short'})}</span>
                    <span class="event-day">${dateObj.getDate()}</span>
                </div>
                <div class="event-details">
                    <h4>${ev.title}</h4>
                    <p>${ev.description}</p>
                </div>
            </div>
        `;
    });
}

// ----- AI Integration -----
window.toggleChat = function() {
    const w = document.getElementById('ai-chat-window');
    w.style.display = w.style.display === 'none' ? 'flex' : 'none';
}

window.sendChatQuery = async function() {
    const input = document.getElementById('chat-input');
    const val = input.value.trim();
    if(!val) return;
    input.value = '';
    
    const body = document.getElementById('chat-body');
    body.innerHTML += `<div class="msg user-msg fade-in-up">${val}</div>`;
    body.scrollTop = body.scrollHeight;
    
    try {
        const res = await fetch(`${API_BASE_URL}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({query: val}) });
        const data = await res.json();
        body.innerHTML += `<div class="msg ai-msg fade-in-up">${data.response}</div>`;
        body.scrollTop = body.scrollHeight;
    } catch(e) {
        body.innerHTML += `<div class="msg ai-msg fade-in-up" style="color:var(--danger)">Network error reaching Admin AI.</div>`;
        body.scrollTop = body.scrollHeight;
    }
}

async function fetchAIReminders() {
    try {
        const res = await fetch(`${API_BASE_URL}/ai/reminders`);
        const rems = await res.json();
        rems.forEach((r, idx) => { setTimeout(() => showToast(`AI Alert: ${r}`, 'error'), 1000 + (idx*2000)); });
    } catch(e) {}
}

// ----- Core Data -----
async function fetchStudents() {
    try {
        const res = await fetch(`${API_BASE_URL}/students`);
        students = await res.json();
        renderStudentsTable();
        populateStudentDropdowns();
        updateDashboardStats();
    } catch (e) { showToast('Error fetching students', 'error'); }
}

async function fetchAttendance() {
    try {
        const res = await fetch(`${API_BASE_URL}/attendance`);
        attendanceRecords = await res.json();
        renderAttendanceTable(attendanceRecords);
        updateDashboardStats();
    } catch (e) { showToast('Error fetching attendance', 'error'); }
}

async function fetchFeedbacks() {
    try {
        const res = await fetch(`${API_BASE_URL}/feedback`);
        feedbacks = await res.json();
        renderFeedbacks();
    } catch (e) {}
}

async function fetchLeaves() {
    try {
        const res = await fetch(`${API_BASE_URL}/leaves`);
        leavesArr = await res.json();
        renderLeavesTable();
    } catch (e) { showToast('Error fetching leaves', 'error'); }
}

function updateDashboardStats() {
    document.getElementById('stat-total-students').textContent = students.length;
    document.getElementById('stat-total-attendance').textContent = attendanceRecords.length;
}

// ----- Renderers -----
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active')); item.classList.add('active');
            pageTitle.textContent = item.textContent.trim();
            const targetId = item.getAttribute('data-target');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if(targetId === 'dashboard-view') updateDashboardStats();
            if(targetId === 'students-view') fetchStudents();
            if(targetId === 'attendance-view') fetchAttendance();
            if(targetId === 'class-summary-view') renderClassSummaries();
            if(targetId === 'classes-view') renderTimetable();
            if(targetId === 'leaves-view') fetchLeaves();
        });
    });
}

function renderStudentsTable() {
    const tbody = document.querySelector('#students-table tbody'); tbody.innerHTML = '';
    if (students.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No students found.</td></tr>'; return; }
    students.forEach(s => {
        tbody.innerHTML += `<tr><td>#${s.id}</td><td style="font-weight: 500;">${s.name}</td><td>${s.email}</td><td>${s.classSection ? s.classSection.name : 'Unknown'}</td><td><button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`;
    });
}

function renderAttendanceTable(records) {
    const tbody = document.querySelector('#attendance-table tbody'); tbody.innerHTML = '';
    if (records.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No attendance records found.</td></tr>'; return; }
    records.reverse().forEach(r => {
        const b = r.status === 'PRESENT' ? '<span class="badge present">Present</span>' : '<span class="badge absent">Absent</span>';
        tbody.innerHTML += `<tr><td>#${r.id}</td><td style="font-weight:500;">${r.student ? r.student.name : '?'}</td><td>${r.date}</td><td>${b}</td></tr>`;
    });
}

function renderFeedbacks() {
    const list = document.getElementById('feedback-list'); list.innerHTML = '';
    [...feedbacks].reverse().forEach(fb => {
        const dt = new Date(fb.submitDate).toLocaleString();
        list.innerHTML += `<div class="feedback-item ${fb.type === 'College' ? 'college' : 'app'}"><div class="fb-header"><span class="fb-name">${fb.name || 'Anonymous'} - <span class="badge ${fb.type === 'College' ? 'absent' : 'present'}">${fb.type}</span></span><span class="fb-date">${dt}</span></div><div class="fb-msg">${fb.message}</div></div>`;
    });
}

function renderLeavesTable() {
    const tbody = document.querySelector('#leaves-table tbody'); tbody.innerHTML = '';
    if (leavesArr.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">No leave requests found.</td></tr>'; return; }
    leavesArr.reverse().forEach(l => {
        const badgeClass = l.status === 'APPROVED' ? 'present' : (l.status === 'REJECTED' ? 'absent' : 'warning');
        tbody.innerHTML += `
            <tr>
                <td>#${l.id}</td>
                <td>${l.student ? l.student.name : 'Unknown'}</td>
                <td>${l.startDate} to ${l.endDate}</td>
                <td>${l.reason}</td>
                <td><span class="badge ${badgeClass}">${l.status}</span></td>
                <td>
                    ${l.status === 'PENDING' ? `
                        <button class="btn btn-success btn-sm" onclick="approveLeave(${l.id})">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="rejectLeave(${l.id})">Reject</button>
                    ` : '-'}
                </td>
            </tr>`;
    });
}

window.approveLeave = async function(id) {
    if(!confirm('Approve this leave? Attendance will be auto-marked.')) return;
    const res = await fetch(`${API_BASE_URL}/leaves/${id}/approve`, { method: 'PUT' });
    if(res.ok) { showToast('Leave Approved'); fetchLeaves(); }
}

window.rejectLeave = async function(id) {
    if(!confirm('Reject this leave?')) return;
    const res = await fetch(`${API_BASE_URL}/leaves/${id}/reject`, { method: 'PUT' });
    if(res.ok) { showToast('Leave Rejected'); fetchLeaves(); }
}

function populateStudentDropdowns() {
    const opts = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('att-student-id').innerHTML = opts;
    document.getElementById('filter-student').innerHTML = `<option value="all">All Students</option>` + opts;
    document.getElementById('details-select-student').innerHTML = `<option value="">-- Select a student --</option>` + opts;
    document.getElementById('marks-student-id').innerHTML = `<option value="">-- Select a student --</option>` + opts;
}

window.loadStudentDetails = async function() {
    const sid = document.getElementById('details-select-student').value;
    const card = document.getElementById('student-details-card');
    if(!sid) { card.style.display = 'none'; return; }
    
    const s = students.find(x => x.id == sid);
    if(s) {
        document.getElementById('det-name').textContent = s.name;
        document.getElementById('det-email').textContent = s.email;
        document.getElementById('det-class').textContent = s.classSection ? s.classSection.name : 'No Class';
        document.getElementById('det-cgpa').textContent = s.cgpa ? s.cgpa : 'N/A';
        
        const mLog = attendanceRecords.filter(r => r.student && r.student.id == sid);
        const pres = mLog.filter(r => r.status === 'PRESENT').length;
        document.getElementById('det-att-score').textContent = mLog.length === 0 ? '0%' : Math.round((pres / mLog.length) * 100) + '%';

        const tb = document.getElementById('det-subjects-body');
        try {
            const res = await fetch(`${API_BASE_URL}/students/${sid}/subjects`);
            const sms = await res.json();
            tb.innerHTML = sms.length === 0 ? '<tr><td colspan="2">No subjects.</td></tr>' : sms.map(x => `<tr><td>${x.subjectName}</td><td>${x.marks}%</td></tr>`).join('');
        } catch(e) { tb.innerHTML = '<tr><td colspan="2" class="text-danger">Failed to load</td></tr>'; }
        card.style.display = 'block';
    }
}

// ----- Modals & Forms -----
window.openModal = function(id) { document.getElementById(id).classList.add('active'); if(id==='mark-attendance-modal') document.getElementById('att-date').valueAsDate=new Date(); }
window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); }
window.showToast = function(msg, type='success') {
    const c = document.getElementById('toast-container'); const t = document.createElement('div');
    t.className = `toast ${type}`; t.innerHTML = `<i class="fa-solid ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i> <span>${msg}</span>`;
    c.appendChild(t); setTimeout(() => { t.style.animation = 'fadeInUp 0.3s ease reverse forwards'; setTimeout(() => t.remove(), 300); }, Math.max(3000, msg.length*100)); // longer for big AI errors
}

// ----- Setup Listeners -----
function setupForms() {
    document.getElementById('add-slot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
             const res = await fetch(`${API_BASE_URL}/timetable`, {
                 method: 'POST', headers: {'Content-Type':'application/json'},
                 body: JSON.stringify({ 
                    classSection: {id: document.getElementById('slot-class').value },
                    subject: {id: document.getElementById('slot-subject').value },
                    dayOfWeek: document.getElementById('slot-day').value,
                    startTime: document.getElementById('slot-time').value + ":00",
                    endTime: (parseInt(document.getElementById('slot-time').value.split(':')[0]) + 1).toString().padStart(2, '0') + ":00:00"
                 })
             });
             if(res.ok) { showToast('Slot assigned!'); closeModal('add-slot-modal'); renderTimetable(); } else throw new Error();
        } catch(err) { showToast('Error assigning', 'error'); }
    });

    document.getElementById('add-student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: document.getElementById('student-name').value, 
                    email: document.getElementById('student-email').value,
                    classSection: {id: document.getElementById('student-class').value }
                })
            });
            if (res.ok) { showToast('Student added'); closeModal('add-student-modal'); document.getElementById('add-student-form').reset(); fetchStudents(); } else throw new Error();
        } catch (e) { showToast('Failed to add student', 'error'); }
    });

    document.getElementById('mark-attendance-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cs = document.querySelector('input[name="att-status"]:checked');
        if(!cs) return;
        try {
            const res = await fetch(`${API_BASE_URL}/attendance`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    student: { id: document.getElementById('att-student-id').value }, 
                    subject: { id: document.getElementById('att-subject-id').value },
                    date: document.getElementById('att-date').value, 
                    status: cs.value 
                })
            });
            if (res.ok) { showToast('Attendance recorded'); closeModal('mark-attendance-modal'); fetchAttendance(); } 
            else { const err = await res.json(); showToast(err.ai_error || 'Error marking attendance', 'error'); }
        } catch (e) { showToast('Network Error', 'error'); }
    });
    
    document.getElementById('upload-marks-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const sid = document.getElementById('marks-student-id').value;
        const subjId = document.getElementById('marks-subject').value;
        const subjName = subjectsArr.find(x => x.id == subjId).name; // Translate logic since API uses names still
        const score = document.getElementById('marks-score').value;
        const cgpa = document.getElementById('marks-cgpa').value;
        const remarks = document.getElementById('marks-remarks').value;

        try {
            await fetch(`${API_BASE_URL}/students/${sid}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectName: subjName, marks: parseFloat(score) }) });
            if (cgpa || remarks) await fetch(`${API_BASE_URL}/students/${sid}/marks`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cgpa: cgpa ? parseFloat(cgpa) : null, remarks: remarks }) });
            const ac = document.querySelector('input[name="quick-att"]:checked');
            if (ac) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                const attRes = await fetch(`${API_BASE_URL}/attendance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student: { id: sid }, date: localISOTime, status: ac.value }) });
                if(!attRes.ok) { const err = await attRes.json(); showToast(err.ai_error || 'Attendance rejected by Validation AI.', 'error'); } else { fetchAttendance(); }
            }
            showToast('Metrics uploaded!'); document.getElementById('upload-marks-form').reset(); fetchStudents();
        } catch(err) { showToast('Upload error', 'error'); }
    });
    
    // Quick rest definitions
    document.getElementById('profile-form').addEventListener('submit', async (e) => { e.preventDefault(); const res = await fetch(`${API_BASE_URL}/auth/profile/${localStorage.getItem('auth_token')}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: document.getElementById('profile-username').value, password: document.getElementById('profile-password').value, profilePicBase64: document.getElementById('profile-base64').value}) }); if(res.ok){ showToast('Profile updated!'); fetchProfile(); closeModal('profile-modal'); } });
    document.getElementById('add-event-form').addEventListener('submit', async (e) => { e.preventDefault(); await fetch(`${API_BASE_URL}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: document.getElementById('event-title').value, eventDate: document.getElementById('event-date').value, description: document.getElementById('event-desc').value }) }); showToast('Event created!'); closeModal('add-event-modal'); document.getElementById('add-event-form').reset(); fetchEvents(); });
    document.getElementById('add-class-form').addEventListener('submit', async (e) => { e.preventDefault(); await fetch(`${API_BASE_URL}/classes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('new-class-name').value, branch: { id: document.getElementById('new-class-branch').value } }) }); showToast('Class added!'); closeModal('add-class-modal'); document.getElementById('add-class-form').reset(); fetchClassesAndSubjects(); });
    document.getElementById('add-subject-form').addEventListener('submit', async (e) => { e.preventDefault(); await fetch(`${API_BASE_URL}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('new-subject-name').value }) }); showToast('Subject added!'); closeModal('add-subject-modal'); document.getElementById('add-subject-form').reset(); fetchClassesAndSubjects(); });
    document.getElementById('add-branch-form').addEventListener('submit', async (e) => { e.preventDefault(); await fetch(`${API_BASE_URL}/branches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('new-branch-name').value }) }); showToast('Branch added!'); closeModal('add-branch-modal'); document.getElementById('add-branch-form').reset(); fetchClassesAndSubjects(); });
    document.getElementById('feedback-form').addEventListener('submit', async (e) => { e.preventDefault(); await fetch(`${API_BASE_URL}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('fb-name').value, type: document.getElementById('fb-type').value, message: document.getElementById('fb-message').value }) }); showToast('Feedback submitted!'); document.getElementById('feedback-form').reset(); fetchFeedbacks(); });
}

window.exportToExcel = function() {
    let csv = "ID,Name,Email,Class\n";
    students.forEach(s => {
        csv += `${s.id},"${s.name}",${s.email},"${s.classSection ? s.classSection.name : 'N/A'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Roster_${new Date().toLocaleDateString()}.csv`;
    a.click();
    showToast('Excel/CSV export completed!');
}

window.exportToPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Attendance Management System - Student Roster", 14, 15);
    const data = students.map(s => [s.id, s.name, s.email, s.classSection ? s.classSection.name : 'N/A']);
    doc.autoTable({
        startY: 20,
        head: [['ID', 'Name', 'Email', 'Class']],
        body: data,
    });
    doc.save(`Student_Roster_${new Date().toLocaleDateString()}.pdf`);
    showToast('PDF export completed!');
}

window.toggleTheme = function() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if(isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        document.querySelector('#theme-toggle i').className = 'fa-solid fa-moon';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.querySelector('#theme-toggle i').className = 'fa-solid fa-sun';
    }
}
