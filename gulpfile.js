const gulp = require('gulp');
const gulpDel = require('del');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const source = require('vinyl-source-stream');

const destDir = 'dist/';

gulp.task('clean', function() {
  return gulpDel([destDir]);
});

gulp.task('copy-resources',
  function() {
    return gulp.src([
        'app/graphics/*',
        'app/sounds/*'
      ], {base: 'app/'})
      .pipe(gulp.dest(destDir + '/'));
  }
);

gulp.task('build-js',
  function() {
    return browserify({
        entries: [
          'app/index.js'
        ],
        transform: [
          "packageify",
          "brfs"
        ]
      })
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(destDir));
  }
);

gulp.task('build-html',
  function() {
    return gulp.src('app/**/*.html')
      .pipe(gulp.dest(destDir + '/'));
  }
);

gulp.task('build-css',
  function() {
    return gulp.src('app/**/*.css')
      .pipe(gulp.dest(destDir + '/'));
  }
);

gulp.task('build', gulp.series(
  'clean',
  'copy-resources',
  'build-css',
  'build-js',
  'build-html'
));

gulp.task('serve', gulp.series(
  'build',
  action(() => {
    browserSync.init({
      server: {
        baseDir: "./dist"
      }
    });
    
    gulp.watch('app/**', gulp.series(
      'build',
      action(browserSync.reload) 
    ));
  })
));

function action(task) {
  return (done) => {
    task();
    done();
  }
}