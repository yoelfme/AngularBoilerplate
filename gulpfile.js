var gulp = require('gulp'),
    connect = require('gulp-connect'),
    history = require('connect-history-api-fallback'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream;

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

// Busca errores en el JS y nos los muestra por pantalla
// Find erros in JS and then show it
gulp.task('jshint', function () {
  return gulp.src('./app/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
});

// Find in styles and javascript folder files that we created for inject in index.html
gulp.task('inject', function () {
  var sources = gulp.src(['./app/scripts/**/*.js', './app/stylesheets/**/*.css']);

  return gulp.src('index.html', { cwd: './app'})
    .pipe(inject(sources, {
      read: false,
      ignorePath: '/app'
    }))
    .pipe(gulp.dest('./app'));
});

// Inject the libraries that we installed via Bower
gulp.task('wiredep', function () {
  gulp.src('./app/index.html')
    .pipe(wiredep({
      directory: './app/lib'
    }))
    .pipe(gulp.dest('./app'));
});


// Watch changes that occur in the code y trigger the tasks
gulp.task('watch', function () {
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject']);
  gulp.watch(['./app/scripts/**/*.js', './gulpfile.js'], ['jshint', 'inject']);
  gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('default', ['server', 'watch']);
