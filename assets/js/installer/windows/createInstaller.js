const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');

getInstallerConfig()
     .then(createWindowsInstaller)
     .catch((err) => {
     console.error(err.message || err);
     process.exit(1);
 });

function getInstallerConfig () {
    console.log('creating windows installer');
    const rootPath = path.join('./');
    const outPath = path.join(rootPath, 'dist/');

    return Promise.resolve({
       appDirectory: path.join(outPath, 'Hyde-win32-ia32/'),
       authors: 'Brett Stevenson',
       noMsi: true,
       outputDirectory: path.join(outPath, 'assets','installers','hyde-win-installer'),
       exe: 'Hyde.exe',
       setupExe: 'HydeInstaller.exe',
       setupIcon: path.join(rootPath, 'assets','img','icon','ico','icon.ico')
   });
}
