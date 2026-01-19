var path = require('path');

module.exports = {
    entry: ["regenerator-runtime/runtime.js", path.join(__dirname, 'srcjs', 'main.jsx')],
    output: {
        path: path.join(__dirname, 'inst/www/esq.handsontable/main_bundle'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$|jsx/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    externals: {
        'react': 'window.React',
        'react-dom': 'window.ReactDOM',
        'reactR': 'window.reactR'
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};
