const path = require("path")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")

module.exports = {
  entry: {
    compareBatch: "./src/comparison/lambdas/compareBatch.ts",
    compareSingle: "./src/comparison/lambdas/compareSingle.ts",
    gatherStats: "src/comparison/lambdas/gatherStats.ts",
    rerunFailures: "./src/comparison/lambdas/rerunFailures.ts"
  },
  resolve: {
    modules: [path.resolve("./node_modules"), path.resolve("."), path.resolve(".")],
    extensions: [".js", ".json", ".ts"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "..", "build"),
    filename: "[name].js"
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        "bichard7-next-data": {
          test: /[\\/]node_modules[\\/]bichard7-next-data-.*?[\\/]/,
          name(module) {
            const moduleFileName = module.identifier().match(/(?<moduleName>bichard7-next-data-.*?)[\\/]/)
              .groups.moduleName
            return moduleFileName
          },
          chunks: "all"
        }
      }
    }
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    node: "14"
                  }
                }
              ],
              ["@babel/preset-typescript"]
            ]
          }
        }
      }
    ]
  },
  plugins: [new ForkTsCheckerWebpackPlugin()]
}
