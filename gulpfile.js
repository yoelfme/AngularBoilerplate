var gulp = require('gulp'),
    connect = require('gulp-connect'),
    history = require('connect-history-api-fallback'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream,
    templateCache = require('gulp-angular-templatecache'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss');

var historyApiFallback = history({});

// Web server for development
gulp.task('server', function () {
  connect.server({
    root: './app',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
    middleware: function (connect, opt) {
      console.log('Hola');
      return [ historyApiFallback ];
    }
  });
});

gulp.task('server-dist', function () {
  connect.server({
    root: './dist',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
    middleware: function (connect, opt) {
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

// Cache the templates to templates.js
gulp.task('templates', function () {
  gulp.src('./app/views/**/*.tpl.html')
    .pipe(templateCache({
      root: 'views/',
      module: 'blog.templates',
      standalone: true
    }))
    .pipe(gulp.dest('./app/scripts'));
})

// Compress files of CSS and JS
gulp.task('compress', function () {
  gulp.src('./app/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify({ mangle: false })))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('./dist'));
});

// Copy the dist files to /dist folder
gulp.task('copy', function () {
  gulp.src('./app/lib/font-awesome/fonts/**')
    .pipe(gulp.dest('./dist/fonts'));
});

// Remove unused CSS selectors
gulp.task('uncss', function() {
  gulp.src('./dist/css/style.min.css')
    .pipe(uncss({
       html: ['./app/index.html', './app/views/post-list.tpl.html', './app/views/post-detail.tpl.html']
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist/css'));
});

// Watch changes that occur in the code y trigger the tasks
gulp.task('watch', function () {
  gulp.watch(['./app/**/*.html'], ['html']);
  gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject']);
  gulp.watch(['./app/scripts/**/*.js', './gulpfile.js'], ['jshint', 'inject']);
  gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('default', ['server', 'watch']);
gulp.task('build', ['templates', 'compress', 'copy', 'uncss']);
