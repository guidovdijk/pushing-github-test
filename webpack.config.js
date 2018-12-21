const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    output: {
        filename: 'bundle.js',
    },
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