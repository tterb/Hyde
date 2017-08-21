'use strict';

const gulp = require('gulp');
const fs = require('fs');
const scss = require('gulp-scss');
const process = require('process');
const rebuild = require('electron-rebuild');
const packager = require('electron-packager');
const electron = require('electron-connect').server.create();
const plumber = require('gulp-plumber');
const jetpack = require('fs-jetpack');
const config = JSON.parse(fs.readFileSync('package.json'));
const appVersion = config.version;
const shell = require('gulp-shell');
const projectDir = jetpack;
const srcDir = jetpack.cwd('./');
const destDir = jetpack.cwd('./');
var electronPackage = require('electron/package.json');
var electronVersion = electronPackage.version;

const options = {
	asar: true,
	dir: '.',
	name: 'Hyde',
	out: 'dist',
	overwrite: true,
	prune: true,
	version: electronVersion,
	'app-version': appVersion
};

gulp.task('launch', () => {
	electron.start();
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
	//Watch js files and restart Electron if they change
	gulp.watch(['./*.js'], electron.restart);
	gulp.watch(['./js/**/*.js'], electron.restart);
	//watch css files, but only reload (no restart necessary)
	gulp.watch(['./css/*.css'], electron.reload);
	gulp.watch(['./**/**/*.css'], electron.reload);
  gulp.watch(['./**/*.scss'], ['scss']);
	//watch html
	gulp.watch(['./index.html'], electron.restart);
});

gulp.task('scss', () => {
  return gulp.src(srcDir.path('css/style.scss'))
  .pipe(plumber())
  .pipe(scss())
  .pipe(gulp.dest(destDir.path('css')));
});

gulp.task('build:linux', () => {
	// @TODO
});

gulp.task('build:win', (done) => {
	options.arch = 'ia32';
	options.platform = 'win32';
	options.icon = './img/icon/icon.ico';
  options.out = 'dist';
  options.prune = true;
  options.asar = true;
	packager(options, (err, paths) => {
		if (err) { console.error(err); }
		done();
	});
});

gulp.task('build:osx', (done) => {
	options.arch = 'x64';
	options.platform = 'darwin';
	options.icon = './img/icon/icon.icns';
  options.out='dist'
  options.prune = true;
  options.asar = true;
	packager(options, (err, paths) => {
		if (err) { console.error(err); }
		done();
	});
});


gulp.task('default', ['rebuild', 'scss', 'launch']);

gulp.task('start', ['rebuild', 'scss', 'launch']);

gulp.task('watch', ['rebuild', 'scss', 'liveReload']);

gulp.task('build', ['build:osx', 'build:linux', 'build:windows', 'compile-scss']);
