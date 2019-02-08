// Dependencies
const browserSync = require('browser-sync').create(),
    cache = require('gulp-cache'),
    cleanCSS = require('gulp-clean-css'),
    del = require('del'),
    eslint = require('gulp-eslint'),
    fse = require('fs-extra'),
    gcmq = require('gulp-group-css-media-queries'),
    gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    gulpStylelint = require('gulp-stylelint'),
    gzip = require('gulp-gzip'),
    header = require('gulp-header'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    plumber = require( 'gulp-plumber' ),
    prefix = require('gulp-autoprefixer'),
    prompt = require('gulp-prompt'),
    purgecss = require('gulp-purgecss'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    useref = require('gulp-useref'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    yargs = require('yargs');

// Own json and webpack
const directories = require('./create-styling-directory.json'),
    projectPackage = require('./package.json'),
    eslintStyleGuide = require('./.eslintrc.json'),
    webpackConfig = require('./webpack.config.js');

// Terminal production argv 
const prod = yargs.argv.prod,
    clean = yargs.argv.clean;

// Sass compiler from node sass 
sass.compiler = require('node-sass');

// Config
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
        images: './production/assets/images',
    },
    dist: {
        folder: './src/dist/',
    },
    development: {
        folder: './src',
        styleFolder: 'test/styles/',
        scripts: './src/assets/scripts/**/*.js',
        styles: './src/assets/styles/**/*.scss',
        php: './src/**/*.php',
        images: './src/assets/images/**/*.+(png|jpg|gif|svg)',
    },
    styleguides: {
        scss: './.stylelintrc.json',
        jsonFile: './.eslintrc.json',
    },
    info: {
        promptMessage: 'Running this command for the second time and up, will override your .scss files. Do you want to continue?',
        errorMessage: 'Error: <%= error.message %>',
        theme: '/**\n' +
		' * Theme Name: <%= package.name %>\n' +
		' * Theme URI: <%= package.repository.url %>\n' +
		' * GitHub Theme URI: <%= package.repository.url %>\n' +
		' * Description: <%= package.description %>\n' +
		' * Version: <%= package.version %>\n' +
		' * Author: <%= package.author.name %>\n' +
		' * Author URI: <%= package.author.url %>\n' +
		' * License: <%= package.license %>\n' +
		' */',
    }
};

/* 
 * Tasks:
 *  
 *  1: Linters and Compilers
 *   - lint:js
 *   - lint:sass
 *  
 *  2: Prettiers
 *   - lint:js
 *   - lint:sass
 *  
 *  3: Minifiers
 *   - minify:sass
 *   - minify:wordpress
 *   - minify:images
 *  
 *  4: BrowserSync
 *  
 *  5: Watchers
 *   - browserSync
 *   - lint:sass
 *   - lint:js
 *   - sass
 *   - webpack
 *  
 *  6: Production
 *    - webpack
 *    - minify:sass
 *    - minify:wordpress
 *    - minify:images
 *    - clean:production
 *  
 *  7: Prompting
 *  
 *  8: Custom functions: 
 *    - Make directory
 *      - mkdir
 *      - subFileLoop
 *      - makeFiles
*/


/*
 * 1: Linters and Compilers
*/

// Javascript
gulp.task('lint:js', function () {
    return gulp.src(config.development.scripts)
        .pipe(plumber({ 
            errorHandler: notify.onError(
                ' '
            )
        }))
        .pipe(eslint({
            config: eslintStyleGuide,
            fix: false
        }))
        .pipe(
            eslint.format()
        )        
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(gulpIf(prod, gulp.dest(config.production.folder)))
        .pipe(gulpIf(!prod, gulp.dest(config.dist.folder)))
        .pipe(gulpIf(!prod, browserSync.reload({ stream: true })));
});

// Sass
gulp.task('lint:sass', function () {
    return gulp.src(config.development.styles)
        .pipe(plumber({ 
            errorHandler: notify.onError(
                ''
            )
        }))
        .pipe(gulpStylelint({
            fix: false,
            failAfterError: false,
            reporters: [{
                formatter: 'string',
                console: true
            }]
        })) 
        .pipe(sass())
        .pipe(prefix({
            browsers: config.production.css.version
        }))
        .pipe(header(config.info.theme, { package: projectPackage }))
        .pipe(gulp.dest(config.dist.folder))
        .pipe(gulpIf(!prod, browserSync.reload({ stream: true })));
});


/*
 * 2: Prettiers
*/
gulp.task('prettify', function (callback) {
    runSequence('lint:sass', 'lint:js', callback);
});


/*
 * 3: Minifiers
*/

// Sass
gulp.task('minify:sass', function () {
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
        .pipe(header(config.info.theme, { package: projectPackage }))
        .pipe(gulp.dest(config.production.folder))
        .pipe(gzip())
        .pipe(gulp.dest(config.production.folder));
});

// Html
gulp.task('minify:wordpress', () => {
    return gulp.src(config.development.php)
        .pipe(useref())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        })).pipe(gulp.dest(config.production.folder));
});

// Images
gulp.task('minify:images', () => {
    return gulp.src(config.development.images)
        .pipe(cache(imagemin()))
        .pipe(gulp.dest(config.production.images));
});


/*
 * 4: BrowserSync
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
 * 5: Watchers
*/

// With automatic fixes from 'linters'
const watch = [
    'browserSync', 'lint:sass', 'lint:js',
];
gulp.task('watch', watch, function () {
    gulp.watch(config.development.styles, ['lint:sass']);
    gulp.watch(config.development.php, browserSync.reload);
    gulp.watch(config.development.scripts, ['lint:js']);
});


/*
 * 6: Production
*/
gulp.task('clean:production', () => {
    return del.sync(config.production.folder);
});

gulp.task('production', (callback) => {
    const minify = [
        'lint:js', 
        'minify:sass', 
        'minify:wordpress', 
        'minify:images'
    ];
    if(clean){
        runSequence('clean:production', minify, callback);
    } else {
        runSequence(minify, callback);
    }
});


/*
 * 7: Prompting
*/
gulp.task('prompting', function () {
    return gulp.src(config.root.allFiles, {
        base: config.root.path
    }).pipe(prompt.confirm(config.info.promptMessage));
});


/*
 * 8: Custom functions
*/

// Make directory
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







