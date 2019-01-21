const gulp = require('gulp'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    browserSync = require('browser-sync').create(),
    useref = require('gulp-useref'),
    gulpIf = require('gulp-if'),
    purgecss = require('gulp-purgecss'),
    runSequence = require('run-sequence'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    eslint = require('gulp-eslint'),
    gulpStylelint = require('gulp-stylelint'),
    prefix = require('gulp-autoprefixer'),
    minify = require('gulp-babel-minify'),
    fse = require('fs-extra'),
    prompt = require('gulp-prompt'),
    through = require('through2');

// importeer het scss.json bestand met de naam: directories.
const styleguides = require('./.eslintrc.json'),
    directories = require('./scss-files.json'),
    words = require('./check-words.json');

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
        folder: 'production',
        images: 'production/images',
        css: {
            purge: ['src/**/*.html'],
            version: ['last 2 versions', 'ie >= 7'],
        },
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
    },
    info: {
        promptMessage: 'Running this command for the second time and up, will override your .scss files. Do you want to continue?',
    }
};

gulp.task('prettify', function (callback) {
    runSequence('SassLint', 'JsLint', callback);
});

// Een lijst waar alle bestanden in worden gepushed als er een woord in zit dat niet gebruikt mag worden.
let fileList = [];
gulp.task('contains', function(){
    // Luister naar alle .html bestanden in de src folder. 
    gulp.src([config.development.html])
        // gebruik 'through' om een functie in een pipe te gebruiken
        .pipe(through.obj(function (file, enc, cb) {
            // De 'output' van de files moeten eerst de .toString() method gebruikt om het bestand lees- en bruikbaar te maken:
            // .toString() wordt gebruik omdat de output om te zetten van een Buffer (hexadecimaal geformateerde html) naar een string
            let contents = file.contents.toString();
            // Roep de functie aan die het bestand checkt op de woorden. De eerste parameter is de content en de tweede het pad naar het bestand toe.
            checkFiles(contents, file.relative);
            // callback
            cb(null);
        }))
        .pipe(gulp.dest(config.root.path))
        // Als alles 'klaar' is worden er, als er fouten zijn, deze gelogged 
        .on ('end', function () {
            if(fileList.length > 0){
                console.log(fileList);
                // process.exit(1); wordt aangeroepen, zodat alle tasks of npm run <scripts> niet uitgevoerd kunnen worden
                process.exit(1);
            }
        });
});

function checkFiles(c, f){
    // Maak de content van de bestanden en de woorden in de array 'lowercase', zodat het niet hoofdletter gevoelig is.
    c = c.toLowerCase();
    // loop over alle worden in de 'check-words.json' array dat geimporteerd is als 'words'.
    for (let i = 0; i < words.length; i++) {
        let word = words[i].toLowerCase();
        // check of er woorden voorkomen in de bestanden en als dat zo is 'push': het path van het bestand en het woord dat erin voorkomt in de 'fileList' array
        if (c.indexOf(word) >= 0) {
            fileList.push(`file: "${f}" contains: "${word}"`);
        }
    }
}

// Task met waarschuwings bericht
gulp.task('prompting', function () {
    return gulp.src(config.root.allFiles, {
        base: config.root.path
    }).pipe(prompt.confirm(config.info.promptMessage));
});

// parentFiles zijn de bestanden die in dezelfde map staan als de App.scss
// En deze worden geïmporteerd in de App.scss
let parentFiles = [];

// Omdat de task om bestanden aan te maken al je bestanden die in dezelfde map staan overschrijft, wordt er voordat het wordt uitgevoerd
// Een andere task 'prompting' uitgevoerd die je een waarschuwings bericht geeft die je moet accepteren om de functie uit te laten voeren.
gulp.task('mkdir', ['prompting'], function () {
    // zet het path naar waar de bestanden opgeslagen moeten worden
    let pathToFolder = config.development.styleFolder;
    // initialize de functie met de directories data en een leeg path.
    // (dit word eerst uitgevoerd voordat het door gaat naar de parentFiles en makeFiles funcite)
    subFileLoop(directories, '');
    // format alle data uit parentFiles naar een string en verwijder de comma's
    parentFiles = parentFiles.join('').replace(/,/g, ' ');
    // initialize de functie die zorgt voor het aanmaken van de bestanden. 
    // eerste parameter is voor het path van de file en de tweede is de data die erin moet.
    makeFiles(pathToFolder + directories.main, parentFiles);
});

