// 'uglifyjsWebpackPlugin' wordt gebruikt om alle javascript te comprimeren
const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
// Yargs, zie gulpfile.js uitleg
const yargs = require('yargs');
const prod = yargs.argv.prod;

module.exports = {
    // entry: naar welk bestand moet gulp luisteren
    entry: './src/assets/scripts/index.js',
    // output: hoe moet het gebundelde/ gecomprimeerde bestand heten
    /*
        Webpack zorgt er ook voor dat we in onze javascript bestanden, andere bestanden kunnen importeren.
        Want het zorgt ervoor dat het bij elkaar gebundelt wordt (tenzij je dat anders aan geeft) 
        Zonder webpack krijg je een error, 'cannot read require of undefined' (denk uit mijn hoofd dat dit de error is...)
    */
    output: {
        filename: 'bundle.js',
    },
    // Terneray operator om te bepalen welke mode er gebruikt moet worden. Is prod 'true' dan wordt 'production', anders 'development'
    mode: prod ? 'production' : 'development',
    // Terneray operator om te bepalen of er inline-source-map gebruikt moet worden. Als prod 'false' is gebruik 'inline-source-map', anders 'false'
    devtool: !prod ? 'inline-source-map' : false,
    optimization: {
        usedExports: true,
        /*
            In dit voorbeeld wordt splitChunks gebruikt om alle dependicies vanuit de node_modules 
            die gebruikt worden in mijn javascript bestanden in een ander bestand te zetten.
            (zoals: 'import path from "path"')

            Omdat de node_modules niet vaak geupdate is het beter om dit bestand in de cache van de website te laten staan.
            Wat dit betekent is dat de gebruiker maar één keer de node_modules op hoeft te halen en zolang het niet aangepast wordt blijft het in het geheugen van de site staan.
            Hierdoor laadt de pagina ook een stuk sneller, omdat de gebruiker alleen nog maar de andere javascript bestanden hoeft op te halen.

            (Dit heeft niet echt voordelen als je bijvoorbeeld een Wordpress website maakt, omdat je niet vaak node_modules in je website gebruikt
            Maar als je bijvoorbeeld een website in react maakt, gebruik je er juist heel veel, dus is het beter om het in een apart bestand op te slaan)
        */
        splitChunks: {
            // pakt alle node_module bestanden die groter zijn dan 0k.
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // Pak het node_module package
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        // Haal de '@' symbool weg, omdat het misschien problemen op kan leveren met de back end
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
        /*
            Hier wordt de 'uglifyjsWebpackPlugin' plugin aangeroepen om de javascript te comprimeren.
            (Dit werkt alleen in production mode)
        */
        minimizer: [
            new uglifyjsWebpackPlugin({
                // Webpack bundelt al je bestanden in één (of meer) bestanden, maar je kan nog wel zien waar sommige errors vandaan komen
                // Omdat de errors aan de locatie van de modules zijn gekoppeld. 
                // In productie mode maakt dit niet uit, dus we zetten het uit om webpack sneller de bestanden te laten bundelen
                sourceMap: false,
                uglifyOptions: {
                    ie8: false,
                    // Welke ES versie er wordt gebruikt in de code (ik heb ES8 gedaan)
                    ecma: 8,
                    // Namen worden korter gemaakt
                    mangle: true,
                    output: {
                        // Comments worden uit de bestanden gehaald
                        comments: false,
                        // Alles word gecomprimeerd
                        beautify: false
                    },
                    // Alle warnings zijn niet zichtbaar in de console
                    warnings: false
                }
            })
        ]
    },
    // Hier wordt elk javascript bestand behalve alle bestanden in de node_modules folder door Babel-loader gehaald om ES2015+ syntax om te zetten naar ES5, zodat elke browser het kan lezen.
    module: {
        rules: [
          {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/,
          },
        ],
    },
};