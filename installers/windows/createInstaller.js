const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
     .then(createWindowsInstaller)
     .catch((err) => {
     console.error(err.message || err)
     process.exit(1)
 })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release')

    return Promise.resolve({
       appDirectory: path.join(outPath, 'Hyde-win32-ia32/'),
       authors: 'Brett Stevenson',
       noMsi: true,
       outputDirectory: path.join(outPath, 'windows-installer'),
       exe: 'Hyde.exe',
       setupExe: 'HydeInstaller.exe',
       setupIcon: path.join(rootPath, 'img', 'icon', 'ico', 'icon.ico')
   })
}
