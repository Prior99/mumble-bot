const Webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const extractCSS = new ExtractTextPlugin('[name].css');
const gitRevision = new GitRevisionPlugin({ lightweightTags: true });

module.exports = {
    entry: {
        bundle: path.resolve(__dirname, "src/web"),
        "service-worker": path.resolve(__dirname, "src/service-worker"),
    },
    context: __dirname + "/dist/",
    output: {
        path: __dirname + "/dist/",
        filename: "[name].js",
        publicPath: "/"
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|woff|ttf|woff2|eot)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            hash: "sha512",
                            digest: "hex",
                            name: "[hash].[ext]"
                        }
                    }
                ]
            },
            {
                test: /\.tsx?/,
                loader: "awesome-typescript-loader",
                exclude: [
                    /__tests__/,
                    // path.resolve(__dirname, "src/server")
                ]
            },
            {
                test: /\.css$/,
                loader: extractCSS.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: { sourceMap: true }
                        },
                        {
                            loader: "resolve-url-loader"
                        }
                    ]
                })
            },
            {
                test: /\.(scss)$/,
                loader: extractCSS.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                importLoaders: 1,
                                localIdentName: '[name]_[local]_[hash:base64:5]',
                                sourceMap: true
                            }
                        },
                        {
                            loader: "resolve-url-loader"
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                })
            }
        ]
    },
    devtool: "source-map",
    devServer: {
        port: 3000,
        historyApiFallback: true,
        contentBase: __dirname + "/dist/"
    },
    plugins: [
        new Webpack.NormalModuleReplacementPlugin(/typeorm$/, result => {
            result.request = result.request.replace(/typeorm/, "typeorm/browser");
        }),
        extractCSS,
        new Webpack.DefinePlugin({
            // Taken and adapted from the official README.
            // See: https://www.npmjs.com/package/git-revision-webpack-plugin
            "SOFTWARE_VERSION": JSON.stringify(gitRevision.version())
        }),
        new ProgressBarPlugin()
    ],
    node: {
        child_process: "empty",
        fs: "empty",
        net: "empty",
        readline: "empty",
    },
};
