module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2019
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
};
