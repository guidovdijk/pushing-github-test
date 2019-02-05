const gulp = require('gulp'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    browserSync = require('browser-sync').create(),
    useref = require('gulp-useref'),
    gulpIf = require('gulp-if'),
    purgecss = require('gulp-purgecss'),
    gcmq = require('gulp-group-css-media-queries'),
    runSequence = require('run-sequence'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    eslint = require('gulp-eslint'),
    gulpStylelint = require('gulp-stylelint'),
    prefix = require('gulp-autoprefixer'),
    fse = require('fs-extra'),
    prompt = require('gulp-prompt'),
    through = require('through2'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    yargs = require('yargs'),
    plumber = require( 'gulp-plumber' ),
    gzip = require('gulp-gzip'),
    notify = require('gulp-notify');

const styleguides = require('./.eslintrc.json'),
    directories = require('./scss-files.json'),
    words = require('./check-words.json'),
    webpackConfig = require('./webpack.config.js');

const prod = yargs.argv.prod;

sass.compiler = require('node-sass');

const config = {
    root: {
        path: './',
        allFiles: './**',
    },
    suffix: {
        html: '.html',
        js: '.js',
        scss: '.scss',
        css: '.css',
        php: '.php',
    },
    production: {
        css: {
            purge: ['src/**/*.html'],
            version: ['last 3 versions', 'ie >= 7'],
        },
        folder: './production',
        images: './production/assets/static/images',
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
        images: './src/assets/static/images/**/*.+(png|jpg|gif|svg)',
    },
    styleguides: {
        scss: './.sass-lint.yml',
        jsonFile: './.eslintrc.json',
    },
    info: {
        promptMessage: 'Running this command for the second time and up, will override your .scss files. Do you want to continue?',
        errorMessage: 'Error: <%= error.message %>',
    }
};

/* 
 * Tasks:
 *
 *  1: Styles
 *   - sass
 *  
 *  2: Scripts
 *   - webpack
 *  
 *  3: Linters
 *   - jsLint
 *   - sassLint
 *  
 *  4: Prettiers
 *   - jsLint
 *   - sassLint
 *  
 *  5: Minifiers
 *   - sassMinify
 *   - htmlMinify
 *   - imagesMinify
 *  
 *  6: BrowserSync
 *  
 *  7: Watchers
 *   - browserSync
 *   - sassLint
 *   - sass
 *   - jsLint
 *   - webpack
 *  
 *  8: Production
 *    - webpack
 *    - sassMinify
 *    - htmlMinify
 *    - imagesMinify
 *    - clean:production
 *  
 *  9: Prompting
 *  
 *  10: Custom function: Check files for specific words.
 *  
 *  11: Custom function: Make directory.
*/


/*
 * 1: Styles
*/
gulp.task('sass', function () {
    return gulp.src(config.development.styles)
        .pipe(plumber({ 
            errorHandler: notify.onError(
                config.info.errorMessage
            )
        }))
        .pipe(sass())
        .pipe(prefix({
            browsers: config.production.css.version
        }))
        .pipe(gulp.dest(config.dist.folder))
        .pipe(browserSync.reload({
            stream: true
        }));
});


/*
 * 2: Scripts
*/
gulp.task('webpack', () => {
    return gulp.src(config.development.scripts)
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(gulpIf(prod, gulp.dest(config.production.folder)))
        .pipe(gulpIf(!prod, gulp.dest(config.dist.folder)))
        .pipe(gulpIf(!prod, browserSync.reload({ stream: true })));
});


/*
 * 3: Linters
*/

// Javascript
gulp.task('jsLint', function () {
    return gulp.src(config.development.scripts, {
        base: config.root.path
    }).pipe(eslint({
        config: styleguides,
        fix: true
    })).pipe(
        eslint.formatEach()
    ).pipe(
        gulp.dest(config.root.path)
    );
});

// Sass
gulp.task('sassLint', function () {
    return gulp.src(config.development.styles, {
        base: config.root.path
    })
        .pipe(plumber({ 
            errorHandler: notify.onError(
                config.info.errorMessage
            )
        }))
        .pipe(gulpStylelint({
            fix: true,
            failAfterError: false,
            reporters: [{
                formatter: 'string',
                console: true
            }]
        })).pipe(
            gulp.dest(config.root.path)
        );
});


/*
 * 4: Prettiers
*/
gulp.task('prettify', function (callback) {
    runSequence('SassLint', 'JsLint', callback);
});


/*
 * 5: Minifiers
*/

// Sass
gulp.task('sassMinify', function () {
    return gulp.src(config.development.styles)
        .pipe(sass())
        .pipe(purgecss({
            content: config.production.css.purge,
            keyframes: true,
            fontFace: true,
        }))
        .pipe(gcmq())
        .pipe(prefix(config.production.css.version))
        .pipe(cleanCSS())
        .pipe(gzip())
        .pipe(gulp.dest(config.production.folder));
});

// Html
gulp.task('htmlMinify', () => {
    return gulp.src(config.development.html)
        .pipe(useref())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        })).pipe(gulp.dest(config.production.folder));
});

