'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var $ = require('gulp-load-plugins')();

var basePath = 'www/';
var AUTOPREFIXER_BROWSERS = [
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

//----------------------------------------------------------------------PRODUCCION

//Procesa el SASS en el CSS
gulp.task('styles', function() {

  return gulp.src([
       basePath +'sass/main.scss'
    ])
    .pipe($.newer('.tmp/css'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'css'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('www/css'));

});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(basePath +'js/main.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

//Tarea que escucha los SCSS y HTML, Tarea para trabajar producción
gulp.task('default', ['styles'], function () {
  browserSync({
    notify: false,
    server: ['.tmp', basePath]
  });

  gulp.watch([basePath +'**/*.html'], reload);

  gulp.watch([basePath +'sass/**/*.scss'], ['styles', reload]);

  gulp.watch([basePath +'js/main.js'], ['jshint', reload]);
  gulp.watch([basePath +'images/**/*'], reload);
});

//Optimiza imagenes en formato PNG y JPG
gulp.task('images', function () {
    return gulp.src([basePath +'images/**/*.png', basePath +'images/**/*.jpg'])
        .pipe($.imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(basePath +'images/'));
});

