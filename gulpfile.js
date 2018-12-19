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
prompt = require('gulp-prompt'),
replace = require('gulp-replace'),
through = require('through2');

const styleguides = require('./.eslintrc.json'),
directories = require('./scss-files.json'),
words = require('./check-words.json');

const paths = {
    production: {
        folder: 'production',
        images: 'production/images'
    },
    development: {
        folder: 'src',
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
    runSequence('SassLint', 'JsLint', callback)
});

let fileList = [];
gulp.task('contains', function () {
    gulp.src(['./src/**/*.html']).pipe(through.obj(function (file, enc, cb) {
        let contents = file.contents.toString();
        checkFiles(contents, file.relative);
        cb(null)
    })).pipe(gulp.dest('./')).on('end', function () {
        if (fileList.length > 0) {
            console.log(fileList);
            process.exit(1)
        }
    })
});

function checkFiles(c, f) {
    c = c.toLowerCase();
    for (let i = 0; i < words.length; i++) {
        let word = words[i].toLowerCase();
        if (c.indexOf(word) >= 0) {
            fileList.push('file: "' + f + '" contains: "' + word + '"')
        }
    }
}

gulp.task('prompting', function () {
    return gulp.src("./**", {
        base: '/'
    }).pipe(prompt.confirm('Running this command for the second time and up, will override your .scss files. Do you want to continue?'))
});

let parentFiles = [];

gulp.task('mkdir', gulp.series('prompting'), function () {
    let pathToFolder = paths.development.styleFolder;
    subFileLoop(directories, '');
    parentFiles = parentFiles.join("").replace(/,/g, " ");
    makeFiles(pathToFolder + directories.main, parentFiles)
});

function subFileLoop(target, parent) {
    let pathToFolder = paths.development.styleFolder;
    let fileUrls = [];
    let parents = parent;
    if (parents) {
        pathToFolder = `${pathToFolder + parents}/`
    }
    for (let key of Object.keys(target)) {
        if (key !== 'main') {
            let p = key + '/';
            let fileName = "__" + key + ".scss";
            let childFiles = '';
            let element = '';
            let makeFile = !1;
            for (let i = 0; i < target[key].length; i++) {
                element = target[key][i];
                if (typeof element == 'object') {
                    subFileLoop(element, parents + '/' + key);
                    for (let names of Object.keys(element)) {
                        if (element[names].length == 1 && typeof element[names][0] !== 'object') {
                            fileUrls.push(`@import "${names}/${("" + element[names][0]).replace(/_/g, '')}";\n`);
                            makeFile == !0
                        } else {
                            fileUrls.push(`@import "${names}/_${names}.scss";\n`)
                        }
                    }
                    parentFiles = []
                } else {
                    makeFiles(pathToFolder + p + element, '');
                    fileUrls.push(`@import "${element.replace('_', '')}";\n`)
                }
            }
            childFiles = fileUrls;
            childFiles = childFiles.join("");
            parentFiles.push(`@import "${p + fileName.replace('_', '')}";\n`);
            if (target[key].length >= 2 || typeof element === 'object' && makeFile) {
                makeFiles(pathToFolder + p + fileName, childFiles)
            }
            fileUrls = []
        }
    }
}

function makeFiles(filePath, fileContent) {
    fse.outputFile(filePath, fileContent, err => {
        if (err) {
            console.log(err)
        }
    })
}

gulp.task('jsLint', function () {
    return gulp.src(paths.development.scripts, {
        base: './'
    }).pipe(eslint({
        config: styleguides,
        fix: !0
    })).pipe(eslint.formatEach()).pipe(gulp.dest('./'))
});

gulp.task('sassLint', function () {
    return gulp.src(paths.development.styles, {
        base: './'
    }).pipe(gulpStylelint({
        fix: !0,
        failAfterError: !1,
        reporters: [{
            formatter: 'string',
            console: !0
        }]
    })).pipe(gulp.dest('./'))
});

gulp.task('sass', function () {
    return gulp.src(paths.development.styles).pipe(sass()).pipe(prefix('last 2 versions')).pipe(gulp.dest(paths.development.folder)).pipe(browserSync.reload({
        stream: !0
    }))
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: paths.development.folder
        },
    })
});

gulp.task('watch', gulp.series('browserSync', 'sass'), function () {
    gulp.watch(paths.development.styles, ['sass']);
    gulp.watch(paths.development.html, browserSync.reload);
    gulp.watch(paths.development.scripts, browserSync.reload)
});

gulp.task('watch:autofix', gulp.series('browserSync', 'sassLint', 'sass', 'jsLint'), function () {
    gulp.watch(paths.development.styles, ['sassLint', 'sass']);
    gulp.watch(paths.development.html, browserSync.reload);
    gulp.watch(paths.development.scripts, ['jsLint'])
});

gulp.task('jsAndHtmlMinify', function () {
    return gulp.src(paths.development.html).pipe(useref()).pipe(gulpIf('*.js', minify({
        mangle: {
            keepClassName: !0
        }
    }))).pipe(htmlmin({
        collapseWhitespace: !0,
        removeComments: !0
    })).pipe(gulp.dest(paths.production.folder))
});

gulp.task('sassMinify', function () {
    return gulp.src(paths.development.styles).pipe(sass()).pipe(cleanCSS()).pipe(gulp.dest(paths.production.folder))
});

gulp.task('imagesMinify', function () {
    return gulp.src(paths.development.images).pipe(cache(imagemin())).pipe(gulp.dest(paths.production.images))
});

gulp.task('clean:production', function () {
    return del.sync(paths.production.folder)
});

gulp.task('production', function (callback) {
    const minify = ['jsAndHtmlMinify', 'sassMinify', 'imagesMinify'];
    runSequence('clean:production', minify, callback)
});