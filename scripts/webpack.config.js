const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");

let uiVersion = require("./package.json").version;

module.exports = (env, argv) => {

    const CDN_PATH = argv.cdnBaseURL || process.env.CDN_BASE_URL || '/cdn';

    let config = {
        watchOptions: {
            ignored: ["node_modules", "*.js", "*.js.map", "*.d.ts", "cdn"]
        },
        entry: {
            "styles": path.join(__dirname, "src/ui/styles/Styles.scss"),
            "app": path.join(__dirname, "src/App.ts")
        },
        output: {
            path: path.resolve(__dirname, "cdn", uiVersion),
            filename: `[name].js`,
            publicPath: `${CDN_PATH}/${uiVersion}/`
        },
        optimization: {
            runtimeChunk: false,
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }, {
                    test: /\.tsx?$/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            allowTsInNodeModules: true,
                            configFile: path.join(__dirname, "/browser-tsconfig.json")
                        }
                    }
                }, {
                    test: /\.(png|svg|jpg|gif|pdf)$/,
                    use: [
                        "file-loader?name=[name].[ext]"
                    ]
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `[name].css`
            }),
            new CopyPlugin([
                {from: path.join(__dirname, "src/ui/media/*.*"), flatten: true}
            ])
        ]
    };

    if (argv.mode === "development") {
        config.devtool = "cheap-module-eval-source-map";
    }

    return config;
};