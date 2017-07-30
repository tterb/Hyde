var gulp = require('gulp'),
    shell = require('gulp-shell'),
    minifyHTML = require('gulp-minify-html'),
    sass = require('gulp-sass'),
    importCss = require('gulp-import-css'),
    autoprefixer = require('gulp-autoprefixer'),
    uncss = require('gulp-uncss'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    glob = require('glob'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    jpegtran = require('imagemin-jpegtran'),
    gifsicle = require('imagemin-gifsicle'),
    optipng = require('imagemin-optipng'),
    rsync = require('gulp-rsync'),
    replace = require('gulp-replace'),
    fs = require('fs'),
    concat = require('gulp-concat-util'),
    uncss = require('gulp-uncss'),
    minifyCSS = require('gulp-minify-css'),
    critical = require('critical');

// Jekyll
gulp.task('jekyll', function() {
  return gulp.src('index.html', { read: false })
    .pipe(shell(['jekyll build']));
});

// HTML
gulp.task('optimize-html', function() {
    return gulp.src('_site/**/*.html')
        .pipe(minifyHTML({
            quotes: true
        }))
        .pipe(replace(/<link href=\"\/css\/style.scss\"[^>]*>/, function(s) {
            var style = fs.readFileSync('_site/css/style.scss', 'utf8');
            return '<style>\n' + style + '\n</style>';
        }))
        .pipe(gulp.dest('_site/'));
});

// Javascript
gulp.task('javascript', ['jekyll'], function() {
    return gulp.src('js/main.js', { read: false })
        .pipe(shell(['jspm install']))
        .pipe(shell(['jspm bundle-sfx js/main _site/js/min.js --minify --no-mangle']));
});

// CSS
gulp.task('optimize-css', function() {
   return gulp.src('_site/css/style.scss')
       .pipe(autoprefixer())
       .pipe(uncss({
           html: ['_site/**/*.html'],
           ignore: []
       }))
       .pipe(minifyCss({keepBreaks: false}))
       .pipe(gulp.dest('_site/css/'));
});

// Eliminate render-blocking CSS
gulp.task('include-css', function() {
  return gulp.src('_site/**/*.html')
    .pipe(replace(/<link href=\"\/css\/style.scss\"[^>]*>/, function(s) {
      var style = fs.readFileSync('_site/css/style.scss', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(gulp.dest('_site/'));
});

// Eliminate render-blocking CSS in above-the-fold content
gulp.task('styles:critical', function() {
    return gulp.src('src/styles/critical.css')
    .pipe(minifyCSS())
    .pipe(concat.header('<style>'))
    .pipe(concat.footer('</style>'))
    .pipe(rename({
        basename: 'criticalCSS',
        extname: '.html'
      }))
    .pipe(gulp.dest('_includes/'));
});

// Optimize Images
gulp.task('optimize-images', function () {
    return gulp.src(['_site/**/*.jpg', '_site/**/*.jpeg', '_site/**/*.gif', '_site/**/*.png'])
        .pipe(imagemin({
            progressive: false,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant(), jpegtran(), gifsicle()]
        }))
        .pipe(gulp.dest('_site/'));
});

// Purge cache
// gulp.task('purge-cache', function() {
// 	var options = {
// 		token: config.cloudflareToken,
// 		email: config.cloudflareEmail,
// 		domain: config.cloudflareDomain
// 	};
// 	cloudflare(options);
// });

// Remove unused CSS
gulp.task('uncss', function() {
  return gulp.src([
      'css/style.scss'
      // 'node_modules/bootstrap/dist/css/bootstrap-theme.css'
    ])
    .pipe(uncss({
      html: [
        'http://127.0.0.1:4000/',
        'http://127.0.0.1:4000/blog/',
        'http://127.0.0.1:4000/archive/',
        'http://127.0.0.1:4000/contact/',
        'http://127.0.0.1:4000/credits/'
      ]
    }))
    .pipe(gulp.dest('css/uncss/'));
});

// // Deployment
// gulp.task('sync', function() {
//     return gulp.src(['_site/**'])
//         .pipe(rsync({
//             root: '_site',
//             hostname: '',
//             username: '',
//             destination: 'public_html',
//             incremental: true,
//             exclude: []
//         }));
// });

// Run (Default)
gulp.task('default', ['javascript', 'optimize-css', 'include-css',  'optimize-html', 'styles:critical']);

gulp.task('clean', ['uncss']);
// Run
gulp.task('build', ['javascript', 'optimize-css', 'include-css',  'optimize-html', 'styles:critical']);
