'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var $ = require('gulp-load-plugins')();
var include = require('gulp-html-tag-include');

var basePath = 'www/';
var distPath = 'dist/'
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
    .pipe(gulp.dest(basePath + 'css'));

});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(basePath +'js/main.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

//Optimiza imagenes en formato PNG y JPG
gulp.task('images', function () {
    return gulp.src([basePath +'images/**/*.png', basePath +'images/**/*.jpg', basePath +'images/**/*.jpeg'])
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(distPath +'images/'));
});

//Concatena y minifica JS
gulp.task('scripts', function(){
  gulp.src([
    //Agregar los js correspondientes
    basePath +'js/libs/jquery.js',
    basePath +'js/libs/modernizr.js',
    basePath +'js/libs/ninjaSlider.js',
    basePath +'js/main.js'
  ])
  .pipe($.newer('.tmp/scripts'))
  .pipe(gulp.dest('.tmp/scripts'))
  .pipe($.concat('main.min.js'))
  .pipe($.uglify({preserveComments: 'some'}))
  .pipe($.size({title: 'scripts'}))
  .pipe(gulp.dest(distPath +'js/'))
});

gulp.task('html', function(){
  return gulp.src(basePath + '**/*.html')
    // Remove any unused CSS
    .pipe($.if('*.css', $.uncss({
      html: [
        basePath + '**/*.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: ['equal']
    })))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest(distPath));
});

//Incluye archivos html, por ejemplo: <include src="shared/header.html"></include>
gulp.task('html-include', function() {
  return gulp.src(basePath + '**/*.html')
    .pipe(include())
    .pipe(gulp.dest(basePath));
});

//Tarea que escucha los SCSS y HTML, Tarea para trabajar producción
gulp.task('default', ['styles', 'html-include'], function () {
  browserSync({
    notify: false,
    server: ['.tmp', basePath]
  });

  gulp.watch([basePath +'**/*.html'], ['html-include', reload]);
  gulp.watch([basePath +'sass/**/*.scss'], ['styles', reload]);
  gulp.watch([basePath +'js/main.js'], ['jshint', reload]);
  gulp.watch([basePath +'images/**/*'], reload);
});

//Tarea que genera el entregable en la carpeta dist
gulp.task('deploy', ['images', 'scripts', 'html'], function(){
  var filesToMove = [
      basePath + 'css/**/*.css',
      basePath + 'css/fonts/**/*.css'
  ];
  gulp.src(filesToMove, {
    dot: true,
    base: basePath
  })
  .pipe(gulp.dest(distPath));
});

