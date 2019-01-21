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
prefix = require('gulp-autoprefixer'),
/*
    webpack wordt gebruikt omdat we anders webpack niet in gulp kunnen gebruiken... 
    webpackStream, zorgt ervoor (in dit voorbeeld) dat we webpack in een pipe kunnen gebruiken.
*/
webpack = require('webpack'),
webpackStream = require('webpack-stream'),
/*
    Yargs is een dependencie dat ervoor zorgt dat je gebruik kan maken van 'arguments' in je commandline.
    Dit is nodig omdat webpack twee verschillende modes heeft: Productie, Development en ze hebben ook alle twee verschillende methodes om (in mijn geval) de javascript bestanden te bundelen. 

    Deze twee modes worden aangeroepen d.m.v '--prod' (voor production) en '--dev' (voor development) aan te roepen in de commandline.
    Ik assign een variable aan dit argument en als '--prod' wordt gebruikt is de variable 'true' als het neit wordt gebrukt is het 'false' 
    En deze variable gebruik ik verder in mijn gulpfile om verschillende taken aan te roepen.

    En omdat we de webpack inporteren en gebruiken in de gulpfile kan je het argument ook gebruiken in de webpack.config.js 
*/
yargs = require('yargs');
const prod = yargs.argv.prod;

sass.compiler = require('node-sass');

// Hier word het webpack bestand geiimporteerd, zodat we de javascript bestanden kunnen bundelen volgens onze aangegeven regels en plugins
const webpackConfig = require('./webpack.config.js');

const paths = {
    production: {
        folder: './production',
        images: './production/static/images',
        css: {
            purge: ["./src/**/*.html"]
        }
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
    .pipe(gulp.dest(paths.dist.folder))
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
      /*
         Hier wordt gekeken met 'gulpIf' of er het '--prod' argument is gebruikt.
         Wordt het gebruikt, dan worden de javascript bestanden in de 'productie folder' geplaats.
         Als het niet wordt gebruikt komt het in de 'dist folder' en wordt de pagina herladen met 'browserSync'

         De reden dat dit zo wordt gedaan is omdat deze gulp task wordt aangeroepen in twee andere tasks: 'gulp production' en 'gulp watch'.
         In 'gulp production' worden alle bestanden gecomprimeerd, gebundeld en komt het in de productie folder.
         En in de 'gulp watch' wordt het alleen gebundeld en in de 'dist folder' gezet.

         Ik heb het zo gedaan omdat ik het overzichtelijker vind om, als we nog niet toe zijn aan de productie versie, het ook niet in een productie folder moet komen
      */
      .pipe(gulpIf(prod, gulp.dest(paths.production.folder)))
      .pipe(gulpIf(!prod, gulp.dest(paths.dist.folder)))
      .pipe(gulpIf(!prod, browserSync.reload({ stream: true })))
});

gulp.task('sassMinify', () => {
    return gulp.src(paths.development.styles)
    .pipe(sass())
    .pipe(purgecss({
        content: paths.production.css.purge,
        keyframes: true,
        fontFace: true,
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.production.folder))
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
