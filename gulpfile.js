var gulp = require('gulp'),
    connect = require('gulp-connect'),
    history = require('connect-history-api-fallback'),
    stylus = require('gulp-stylus'),
    nib = require('nib');

var historyApiFallback = history({});

// Web server for development
gulp.task('server', function () {
  connect.server({
    root: './app',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: function (connect, opt) {
      return [ historyApiFallback ];
    }
  });
});

// Compile Stylus files to CSS files and reload changes
gulp.task('css', function () {
  gulp.src('./app/stylesheets/main.styl')
    .pipe(stylus({ use: nib() }))
    .pipe(gulp.dest('./app/stylesheets'))
    .pipe(connect.reload());
});

// Reload the web browser when html files are changed
gulp.task('html', function () {
  gulp.src('./app/**/*.html')
    .pipe(connect.reload());
});

// Watch changes that occur in the code y trigger the tasks
gulp.task('watch', function () {
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/stylesheets/**/*.styl'], ['css']);
});

gulp.task('default', ['server', 'watch']);
