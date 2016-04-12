(function () {
  'use strict';

  var gulp = require('gulp'),
    sass = require('gulp-sass'),
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
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),

    imgDest = 'build/images',
    imgSource = './src/images/**/*';   

  /**
   * Build custom js
   */
  gulp.task('buildCustomJS', function () {
    browserify({entries: './src/js/app.js', debug: true})
      .transform('babelify', {presets: ['es2015']})
      .bundle().on('error', function (err) {
        showError.apply(this, ['JS error', err])
      })
      .pipe(source('app.js'))
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Build js vendor (concatenate vendor array)
   */
  gulp.task('buildJsVendors', function () {
    gulp.src(require('./src/vendor_entries/vendor.js'))
      .pipe(concat('vendor.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Build styles for application from SASS
   */
  gulp.task('buildSass', function () {
    gulp.src('./src/scss/app.scss')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sass().on('error', function (err) {
        showError.apply(this, ['Sass compile error', err]);
      }))
      .pipe(cssnano({safe: true}))
      .pipe(autoprefixer('last 2 versions'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Build styles for vendor from SASS
   */
  gulp.task('buildStylesVendors', function () {
    gulp.src('./src/vendor_entries/vendor.scss')
      .pipe(sass().on('error', function (err) {
        showError.apply(this, ['Sass compile error (vendor)', err]);
      }))
      .pipe(cssnano({safe: true}))
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Images minification
   */
  gulp.task('imageMin', function () {
    gulp.src(imgSource)
      .pipe(newer(imgDest))
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(imgDest));
  });

  /**
   * Clean image build directory
   */
  gulp.task('imageClean', function () {
    gulp.src(imgDest).pipe(rimraf());
  });

  /**
   * Watch for file changes
   */
  gulp.task('watch', function () {
    gulp.watch('./src/js/**/*', ['buildCustomJS']);
    gulp.watch('./src/vendor_entries/vendor.js', ['buildJsVendors']);
    watch('./src/scss/**/*', function () {
      gulp.run('buildSass');
    });
    gulp.watch('./src/vendor_entries/vendor.scss', ['buildStylesVendors']);
    watch('./src/images/**/*', function () {
      gulp.run('imageMin');
    });
    gulp.watch(['./build/*', './*.html']).on('change', function (file) {
      gulp.src(file.path).pipe(connect.reload());
    });
  });

  /**
   * Starting local server
   */
  gulp.task('startLocalhost', function () {
    connect.server({
      livereload: true
    });
  });

  /**
   * Creating production folder without unnecessary files
   */
  gulp.task('production', ['cleanProduction'], function () {    
    gulp.src(['./**/*',
      '!src/',
      '!src/**/*',
      '!bower/',
      '!bower/**/*',
      '!node_modules/**/*',
      '!node_modules/',
      '!build/**.map',
      '!.bowerrc',
      '!bower.json',
      '!.gitignore',
      '!gulpfile.js',
      '!LICENSE',
      '!package.json',
      '!production',
      '!README.md'])
          .pipe(gulp.dest('./production'));
  });

  /**
   * Clean production folder
   */
  gulp.task('cleanProduction', function () {
    return gulp.src('./production/', {read: false})
      .pipe(rimraf());
  });

  /**
   * Make iconfont from svg icons
   */
  gulp.task('makeIconFont', function () {
    var fontName = 'iconfont';
    return gulp.src(['./src/fonts/icons/*.svg'])
      .pipe(iconfontCss({
        fontName: fontName,
        fontPath: 'fonts/iconfont/'
      }))
      .pipe(iconfont({
        fontName: fontName,
        formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
        normalize: true
       }))
      .pipe(gulp.dest('./src/scss/fonts/iconfont/'));
  });

  /**
   * Copy iconfont to the build folder
   */
  gulp.task('iconFont', ['makeIconFont'], function() {
    gulp.src(['./src/scss/fonts/**/*', '!./src/scss/fonts/iconfont/_icons.css'])
      .pipe(gulp.dest('./build/fonts/'));
  });

  /**
   * Copy custom fonts to the build folder
   */
  gulp.task('copyFonts', function () {
    gulp.src(['./src/fonts/**/*', '!./src/fonts/icons/', '!./src/fonts/icons/**/*'])
      .pipe(gulp.dest('./build/fonts/'));
  });

  /**
   * Show error in console
   * @param  {String} preffix Title of the error
   * @param  {String} err     Error message
   */
  function showError(preffix, err) {
    gutil.log(gutil.colors.white.bgRed(' ' + preffix + ' '), gutil.colors.white.bgBlue(' ' + err.message + ' '));
    notifier.notify({title:preffix, message: err.message });
    this.emit("end");
  }

  // Default Gulp Task
  gulp.task('default', ['buildCustomJS', 'buildSass', 'buildJsVendors', 'buildStylesVendors', 'copyFonts', 'imageMin', 'startLocalhost', 'watch']);
  gulp.task('dev', ['buildCustomJS', 'buildSass', 'buildJsVendors', 'buildStylesVendors', 'copyFonts', 'imageMin', 'watch']);

}());