function subFileLoop(target, parent) {
    // Zet pathToFolder gelijk aan het pad voor de bestanden
    let pathToFolder = config.development.styleFolder;
    // fileUrls is het pad naar de 'hoofd children bestand'. wat dit in houdt is dat als je een map hebt met 1 bestand (parentTest.scss) 
    // en een andere map daarin met 5 bestanden (test.scss, test2.scss etc...)
    // Er 1 bestand (hoofdtest.scss) in die map zit die de andere 4 in laadt.
    // En dat pad van (hoofdtest.scss) word in (parenttest.scss) gezet.
    let fileUrls = [];
    // Zet de parents variable gelijk aan de parameter van de functie.
    let parents = parent;

    // Als parents 'waar' is zet het gelijk aan pathToFolder + de parameter van de functie
    if (parents) {
        pathToFolder = `${pathToFolder + parents}/`;
    }

    // Loop over alle objecten in het json bestand (zie: 'scss-files.json')
    for (let key of Object.keys(target)) {
        // Als het object niet de naam 'main' heeft voer dan de rest uit
        if (key !== 'main') {
            // variable p is gelijk aan key + / (uitkomst: main/)
            let p = key + '/';
            // Formateer de 'key' naam met '__' en '.scss' om er een scss bestand van te maken
            let fileName = `__${key}${config.suffix.scss}`;
            // childFiles zijn alle children die in de parent geladen moeten worden (@import directory.file.scss)
            let childFiles = '';
            // Initialize element
            let element = '';
            // Variable makeFile dat ervoor zorgt dat als er geen bestand word aangemaakt als het false is
            let makeFile = false;
            // loop over de arrys van de objects
            for (let i = 0; i < target[key].length; i++) {
                // Zet element gelijk aan de naam van een element in de array
                element = target[key][i];

                // Als element een object is word de functie nog een keer uitgevoerd, omdat je niet het element als path kan gebruiken in
                // de makeFiles function, omdat het geen string is
                if (typeof element == 'object') {

                    // voer de functie nog een keer uit: element (bijvoorbeeld { test: {...} }) is de target parameter waar de bestanden worden gemaakt,
                    // parents + '/' + key ( components/footer/../.. (gaat zo ver door totdat er geen object meer is) )
                    // parents + '/' + key is het pad waar de bestanden in moeten komen 
                    // bijvoorbeeld de bestanden moeten in de map 'footer' komen die in de map 'components' zit die in de map 'styles zit' (styles komt uit het pathToFolder variable)
                    subFileLoop(element, parents + '/' + key);
                    
                    // Nadat de functie is uitgevoerd worden de namen en het pad van de files gelooped, om deze data in het parent bestand te zetten, zodat het geimporteerd wordt.
                    for (let names of Object.keys(element)) {
                        // Soms komt het voor dat het element een array is dat leeg is of dat het een object is
                        // Als dat niet zo is betekent dat erin bestanden in de array zitten
                        if (element[names].length == 1 && typeof element[names][0] !== 'object') {
                            // Het pad naar het 'hoofd children bestand' word in fileUrls gepushed en makeFile wordt 'waar', zodat dat bestand word aangemaakt
                            fileUrls.push(`@import '${names}/${('' + element[names][0]).replace(/_/g, '')}';\n`);
                            makeFile == true;
                        } else {
                            // Als er maar 1 bestand in een map zit word deze geïmporteerd en wordt het 'hoofd children bestand' niet aangemaakt.
                            fileUrls.push(`@import '${names}/_${names}${config.suffix.scss}';\n`);
                        }
                    }
                    // We legen de parentFiles, zodat de bestanden die dieper zitten niet ingeladen worden in de App.scss.
                    parentFiles = [];
                } else {
                    // Hier worden alle bestanden aangemaakt van je scss-files.json, zonder content
                    makeFiles(pathToFolder + p + element, '');
                    // child bestanden worden geïmporteerd in het 'hoofd children bestand'
                    fileUrls.push(`@import '${element.replace('_', '')}';\n`);
                }
            }

            // Formateer de array naar een string ( .join('') ), zodat de comma's van de array weggehaald 
            // kunnen worden en alles op een nieuwe lijn kunne plaatsen door de '\n'
            // En haal de '_' weg van de naam om te voldoen aan de .scss import standaarden.
            // bestand heet _file.scss en word geïmporteerd door @import file.scss
            // Als je een bestand hebt dat je wilt importeren dat ook andere bestanden importeerd, dan heet het bestand __file.scss 
            // en word geimporteerd door@import _file.scss
            childFiles = fileUrls;
            childFiles = childFiles.join('');

            // p + fileName is het pad naar alle 'hoofd children' bestanden. 
            parentFiles.push(`@import '${p + fileName.replace('_', '')}';\n`);

            // Als er 2 of meer bestanden in de folder zitten of het element gelijk is aan een object en makeFile waar is, dan wordt de makeFiles functie uitgevoerd. 
            if (target[key].length >= 2 || typeof element === 'object' && makeFile) {
                makeFiles(pathToFolder + p + fileName, childFiles);
            }

            // Maak de fileUrls weer leeg, zodat er geen dubbelen imports komen
            fileUrls = [];
        }
    }
}

