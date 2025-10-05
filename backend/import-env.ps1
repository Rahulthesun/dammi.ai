
#RUN THIS POWER SHELL SCRIPT FROM THE BACKEND DIRECTORY TO IMPORT ENV VARIABLES TO FLY.IO

# Path to your .env file
$envFile = ".env"

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        # Set the secret in Fly
        fly secrets set $line
    }
}
Write-Host "Environment variables from $envFile have been set in Fly."