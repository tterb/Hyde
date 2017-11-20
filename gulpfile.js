'use strict';
const gulp = require('gulp');
const fs = require('fs');
const sass = require('gulp-sass');
const process = require('process');
const rebuild = require('electron-rebuild');
const packager = require('electron-packager');
const electron = require('electron-connect').server.create();
const config = JSON.parse(fs.readFileSync('package.json'));
const exec = require('child_process').exec;
const appVersion = config.version;
var electronPackage = require('electron/package.json');
var electronVersion = electronPackage.version;

const options = {
	dir: '.',
	name: 'Hyde',
	out: 'release',
	overwrite: true,
	prune: true,
  asar: false,
	version: electronVersion,
	appVersion: appVersion,
  ignore: [
    '.github/*',
    '*-cache/*',
    '.codeclimate.yml',
    '.travis.yml',
    '.eslint.yml',
    '.sass-lint.yml',
    'frontMatter.yml',
    '*_.*'
  ]
};


gulp.task('launch', () => {
    electron.start('-d');
});

gulp.task('rebuild', () => {
  var arch = process.arch;
  rebuild.default(__dirname, electronVersion, arch)
    .then(() => {
      console.info('Electron Rebuild Successful');
      return true;
    }).catch((e) => {
      log('Rebuilding modules against Electron didn\'t work: ' + e);
    });
});

gulp.task('liveReload', () => {
	electron.start();
	// Watch HTML & JS files and restart Electron if they change
  gulp.watch(['./index.html'], electron.restart);
	gulp.watch(['./*.js'], electron.restart);
	gulp.watch(['./assets/js/*.js'], electron.restart);
  gulp.watch(['./assets/js/**/*.js'], electron.restart);
	// Watch CSS & SCSS files, but only reload (no restart necessary)
	gulp.watch(['./assets/css/*.css'], electron.reload);
	gulp.watch(['./assets/css/**/*.css'], electron.reload);
  gulp.watch(['./assets/sass/*.scss'], ['scss']);
  gulp.watch(['./assets/sass/**/*.scss'], ['scss']);
});

gulp.task('scss', () => {
  gulp.src('./assets/sass/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest('./assets/css/'));
  gulp.src('./assets/sass/preview/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest('./assets/css/preview/'));
});

gulp.task('clean', () => {
  exec('rm -rf ./dist', function (stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});

gulp.task('build:linux', () => {
  options.arch = 'amd64';
  options.platform = 'linux';
  options.icon = '/assets/img/icon/png/256x256.png';
  packager(options, (err) => {
    if(err) console.error(err);
    done();
  });
});

gulp.task('build:win', (done) => {
	options.arch = 'ia32';
	options.platform = 'win32';
	options.icon = '/assets/img/icon/ico/icon.ico';
	packager(options, (err) => {
		if(err) console.error(err);
		done();
	});
});

gulp.task('build:osx', (done) => {
	options.arch = 'x64';
	options.platform = 'darwin';
	options.icon = '/assets/img/icon/icns/icon.icns';
	packager(options, (err) => {
		if(err) console.error(err);
		done();
	});
});


gulp.task('test', ['launch']);
gulp.task('default', ['rebuild', 'scss', 'launch']);
gulp.task('start', ['rebuild', 'scss', 'launch']);
gulp.task('watch', ['rebuild', 'scss', 'liveReload']);
gulp.task('build', ['build:osx', 'build:win', 'build:linux']);
