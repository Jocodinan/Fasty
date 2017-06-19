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
    basePath + 'js/libs/jquery.js',
    basePath +'js/main.js'
  ])
  .pipe($.sourcemaps.init())
  .pipe(babel({
      presets: ['es2015']
  }))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest('.tmp/scripts'))
  .pipe($.concat('main.js'))
  .pipe($.size({title: 'scripts'}))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(basePath +'js/build'))
  .pipe(gulp.dest('.tmp/scripts'));

});

gulp.task('default', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    scrollElementMapping: ['main', '.mdl-layout'],
    server: ['.tmp', basePath],
    port: 3000
  });

  gulp.watch([basePath +'**/*.html'], ['scripts', reload]);
  gulp.watch([basePath +'sass/**/*.scss'], ['styles', 'scripts', reload]);
  gulp.watch([basePath +'js/main.js'], ['scripts', reload]);
});

gulp.task('html', () => {
  return gulp.src(basePath +'**/*.html')
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
          .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
          .pipe(gulp.dest(distPath));
});

gulp.task('images', () =>
  gulp.src(basePath +'images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(distPath + 'images'))
    .pipe($.size({title: 'images'}))
);

gulp.task('copy', () => {
  gulp.src([
    basePath + '*',
    '!'+ basePath +'/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest(distPath))
    .pipe($.size({title: 'copy'}))
});

gulp.task('build', ['html', 'images'],() => {
  //Scripts
  gulp.src([
    basePath +'js/build/main.js'
  ])
  .pipe($.uglify())
  .pipe(gulp.dest(distPath +'js/build'));

  //Styles
  gulp.src([
    basePath +'css/main.css'
  ])
  .pipe(gulp.dest(distPath +'css/'));

  //Fonts
  gulp.src([
    basePath +'css/fonts/**/*.*'
  ])
  .pipe(gulp.dest(distPath +'css/fonts/'));

});