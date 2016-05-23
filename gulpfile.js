var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('concat', () => {
    return gulp.src('src/js/*.js')
        .pipe(concat('script.js'))
        .pipe(gulp.dest('build/js'));
});

gulp.task('default', ['concat']);
