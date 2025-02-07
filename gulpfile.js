import gulp from 'gulp';
import {deleteAsync} from 'del'
import browserify from 'browserify';
import browserSyncLib from 'browser-sync';
import source from 'vinyl-source-stream';

const browserSync = browserSyncLib.create();

const destDir = 'dist/';

gulp.task('clean', function() {
  return deleteAsync([destDir]);
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
          'app/index.js',
        ],
        noParse: [
            './node_modules/progressbar.js/dist/progressbar.js',
        ],
        transform: [
          "packageify",
          "brfs",
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