// De makeFiles functie maakt de bestanden aan met behulp van de 'fse' dependency (file system extra)
function makeFiles(filePath, fileContent) {
    // Het krijgt twee parameters de eerste: filePath is het pad waar het bestand in moet komen en de tweede: fileContent, is de content wat erin moet.
    // Als het pad en/of bestand nog niet gemaakt is, maakt het het uit zichzelf aan.
    // En het krijgt een 'callback': err
    fse.outputFile(filePath, fileContent, err => {
        if (err) {
            console.log(err);
        }
    });
}

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

gulp.task('sassLint', function () {
    return gulp.src(config.development.styles, {
        base: config.root.path
    }).pipe(gulpStylelint({
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

gulp.task('sass', function () {
    return gulp.src(config.development.styles)
        .pipe(sass())
        .pipe(prefix(config.production.css.version))
        .pipe(gulp.dest(config.development.folder))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: config.development.folder
        },
    });
});

gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch(config.development.styles, ['sass']);
    gulp.watch(config.development.html, browserSync.reload);
    gulp.watch(config.development.scripts, browserSync.reload);
});

const autofix = [
    'browserSync', 
    'sassLint', 
    'sass', 
    'jsLint',
];
gulp.task('watch:autofix', autofix, function () {
    gulp.watch(config.development.styles, ['sassLint', 'sass']);
    gulp.watch(config.development.html, browserSync.reload);
    gulp.watch(config.development.scripts, ['jsLint']);
});

gulp.task('jsAndHtmlMinify', function () {
    return gulp.src(config.development.html)
        .pipe(useref())
        .pipe(gulpIf(`*${config.suffix.js}`,
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
        .pipe(gulp.dest(config.production.folder));
});

gulp.task('sassMinify', function () {
    return gulp.src(config.development.styles)
        .pipe(sass())
        .pipe(purgecss({
            content: config.production.css.purge
        }))
        .pipe(prefix(config.production.css.version))
        .pipe(cleanCSS())
        .pipe(gulp.dest(config.production.folder));
});

gulp.task('imagesMinify', function () {
    return gulp.src(config.development.images)
        .pipe(cache(imagemin()))
        .pipe(gulp.dest(config.production.images));
});

gulp.task('clean:production', function () {
    return del.sync(config.production.folder);
});

gulp.task('production', function (callback) {
    const minify = [ 'jsAndHtmlMinify', 'sassMinify', 'imagesMinify' ];
    runSequence('clean:production', minify, callback);
});
