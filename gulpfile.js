'use strict';

const fs = require('fs');
const gulp = require('gulp');
const scss = require('gulp-scss');
const packager = require('electron-packager');
const electron = require('electron-connect').server.create();
const plumber = require('gulp-plumber');
const jetpack = require('fs-jetpack');
const config = JSON.parse(fs.readFileSync('package.json'));
const appVersion = config.version;
const cp = require('child_process');
const shell = require('gulp-shell');
// const electronVersion = config.devDependencies['electron'].match(/[\d.]+/)[0];

const projectDir = jetpack;
const srcDir = jetpack.cwd('./');
const destDir = jetpack.cwd('./');

const options = {
	asar: true,
	dir: '.',
	name: 'Hyde',
	out: 'dist',
	overwrite: true,
	prune: true,
	// version: electronVersion,
	'app-version': appVersion
};

gulp.task('launch', () => {
	electron.start();
});

gulp.task('liveReload', () => {
	electron.start();
	//Watch js files and restart Electron if they change
	gulp.watch(['./*.js'], electron.restart);
	gulp.watch(['./js/**/*.js'], electron.restart);
	//watch css files, but only reload (no restart necessary)
	gulp.watch(['./css/*.css'], electron.reload);
	gulp.watch(['./css/**/*.css'], electron.reload);
    gulp.watch(['./**/*.scss'], ['scss']);
	//watch html
	gulp.watch(['./index.html'], electron.reload);
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

gulp.task('build:windows', () => {
	options.arch = 'x64';
	options.platform = 'win';
	options.icon = './img/icon/icon.ico';
	options['app-bundle-id'] = 'com.brettstevenson.hyde';
	options['helper-bundle-id'] = 'com.brettstevenson.hyde.helper';
	packager(options, (err, paths) => {
		if (err) { console.error(err); }
		done();
	});
});

gulp.task('build:osx', (done) => {
	options.arch = 'x64';
	options.platform = 'darwin';
	options.icon = './img/icon/icon.icns';
	options['app-bundle-id'] = 'com.brettstevenson.hyde';
	options['helper-bundle-id'] = 'com.brettstevenson.hyde.helper';
	packager(options, (err, paths) => {
		if (err) { console.error(err); }
		done();
	});
});


gulp.task('start', ['scss', 'launch']);

gulp.task('watch', ['scss', 'liveReload']);

gulp.task('build', ['build:osx', 'build:linux', 'build:windows', 'compile-scss']);
