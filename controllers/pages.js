const config = require("../config")
const path = require("path")

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomImageByIp(ip){
    let network = ip.match(/\d*\.\d*\.\d*/)[0]
    let branch = config.branches.filter(branch => {
        let res = branch.network.includes(network)
        return res
    })
    let currentBranch = branch.length ? branch[0] : config.branches[0]
    let randomImage = randomIntFromInterval(0, (currentBranch.images.length) - 1)
    return path.join(__dirname, `../public/images/${currentBranch.images[randomImage]}`)
}

module.exports.apply = (req, res) => {
    let {computername} = req.body
    console.log(req.body)
    let find = config.excludeComputers.find(t => t.computername === computername)
    res.json({message:"Check if we can appy it", apply: find ? false : true})
}

module.exports.home = (req, res) => {
    let ip = "192.168.44.1"
    //let ip = req.socket.remoteAddress === "::1" ? "0.0.0.0" : req.socket.remoteAddress
    //let ip = req.headers['x-real-ip']
    res.sendFile(getRandomImageByIp(ip))
}


module.exports.script = (req, res) => {
    res.send(`#PowerShell Script for manual launch on local computer<br>
$Script = Invoke-WebRequest '${config.APP_URL}/scriptPowershell'<br>
$ScriptBlock = [Scriptblock]::Create($Script)<br>
Invoke-Command -ScriptBlock $ScriptBlock<br>`)
}

module.exports.scriptPowershell = (req, res) => {
    res.send(`if([Environment]::OSVersion.Version -ge (new-object 'Version' 6,10)) {
$LockScreenSource = "${config.LockScreenSource}"
$LockScreenImageValue = "$LockScreenSource\\lockscreen.jpg"
$RegKeyPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PersonalizationCSP"
$params = New-Object PSCustomObject -Property @{computername = $env:computername}
$checkApply = (Invoke-WebRequest -Uri "${config.APP_URL}/apply" -Method "POST" -ContentType "application/json" -Body ($params | ConvertTo-Json)).Content | ConvertFrom-Json
if($checkApply.apply) {
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
    if((Test-Path $LockScreenImageValue)) {
        Write-Host "Removing Lockscreen Image"
        Remove-Item -Path $LockScreenImageValue -Force -Confirm:$false | Out-Null
    }
    if((Test-Path $RegKeyPath)) {
        Write-Host "Removing registry path $($RegKeyPath)."
        Remove-Item -Path $RegKeyPath -Force -Confirm:$false | Out-Null
    }
}

} else {
    Write-Host Your OS is not supported by this script
}`)
}