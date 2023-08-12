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
