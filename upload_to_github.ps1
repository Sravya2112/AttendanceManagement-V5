$owner = "Sravya2112"
$repo = "AttendanceManagement-V5"
$token = "github_pat_11BNNHRQI02WW9EWSq7XV1_Fb88FCkLedgn3NrY1SRD7747xQbIr4ToYx3GFc92hZQVRKEBPPUxZv7M"
$baseDir = "c:\Users\maste\Documents\workspace-spring-tools-for-eclipse-5.0.1.RELEASE\AttendanceManagement"

# Get all files, excluding build artifacts and git internal
$files = Get-ChildItem -Path $baseDir -Recurse -File | Where-Object { 
    $_.FullName -notmatch "target|\\.git|\\.mvn|node_modules|\\.settings|\\.project|\\.classpath|\\.factorypath|\\.springBeans|\\.sts4-cache|upload_to_github.ps1" 
}

$pair = "$($owner):$($token)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64Auth = [System.Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "PowerShell-Deployment-Script"
}

foreach ($file in $files) {
    try {
        $relativePath = $file.FullName.Substring($baseDir.Length + 1).Replace("\", "/")
        $contentBytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $base64Content = [System.Convert]::ToBase64String($contentBytes)
        
        $url = "https://api.github.com/repos/$owner/$repo/contents/$relativePath"
        
        # Check if file exists to get SHA
        $fileInfo = $null
        try {
            $fileInfo = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ErrorAction SilentlyContinue
        } catch {}

        $bodyObj = @{
            message = "Deploy $relativePath via API"
            content = $base64Content
        }
        if ($fileInfo -and $fileInfo.sha) {
            $bodyObj.sha = $fileInfo.sha
        }
        
        $bodyJson = $bodyObj | ConvertTo-Json -Depth 10

        Write-Host "Uploading $relativePath..."
        $response = Invoke-RestMethod -Uri $url -Method Put -Body $bodyJson -Headers $headers -ContentType "application/json"
        Write-Host "Successfully uploaded $relativePath"
    } catch {
        Write-Host "Error uploading $relativePath : $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            Write-Host "Error details: $errBody"
        }
    }
}
