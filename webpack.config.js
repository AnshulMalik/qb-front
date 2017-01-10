var webpack = require('webpack');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: __dirname,
        filename: './dist/bundle.js'
    },
    resolve: ['', '.js', '.ts'],
    module: {
        loaders: [{
            test: /\.ts/,
            loaders: ['ts-loader'],
            exclude: /node_modules/
        }]
    }
}