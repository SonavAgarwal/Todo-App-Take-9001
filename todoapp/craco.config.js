const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    webpack: {
        plugins: {
            add: [
                new NodePolyfillPlugin({
                    excludeAliases: ["console"],
                }),
            ],
        },
        node: {
            fs: false,
        },
        // configure: {
        //     resolve: {
        //         fallback: {
        //             // path: require.resolve("path-browserify"),
        //             // crypto: require.resolve("crypto-browserify"),
        //             // stream: require.resolve("stream-browserify"),
        //             crypto: require.resolve("crypto-browserify"),
        //             stream: require.resolve("stream-browserify"),
        //             assert: require.resolve("assert"),
        //             http: require.resolve("stream-http"),
        //             https: require.resolve("https-browserify"),
        //             os: require.resolve("os-browserify"),
        //             url: require.resolve("url"),
        //         },
        //     },
        // },
        configure: {
            resolve: {
                fallback: {
                    child_process: false,
                    http2: false,
                    fs: false,
                    net: false,
                    tls: false,
                },
            },
        },
    },
};
