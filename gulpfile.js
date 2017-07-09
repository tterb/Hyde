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
// const electronVersion = config.devDependencies['electron'].match(/[\d.]+/)[0];

const projectDir = jetpack;
const srcDir = jetpack.cwd('./');
const destDir = jetpack.cwd('./');

const options = {
	asar: true,
	dir: '.',
	icon: './img/icon.icns',
	name: 'Hyde MD',
	out: 'dist',
	overwrite: true,
	prune: true,
	// version: electronVersion,
	'app-version': appVersion
};

gulp.task('liveReload', () => {
	electron.start();
	//Watch js files and restart Electron if they change
	gulp.watch(['./js/*.js'], electron.restart);
	//watch css files, but only reload (no restart necessary)
	gulp.watch(['./css/*.css'], electron.reload);
	//watch html
	gulp.watch(['./index.html'], electron.reload);
});


gulp.task('compile-scss', () => {
    gulp.src(
            "css/*.scss"
        ).pipe(scss(
            {"bundleExec": true}
        )).pipe(gulp.dest("css/style.css"));
});

gulp.task('scss', () => {
  return gulp.src(srcDir.path('css/style.scss'))
  .pipe(plumber())
  .pipe(scss())
  .pipe(gulp.dest(destDir.path('css')));
});

gulp.task('build:osx', (done) => {
	options.arch = 'x64';
	options.platform = 'darwin';
	options['app-bundle-id'] = 'com.brettstevenson.hyde-md';
	options['helper-bundle-id'] = 'com.brettstevenson.hyde-md.helper';

	packager(options, (err, paths) => {
		if (err) {
			console.error(err);
		}

		done();
	});
});

gulp.task('build:linux', () => {
	// @TODO
});

gulp.task('build:windows', () => {
	// @TODO
});

gulp.task('build', ['build:osx', 'build:linux', 'build:windows', 'compile-scss']);

gulp.task('watch', ['scss', 'liveReload']);
