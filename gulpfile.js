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
    eslint = require('gulp-eslint'),
    gulpStylelint = require('gulp-stylelint'),
    prefix = require('gulp-autoprefixer'),
    minify = require("gulp-babel-minify"),
    fse = require('fs-extra'),
    prompt = require('gulp-prompt');

// importeer het scss.json bestand met de naam: directories.
const styleguides = require('./.eslintrc.json'),
    directories = require('./scss-files.json');

const paths = {
    production: {
        folder: 'production',
        images: 'production/images'
    },
    development: {
        folder: 'src',
        // Path naar de map toe om de .scss bestanden in te plaatsen
        styleFolder: 'test/styles/',
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

gulp.task('prettify', function (callback) {
    runSequence('SassLint', 'JsLint', callback);
});

gulp.task('prompting', function () {
    return gulp.src("./**", {
            base: '/'
        })
        .pipe(prompt.confirm('Running this command for the second time and up, will override your .scss files. Do you want to continue?'))
});

let parentFiles = [];

gulp.task('mkdir', function () {
    // zet het path naar waar de bestanden opgeslagen moeten worden
    let pathToFolder = paths.development.styleFolder;
    // initialize de functie met de directories data en een leeg path.
    // (dit word eerst uitgevoerd voordat het door gaat naar de parentFiles en makeFiles funcite)
    subFileLoop(directories, '');
    // format alle data uit parentFiles naar een string en verwijder de comma's
    parentFiles = parentFiles.join("").replace(/,/g, " ");
    // initialize de functie die zorgt voor het aanmaken van de bestanden. 
    // eerste parameter is voor het path van de file en de tweede is de data die erin moet.
    makeFiles(pathToFolder + directories.main, parentFiles);
});

function subFileLoop(target, parent) {
    // Zet pathToFolder gelijk aan het pad voor de bestanden
    let pathToFolder = paths.development.styleFolder;
    let fileUrls = [];
    // Zet de parents variable gelijk aan de parameter van de functie.
    let parents = parent;

    // Als parents
    if (parents) {
        pathToFolder = `${pathToFolder + parents}/`;
    }

    for (let key of Object.keys(target)) {
        if (key !== 'main') {
            let p = key + '/';
            let fileName = "__" + key + ".scss";
            let childFiles = '';
            let element = '';
            let makeFile = false;
            for (let i = 0; i < target[key].length; i++) {
                element = target[key][i];

                if (typeof element == 'object') {

                    subFileLoop(element, parents + '/' + key);

                    for (let names of Object.keys(element)) {
                        if (element[names].length == 1 && typeof element[names][0] !== 'object') {
                            fileUrls.push(`@import "${names}/${("" + element[names][0]).replace(/_/g, '')}";\n`);
                            makeFile == true;
                        } else {
                            fileUrls.push(`@import "${names}/_${names}.scss";\n`);
                        }
                    }
                    parentFiles = [];
                } else {
                    makeFiles(pathToFolder + p + element, '');
                    fileUrls.push(`@import "${element.replace('_', '')}";\n`);
                }
            }

            childFiles = fileUrls;
            childFiles = childFiles.join("");

            parentFiles.push(`@import "${p + fileName.replace('_', '')}";\n`);

            if (target[key].length >= 2 || typeof element === 'object' && makeFile) {
                makeFiles(pathToFolder + p + fileName, childFiles);
            }

            fileUrls = [];
        }
    }
}

// gulp.task('mkdir backup', function(){

//     const pathToFolder = 'test/styles/';

//     for (let key of Object.keys(directories)) {
//         if(key !== 'main'){
//             let p = key + '/';
//             let fileName = "__" + key + ".scss";
//             let childFiles = '';

//             for (let i = 0; i < directories[key].length; i++) {

//                 let element = directories[key][i];


//                 if(typeof directories[key][i] == 'object'){
//                     subFileLoop(directories[key][i], key);
//                 } else {

//                     urls.push(`@import "${element}";\n`);

//                     makeFiles(pathToFolder + p + element, '');

//                 }

//             }

//             childFiles = urls;
//             childFiles = childFiles.join("").replace(/,/g," ").replace('_', '');

//             parentFiles.push(`@import "${p + fileName.replace('_', '')}";\n`);

//             makeFiles(pathToFolder + p + fileName, childFiles);

//             urls = [];
//         }
//     }

//     parentFiles = parentFiles.join("").replace(/,/g," ");

//     makeFiles(pathToFolder + directories.main, parentFiles);

// });

// function subFileLoop(target, parent){

//     let fileUrls = [];
//     let pathToFolder = 'test/styles/' + parent + '/';

//     console.log('p and t', parent, target)

//     for (let key of Object.keys(target)) {
//         console.log('PATH', pathToFolder)
//         console.log('KEY', key)
//         if(key !== 'main'){
//             let p = key + '/';
//             let fileName = "__" + key + ".scss";
//             let childFiles = '';

//             for (let i = 0; i < target[key].length; i++) {

//                 let element = target[key][i];

//                 fileUrls.push(`@import "${element.replace('_', '')}";\n`);

//                 makeFiles(pathToFolder + p + element, '');

//             }

//             childFiles = fileUrls;
//             childFiles = childFiles.join("").replace(/,/g," ").replace(/_/g, '');
//             console.log('URLS childs', childFiles)

//             console.log('URLS parents', parentFiles)
//             urls.push(`@import "${p + fileName.replace('_', '')}";\n`);

//             makeFiles(pathToFolder + p + fileName, childFiles);

//         }
//     }
// }

function makeFiles(filePath, fileContent) {
    fse.outputFile(filePath, fileContent, err => {
        if (err) {
            console.log(err);
        }
    });
}

gulp.task('jsLint', function () {
    return gulp.src(paths.development.scripts, {
            base: './'
        })
        .pipe(eslint({
            config: styleguides,
            fix: true
        }))
        .pipe(eslint.formatEach())
        .pipe(gulp.dest('./'))
});

gulp.task('sassLint', function () {
    return gulp.src(paths.development.styles, {
            base: './'
        })
        .pipe(gulpStylelint({
            fix: true,
            failAfterError: false,
            reporters: [{
                formatter: 'string',
                console: true
            }]
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('sass', function () {
    return gulp.src(paths.development.styles)
        .pipe(sass())
        .pipe(prefix('last 2 versions'))
        .pipe(gulp.dest(paths.development.folder))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: paths.development.folder
        },
    });
});

gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch(paths.development.styles, ['sass']);
    gulp.watch(paths.development.html, browserSync.reload);
    gulp.watch(paths.development.scripts, browserSync.reload);
});

gulp.task('watch:autofix', ['browserSync', 'sassLint', 'sass', 'jsLint'], function () {
    gulp.watch(paths.development.styles, ['sassLint', 'sass']);
    gulp.watch(paths.development.html, browserSync.reload);
    gulp.watch(paths.development.scripts, ['jsLint']);
});

gulp.task('jsAndHtmlMinify', function () {
    return gulp.src(paths.development.html)
        .pipe(useref())
        .pipe(gulpIf('*.js',
            minify({
                mangle: {
                    keepClassName: true
                }
            })
        ))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(paths.production.folder));
});

gulp.task('sassMinify', function () {
    return gulp.src(paths.development.styles)
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest(paths.production.folder));
});

gulp.task('imagesMinify', function () {
    return gulp.src(paths.development.images)
        .pipe(cache(imagemin()))
        .pipe(gulp.dest(paths.production.images));
});

gulp.task('clean:production', function () {
    return del.sync(paths.production.folder);
});

gulp.task('production', function (callback) {
    const minify = [
        'jsAndHtmlMinify',
        'sassMinify',
        'imagesMinify'
    ];
    runSequence('clean:production', minify, callback);
});