// Images
gulp.task('imagesMinify', () => {
    return gulp.src(config.development.images).pipe(cache(imagemin())).pipe(gulp.dest(config.production.images));
});


/*
 * 6: BrowserSync
*/
gulp.task('browserSync', () => {
    browserSync.init({
        server: {
            baseDir: config.development.folder
        },
        notify: false,
    });
});


/*
 * 7: Watchers
*/

// With automatic fixes from 'linters'
const autofixWatch = [
    'browserSync', 
    'sassLint', 
    'sass', 
    'jsLint',
];
gulp.task('watch:autofix', autofixWatch, function () {
    gulp.watch(config.development.styles, ['sassLint', 'sass']);
    gulp.watch(config.development.html, browserSync.reload);
    gulp.watch(config.development.scripts, ['jsLint']);
});

// Without automatic fixes
const autofix = [
    'browserSync', 'sass', 'webpack',
];
gulp.task('watch', autofix, () => {
    gulp.watch(config.development.styles, ['sass']);
    gulp.watch(config.development.html, browserSync.reload);
    gulp.watch(config.development.scripts, ['webpack']);
});


/*
 * 8: Production
*/
gulp.task('clean:production', () => {
    return del.sync(config.production.folder);
});

gulp.task('production', (callback) => {
    const minify = [
        'webpack', 
        'sassMinify', 
        'htmlMinify', 
        'imagesMinify'
    ];
    runSequence('clean:production', minify, callback);
});


/*
 * 9: Prompting
*/
gulp.task('prompting', function () {
    return gulp.src(config.root.allFiles, {
        base: config.root.path
    }).pipe(prompt.confirm(config.info.promptMessage));
});


/*
 * 10: Custom function: Check files for specific words.
*/
let fileList = [];
gulp.task('contains', function(){
    gulp.src([config.development.html])
        .pipe(through.obj(function (file, enc, cb) {
            let contents = file.contents.toString();
            checkFiles(contents, file.relative);
            
            cb(null);
        }))
        .pipe(gulp.dest(config.root.path))
        .on ('end', function () {
            if(fileList.length > 0){
                console.log(fileList);
                process.exit(1);
            }
        });
});

function checkFiles(c, f){
    c = c.toLowerCase();
    for (let i = 0; i < words.length; i++) {
        let word = words[i].toLowerCase();
        if (c.indexOf(word) >= 0) {
            fileList.push(`file: "${f}" contains: "${word}"`);
        }
    }
}


/*
 * 11: Custom function: Make directory.
*/
let parentFiles = [];

gulp.task('mkdir', ['prompting'], function () {
    let pathToFolder = config.development.styleFolder;
    subFileLoop(directories, '');
    parentFiles = parentFiles.join('').replace(/,/g, ' ');

    makeFiles(pathToFolder + directories.main, parentFiles);
});

function subFileLoop(target, parent) {

    let pathToFolder = config.development.styleFolder;
    let fileUrls = [];
    let parents = parent;

    if (parents) {
        pathToFolder = `${pathToFolder + parents}/`;
    }

    for (let key of Object.keys(target)) {
        if (key !== 'main') {
            let p = key + '/';
            let fileName = `__${key}${config.suffix.scss}`;
            let childFiles = '';
            let element = '';
            let makeFile = false;
            for (let i = 0; i < target[key].length; i++) {

                element = target[key][i];

                if (typeof element == 'object') {

                    subFileLoop(element, parents + '/' + key);
                    
                    for (let names of Object.keys(element)) {

                        if (element[names].length == 1 && typeof element[names][0] !== 'object') {
                            fileUrls.push(`@import '${names}/${('' + element[names][0]).replace(/_/g, '')}';\n`);
                            makeFile == true;
                        } else {
                            fileUrls.push(`@import '${names}/_${names}${config.suffix.scss}';\n`);
                        }
                    }

                    parentFiles = [];
                } else {

                    makeFiles(pathToFolder + p + element, '');

                    fileUrls.push(`@import '${element.replace('_', '')}';\n`);
                }
            }

            childFiles = fileUrls;
            childFiles = childFiles.join('');

            parentFiles.push(`@import '${p + fileName.replace('_', '')}';\n`);

            if (target[key].length >= 2 || typeof element === 'object' && makeFile) {
                makeFiles(pathToFolder + p + fileName, childFiles);
            }
            fileUrls = [];
        }
    }
}

function makeFiles(filePath, fileContent) {
    fse.outputFile(filePath, fileContent, err => {
        if (err) {
            console.log(err);
        }
    });
}







