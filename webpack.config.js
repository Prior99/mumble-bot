const Webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const extractCSS = new ExtractTextPlugin('[name].css');
const gitRevision = new GitRevisionPlugin({ lightweightTags: true });

module.exports = {
    mode: "development",
    entry: {
        "bundle": path.join(__dirname, "src", "web"),
    },
    context: path.join(__dirname, "dist"),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
        publicPath: "/"
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        alias: {
            "clime": path.join(__dirname, "src", "clime-shim.ts"),
        },
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
                loader: "ts-loader",
                exclude: [
                    /__tests__/,
                ],
                options: {
                    configFile: "tsconfig-webpack.json",
                },
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
    externals: {
        "child_process": "{}",
        "express": "{}",
        "express-ws": "{}",
        "fluent-ffmpeg": "{}",
        "fs": "{}",
        "mumble": "{}",
        "morgan": "{}",
        "net": "{}",
        "readline": "{}",
        "winston": "{}",
        "graceful-fs": "{}",
        "react-native-sqlite-storage": "{}",
        "forever-agent": "{}",
        "tls": "{}",
        "youtube-dl": "{}",
    },
    devtool: "source-map",
    devServer: {
        port: 3020,
        historyApiFallback: true,
        contentBase: path.join(__dirname, "dist")
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
};
