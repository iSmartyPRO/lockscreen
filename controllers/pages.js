const config = require("../config")
const path = require("path")

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports.home = (req, res) => {
    //let ip = req.socket.remoteAddress === "::1" ? "0.0.0.0" : req.socket.remoteAddress
    //let ip = "192.168.0.1"
    let ip = req.headers['x-real-ip']
    let network = ip.match(/\d*\.\d*\.\d*/)[0]
    let branch = config.branches.filter(branch => {
        let res = branch.network.includes(network)
        return res
    })
    let currentBranch = branch.length ? branch[0] : config.branches[0]
    let randomImage = randomIntFromInterval(0, (currentBranch.images.length) - 1)
    res.sendFile(path.join(__dirname, `../public/images/${currentBranch.images[randomImage]}`))
}

module.exports.script = (req, res) => {
    res.send(`#PowerShell Script for manual launch on local computer<br>
$Script = Invoke-WebRequest '${config.APP_URL}/scriptPowershell'<br>
$ScriptBlock = [Scriptblock]::Create($Script)<br>
Invoke-Command -ScriptBlock $ScriptBlock`)
}

module.exports.scriptPowershell = (req, res) => {
    res.send(`if([Environment]::OSVersion.Version -ge (new-object 'Version' 6,10)) {
$LockScreenSource = "${config.LockScreenSource}"
$LockScreenImageValue = "$LockScreenSource\\lockscreen.jpg"
$RegKeyPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PersonalizationCSP"
$LockScreenPath = "LockScreenImagePath"
$LockScreenStatus = "LockScreenImageStatus"
$LockScreenUrl = "LockScreenImageUrl"
$StatusValue = "1"
if(!(Test-Path $LockScreenSource)) {
    New-Item -Path $LockScreenSource -ItemType Directory -Force  | Out-Null
}
if(!(Test-Path $RegKeyPath)) {
    Write-Host "Creating registry path $($RegKeyPath)."
    New-Item -Path $RegKeyPath -Force | Out-Null
}

if ($LockScreenSource) {
    Write-Host "Creating registry entries for Lock Screen"
    New-ItemProperty -Path $RegKeyPath -Name $LockScreenStatus -Value $StatusValue -PropertyType DWORD -Force | Out-Null
    New-ItemProperty -Path $RegKeyPath -Name $LockScreenPath -Value $LockScreenImageValue -PropertyType STRING -Force | Out-Null
    New-ItemProperty -Path $RegKeyPath -Name $LockScreenUrl -Value $LockScreenImageValue -PropertyType STRING -Force | Out-Null
}
$WebClient = New-Object System.Net.WebClient
$WebClient.DownloadFile("${config.APP_URL}",$LockScreenImageValue)
} else {
    Write-Host Your OS is not supported by this script
}`)
}