(function() {
  'use strict';

  var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gcmq = require('gulp-group-css-media-queries'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    newer = require('gulp-newer'),
    concat = require('gulp-concat'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    notifier = require("node-notifier"),
    gutil = require('gulp-util'),
    cssnano = require('gulp-cssnano'),
    debug = require('gulp-debug'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('gulp-rimraf'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    browserSync = require('browser-sync').create();

  var Paths = {
    build: 'build',
    src: 'src',
    buildImages: 'images',
    srcImages: 'images',
    srcJS: 'js',
    fonts: 'fonts',
    scss: 'scss',
    production: 'production'
  }

  /**
   * Build custom js
   */
  gulp.task('buildCustomJS', function() {
    browserify({ entries: `./${Paths.src}/${Paths.srcJS}/app.js`, debug: true })
      .transform('babelify', { presets: ['es2015'] })
      .bundle().on('error', function(err) {
        showError.apply(this, ['JS error', err])
      })
      .pipe(source('app.js'))
      .pipe(gulp.dest(`./${Paths.build}/`))
      .pipe(browserSync.stream());
  });

  /**
   * Build js vendor (concatenate vendor array)
   */
  gulp.task('buildJsVendors', function() {
    gulp.src(require(`./${Paths.src}/vendor_entries/vendor.js`))
      .pipe(concat('vendor.js'))
      .pipe(uglify())
      .pipe(gulp.dest(`./${Paths.build}/`))
      .pipe(browserSync.stream());
  });

  /**
   * Build styles for application from SASS
   */
  gulp.task('buildSass', function() {
    gulp.src(`./${Paths.src}/${Paths.scss}/app.scss`)
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sass().on('error', function(err) {
        showError.apply(this, ['Sass compile error', err]);
      }))
      .pipe(gcmq())
      .pipe(cssnano({ safe: true }))
      .pipe(autoprefixer('last 3 versions'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(`./${Paths.build}/`))
      .pipe(browserSync.stream());
  });

  /**
   * Build styles for vendor from SASS
   */
  gulp.task('buildStylesVendors', function() {
    gulp.src(`./${Paths.src}/vendor_entries/vendor.scss`)
      .pipe(sass().on('error', function(err) {
        showError.apply(this, ['Sass compile error (vendor)', err]);
      }))
      .pipe(cssnano({ safe: true }))
      .pipe(gulp.dest(`./${Paths.build}/`))
      .pipe(browserSync.stream());
  });

  /**
   * Images minification
   */
  gulp.task('imageMin', function() {
    gulp.src(`./${Paths.src}/${Paths.srcImages}/**/*`)
      .pipe(newer(`${Paths.build}/${Paths.buildImages}/`))
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(`${Paths.build}/${Paths.buildImages}/`))
      .pipe(browserSync.stream());
  });

  /**
   * Clean image build directory
   */
  gulp.task('imageClean', function() {
    gulp.src(`${Paths.build}/${Paths.buildImages}/`).pipe(rimraf());
  });

  /**
   * Watch for file changes
   */
  gulp.task('watch', function() {
    gulp.watch(`./${Paths.src}/${Paths.srcJS}/**/*`, ['buildCustomJS']);
    gulp.watch(`./${Paths.src}/vendor_entries/vendor.js`, ['buildJsVendors']);
    watch(`./${Paths.src}/${Paths.scss}/**/*`, function() {
      gulp.run('buildSass');
    });
    gulp.watch(`./${Paths.src}/vendor_entries/vendor.scss`, ['buildStylesVendors']);
    watch(`./${Paths.src}/${Paths.srcImages}/**/*`, function() {
      gulp.run('imageMin');
    });
    gulp.watch([`./${Paths.build}/**/*`, './*.html']).on('change', browserSync.reload );
  });

  /**
   * Starting browserSync server
   */

  gulp.task('browserSyncServer', function() {
    browserSync.init({
      server: {
        baseDir: "./"
      },
      port: 8080
    });
  });

  /**
   * Creating production folder without unnecessary files
   */
  gulp.task('production', ['cleanProduction'], function() {
    gulp.src(['./**/*',
        `!${Paths.src}/`,
        `!${Paths.src}/**/*`,
        '!bower/',
        '!bower/**/*',
        '!node_modules/**/*',
        '!node_modules/',
        `!${Paths.build}/**.map`,
        '!.bowerrc',
        '!bower.json',
        '!.gitignore',
        '!gulpfile.js',
        '!LICENSE',
        '!package.json',
        `!${Paths.production}`,
        '!README.md'
      ])
      .pipe(gulp.dest(`./${Paths.production}`));
  });

  /**
   * Clean production folder
   */
  gulp.task('cleanProduction', function() {
    return gulp.src(`./${Paths.production}/`, { read: false })
      .pipe(rimraf());
  });

  /**
   * Copy custom fonts to the build folder
   */
  gulp.task('copyFonts', function() {
    gulp.src([`./${Paths.src}/${Paths.fonts}/**/*`])
      .pipe(gulp.dest(`./${Paths.build}/${Paths.fonts}/`));
  });

  /**
   * Show error in console
   * @param  {String} preffix Title of the error
   * @param  {String} err     Error message
   */
  function showError(preffix, err) {
    gutil.log(gutil.colors.white.bgRed(' ' + preffix + ' '), gutil.colors.white.bgBlue(' ' + err.message + ' '));
    notifier.notify({ title: preffix, message: err.message });
    this.emit("end");
  }

  // Default Gulp Task
  gulp.task('default', ['buildCustomJS', 'buildSass', 'buildJsVendors', 'buildStylesVendors', 'copyFonts', 'imageMin', 'browserSyncServer', 'watch']);
  gulp.task('dev', ['buildCustomJS', 'buildSass', 'buildJsVendors', 'buildStylesVendors', 'copyFonts', 'imageMin', 'watch']);

}());
