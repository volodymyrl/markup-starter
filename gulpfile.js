(function () {
  'use strict';

  var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
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
    del = require('del'),

    // List of all vendor js files
    vendor = [
      './bower/jquery/dist/jquery.js',
      './bower/bootstrap-sass/assets/javascripts/bootstrap.js'
    ];

  /**
   * Build custom js
   */
  gulp.task('buildCustomJS', function () {
    gulp.src('./js/**/*')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(concat('app.js'))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Build js vendor (concatenate vendor array)
   */
  gulp.task('buildJsVendors', function () {
    gulp.src(vendor)
      .pipe(concat('vendor.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Build styles for application from SASS
   */
  gulp.task('buildSass', function () {
    gulp.src('./scss/app.scss')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sass().on('error', function (err) {
        gutil.log(gutil.colors.red("Sass compile error"), gutil.colors.blue(err.message));
        notifier.notify({title: "Sass compile error", message: err.message });
        this.emit("end");
      }))
      .pipe(cssnano())
      .pipe(autoprefixer('last 2 versions'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Build styles for vendor from SASS
   */
  gulp.task('buildStylesVendors', function () {
    gulp.src('./scss/vendor/vendor.scss')
      .pipe(sass().on('error', function (err) {
        gutil.log(gutil.colors.bgRed("Sass compile error (vendor)"), gutil.colors.bgBlue(err.message));
        notifier.notify({title: "Sass compile error (vendor)", message: err.message });
        this.emit("end");
      }))
      .pipe(cssnano())
      .pipe(gulp.dest('./build/'));
  });

  /**
   * Images minification
   */
  gulp.task('imageMin', function () {
    del('./build/images/**/*').then(function () {
      gulp.src('./images/**/*')
        .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()]
        }))
        .pipe(gulp.dest('build/images'));
    });
  });

  /**
   * Watch for file changes
   */
  gulp.task('watch', function () {
    gulp.watch('./js/**/*', ['buildCustomJS']);
    gulp.watch('./gulpfile.js', ['buildJsVendors']);
    gulp.watch(['./scss/**/*', '!scss/vendor/**/*'], ['buildSass']);
    gulp.watch('../scss/vendor/vendor.scss', ['buildStylesVendors']);
    gulp.watch('./images/**/*', ['imageMin']);
    gulp.watch('./build/*').on('change', function (file) {
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

  // Default Gulp Task
  gulp.task('default', ['buildCustomJS', 'buildSass', 'buildJsVendors', 'buildStylesVendors', 'imageMin', 'startLocalhost', 'watch']);

}());