const gulp = require('gulp'),
cleanCSS = require('gulp-clean-css'),
sass = require('gulp-sass'),
htmlmin = require('gulp-htmlmin'),
browserSync = require('browser-sync').create(),
useref = require('gulp-useref'),
gulpIf = require('gulp-if'),
runSequence = require('run-sequence'),
del = require('del'),
imagemin = require('gulp-imagemin'),
cache = require('gulp-cache'),
prefix = require('gulp-autoprefixer'),
webpack = require('webpack'),
webpackStream = require('webpack-stream'),
yargs = require('yargs');

sass.compiler = require('node-sass');

const webpackConfig = require('./webpack.config.js');
const prod = yargs.argv.prod;

const paths = {
    production: {
        folder: './production',
        images: './production/static/images'
    },
    dist: {
        folder: './src/dist/',
    },
    development: {
        folder: './src',
        styleFolder: 'test/styles/',
        scripts: './src/assets/scripts/**/*.js',
        styles: './src/assets/styles/**/*.scss',
        html: './src/**/*.html',
        images: './src/static/images/**/*.+(png|jpg|gif|svg)',
    },
    styleguides: {
        scss: './.sass-lint.yml',
        jsonFile: './.eslintrc.json',
    }
};

gulp.task('sass', () => {
    return gulp.src(paths.development.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(prefix('last 2 versions'))
    .pipe(gulpIf(prod, gulp.dest(paths.development.folder)))
    .pipe(gulpIf(!prod, gulp.dest(paths.dist.folder)))
    .pipe(browserSync.reload({
        stream: true
    }))
});

gulp.task('browserSync', () => {
    browserSync.init({
        server: {
            baseDir: paths.development.folder
        },
    })
});

gulp.task('watch', ['browserSync', 'sass', 'webpack'], () => {
    gulp.watch(paths.development.styles, ['sass']);
    gulp.watch(paths.development.html, browserSync.reload);
    gulp.watch(paths.development.scripts, ['webpack'])
});


gulp.task('htmlMinify', () => {
    return gulp.src(paths.development.html)
    .pipe(useref())
    .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
    })).pipe(gulp.dest(paths.production.folder))
});

gulp.task('webpack', () => {
    return gulp.src(paths.development.scripts)
      .pipe(webpackStream(webpackConfig), webpack)
      .pipe(gulpIf(prod, gulp.dest(paths.production.folder)))
      .pipe(gulpIf(!prod, gulp.dest(paths.dist.folder)))
      .pipe(gulpIf(!prod, browserSync.reload({ stream: true })))
});

gulp.task('sassMinify', () => {
    return gulp.src(paths.development.styles).pipe(sass()).pipe(cleanCSS()).pipe(gulp.dest(paths.production.folder))
});

gulp.task('imagesMinify', () => {
    return gulp.src(paths.development.images).pipe(cache(imagemin())).pipe(gulp.dest(paths.production.images))
});

gulp.task('clean:production', () => {
    return del.sync(paths.production.folder)
});

gulp.task('production', (callback) => {
    const minify = ['webpack', 'htmlMinify', 'sassMinify', 'imagesMinify'];
    runSequence('clean:production', minify, callback);
});
