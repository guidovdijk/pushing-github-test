const gulp = require('gulp'),
cleanCSS = require('gulp-clean-css'),
sass = require('gulp-sass'),
htmlmin = require('gulp-htmlmin'),
uglify = require('gulp-uglify'),
browserSync = require('browser-sync').create(),
useref = require('gulp-useref'),
gulpIf = require('gulp-if'),
runSequence = require('run-sequence'),
del = require('del'),
imagemin = require('gulp-imagemin'),
cache = require('gulp-cache'),
eslint = require('gulp-eslint'),
gulpStylelint = require('gulp-stylelint'),
prefix = require('gulp-autoprefixer');

const styleguides = require('./.eslintrc.json');

const paths =  {
    production: {
        folder: 'production',
        images: 'production/images'
    },
    development: {
        folder: 'src',
        scripts: 'src/assets/scripts/**/*.js',
        styles: 'src/assets/styles/**/*.scss',
        html: 'src/**/*.html',
        images: 'src/assets/images/**/*.+(png|jpg|gif|svg)',
    },
    styleguides: {
        scss: './.sass-lint.yml',
        jsonFile: './.eslintrc.json',
    }
};


gulp.task('commit', function(){
    let jslint = gulp.src([paths.development.scripts])
        .pipe(eslint({ 
            config: styleguides, 
            fix: true,
            maxWarnings: 0,
            failOnError: true,
        }))
        .pipe(eslint.formatEach());

    let stylelint = gulp.src([paths.development.styles])
        .pipe(gulpStylelint({
            fix: true,
            failAfterError: true,
            reporters: [
                {formatter: 'string', console: true}
            ]
        }))
    
    return [jslint, stylelint];
});

gulp.task('JsLint', function () {
    return gulp.src(paths.development.scripts, {base: './'})
        .pipe(eslint({config:styleguides, fix: true}))
        .pipe(eslint.formatEach())
        .pipe(gulp.dest('./'))
});

gulp.task('SassLint', function(){
    return gulp.src(paths.development.styles)
        .pipe(gulpStylelint({
            fix: true,
            failAfterError: false,
            reporters: [
                {formatter: 'verbose', console: true}
            ]
        }))
});

gulp.task('sass', ['SassLint'], function() {
    return gulp.src(paths.development.styles)
        .pipe(sass())
        .pipe(prefix('last 2 versions'))
        .pipe(gulp.dest(paths.development.folder))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: paths.development.folder
        },
    });
});

gulp.task('watch', ['browserSync', 'sass', 'JsLint'], function (){
    gulp.watch(paths.development.styles, ['sass']); 
    gulp.watch(paths.development.html, browserSync.reload); 
    gulp.watch(paths.development.scripts, ['JsLint']); 
});

gulp.task('jsAndHtmlMinify', function(){
    return gulp.src(paths.development.html)
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(htmlmin({ 
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(paths.production.folder));
});
    
gulp.task('sassMinify', function(){
    return gulp.src(paths.development.styles)
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest(paths.production.folder));
});

gulp.task('imagesMinify', function(){
    return gulp.src(paths.development.images)
        .pipe(cache(imagemin()))
        .pipe(gulp.dest(paths.production.images));
});

gulp.task('clean:production', function() {
    return del.sync(paths.production.folder);
});

gulp.task('production', function(callback){
    const minify = [
        'jsAndHtmlMinify', 
        'sassMinify', 
        'imagesMinify'
    ];
    runSequence('clean:production', minify, callback);
});
