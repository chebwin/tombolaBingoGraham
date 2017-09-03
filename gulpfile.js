var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

gulp.task('sass', function(){
  return gulp.src('css/*.scss')
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Gulp watch syntax
gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('css/*.scss', ['sass']); 
  gulp.watch('*.html', browserSync.reload); 
  gulp.watch('scripts/*.js', browserSync.reload); 
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
  })
})