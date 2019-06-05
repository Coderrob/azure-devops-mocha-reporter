module.exports = {
    "extends": "airbnb-base",
    "env": {
        "mocha": true,
        "node": true
    },
    "rules": {
        "linebreak-style": 0
    },
    "overrides": [
        {
            "files": [
                "**/*[.-]test.js",
                "**/*/data/*.js"
            ],
            "rules": {
                "no-unused-expressions": "off"
            }
        }
    ]
};