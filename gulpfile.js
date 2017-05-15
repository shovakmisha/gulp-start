var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglifyjs'),
    cssnano     = require('gulp-cssnano'),
    rename      = require('gulp-rename'),
    del         = require('del'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    cache       = require('gulp-cache'),
    autopefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
   return gulp.src(['!./app/sass/ignore.scss', './app/sass/**/*.+(scss|sass)']) // Можна вказувати масивом. ! значає не компілити цей файл
       .pipe(sass().on('error', sass.logError))
       .pipe(autopefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
       .pipe(gulp.dest('./app/css')) // тільки папку писати, інакше створить файл (вроді)
       .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function () {
    return gulp.src([
        './app/bower-libs/jquery/dist/jquery.min.js', // тут перечислювати всі файли, які хочу сконкатиніровати
        './app/magnific-popup/dist/dist/jquery.magnific-popup.min.js'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./app/js'));
});

gulp.task('css-libs', ['sass'], function () {
    return gulp.src('./app/css/lib.css')
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./app/css'));
});

gulp.task('browser-sync', function () {
   browserSync({
       server: {
           baseDir: 'app'
       }
   });
});
gulp.task('clean', function () {
   return del.sync('dist');
});
// чистити кеші. Запускати вручну
gulp.task('clear', function () {
    return cache.clearAll();
});
gulp.task('img', function () {
   return gulp.src('app/img/**/*')
       .pipe(cache( imagemin({
           interlaced: true, // не знаю на що, але з цим краще
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           une: [pngquant()]
       })) )
       .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function () { // аргумент ['browser-sync'] i sass виконається до команди watch. Можна різні аргументи туди дописувати
    gulp.watch('./app/sass/**/*.+(scss|sass)', ['sass']);
    gulp.watch('./app/*.html', browserSync.reload);
    gulp.watch('./app/js/**/*.js', browserSync.reload);
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
   var builCss = gulp.src([
           'app/css/main.css',
           'app/css/lib.min.css'
       ])
   .pipe(gulp.dest('dist/css'))
    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
    var buildJs = gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'))
    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

// подивити чому так запутано запускається сервер і сасс при вотч