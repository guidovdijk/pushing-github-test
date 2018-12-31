const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const yargs = require('yargs');
const prod = yargs.argv.prod;

module.exports = {
    entry: './src/assets/scripts/index.js',
    output: {
        filename: 'bundle.js',
    },
    mode: prod ? 'production' : 'development',
    devtool: !prod ? 'inline-source-map' : false,
    optimization: {
        usedExports: true,
        splitChunks: {
            chunks: 'all',
        },
        minimizer: [
            new uglifyjsWebpackPlugin({
                sourceMap: true,
                uglifyOptions: {
                    ie8: false,
                    ecma: 8,
                    mangle: true,
                    output: {
                        comments: false,
                        beautify: false
                    },
                    warnings: false
                }
            })
        ]
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            use: 'babel-loader',
          },
        ],
    },
};