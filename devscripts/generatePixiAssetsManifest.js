const sourceManifest = require("../src/assets/manifest.json");

module.exports = function generatePixiAssetsManifest(seed, files, entries) {
    return Object.assign({}, sourceManifest, {
        bundles: [
            {
                name: "all",
                assets: files.map((file) => ({
                    alias: file.name,
                    src: file.name,
                })),
            },
            ...sourceManifest.bundles
        ]
    });
};
