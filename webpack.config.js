module.exports = {
  entry: "./src/index.jsx",
  output: {
    path: __dirname,
    filename: 'main.js',
    libraryTarget: "commonjs2"
  },
  devtool: "none", // prevent webpack from using eval() on my module
  module: {
    
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          plugins: [
            "transform-react-jsx"
          ]
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader', options: { sourceMap: true } },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ]
  },
  externals: {
    scenegraph: 'scenegraph',
    application: 'application',
    uxp: 'uxp',
    os: 'os'
  }
};