'use strict';

import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import babel from 'gulp-babel';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const basePath = 'www/';
const distPath = 'dist/'; 

gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src([
    basePath +'sass/main.scss'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(basePath +'css'))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('lint', () => {
  gulp.src([basePath +'js/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
});

gulp.task('scripts', () => {
  gulp.src([
    basePath +'js/main.js'
  ])
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest(basePath +'js/build'));
});

gulp.task('default', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', basePath],
    port: 3000
  });

  gulp.watch([basePath +'**/*.html'], ['scripts', reload]);
  gulp.watch([basePath +'sass/**/*.scss'], ['styles', 'scripts', reload]);
  gulp.watch([basePath +'js/main.js'], ['scripts', reload]);
});