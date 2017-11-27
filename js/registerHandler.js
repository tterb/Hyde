const {ProgId, ShellOption, Regedit} = require('electron-regedit');

// TODO: Register as file-handler

// Register app as a file handler for markdown files
// Allowing users to set Hyde as the default markdown handler
new ProgId({
    description: 'Hyde',
    friendlyAppName: 'Hyde',
    icon: './img/icon/ico/file.ico',
    extensions: ['md','markdown','mdown','mkdn','mkd','mdwn','mdtxt','mdtext'],
    squirrel: false,
    shell: [
        new ShellOption({verb: ShellOption.OPEN}),
        new ShellOption({verb: ShellOption.EDIT, args: ['--edit']}),
        new ShellOption({verb: ShellOption.PRINT, args: ['--print']})
    ]
});

Regedit.installAll()
