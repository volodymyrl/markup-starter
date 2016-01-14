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
    minifyCss = require('gulp-minify-css'),
    debug = require('gulp-debug'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),

    // List of all vendor js files
    vendor = [
      './vendor/jquery/dist/jquery.js',
      './node_modules/bootstrap-sass/assets/javascripts/bootstrap.js'
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
      .pipe(gulp.dest('./build/'))
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
      .pipe(minifyCss())
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
      .pipe(minifyCss())
      .pipe(gulp.dest('./build/'));
  });

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
    gulp.watch(['./client/main.js', './client/app/**/*.js'], ['buildApp']);
    gulp.watch(['./client/app/**/*.html'], ['buildApp']);
    gulp.watch('./client/vendor.js', ['buildJsVendors']);
    gulp.watch(['./client/main.scss', './client/styles/*.scss', './client/app/**/*.scss'], ['buildSass']);
    gulp.watch('./client/vendor.scss', ['buildStylesVendors']);
  });

  gulp.task('startLocalhost', function () {
    connect.server();
  });

  // Default Gulp Task
  gulp.task('default', ['buildCustomJS', 'buildSass', 'buildJsVendors', 'buildStylesVendors', 'imageMin', 'startLocalhost']);

}());