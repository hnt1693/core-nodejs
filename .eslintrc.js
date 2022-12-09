module.exports = {
    env: {
        commonjs: true,
        node    : true,
        browser : true
    },
    extends      : ['eslint:recommended', 'google'],
    overrides    : [],
    parser       : '@babel/eslint-parser',
    parserOptions: {
        'ecmaVersion' : 2020,
        'ecmaFeatures': {
            'experimentalObjectRestSpread': true
        },
        'requireConfigFile': false
    },
    rules: {
        'array-bracket-newline'   : ['error', {multiline: true}],
        'array-element-newline'   : ['error', 'consistent'],
        'comma-spacing'           : ['error', {before: false, after: true}],
        'semi'                    : ['error', 'always'],
        'quotes'                  : ['error', 'single'],
        'comma-dangle'            : ['error', 'never'],
        'dot-location'            : ['error', 'property'],
        'implicit-arrow-linebreak': ['error', 'beside'],
        'key-spacing'             : ['error', {align: 'colon', beforeColon: false}],
        'keyword-spacing'         : ['error', {after: true}],
        'multiline-ternary'       : ['error', 'never'],
        'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
        'no-multi-spaces'         : 'error',
        'object-curly-spacing'    : ['error', 'never'],
        'operator-linebreak'      : ['error', 'before'],
        'padded-blocks'           : ['error', 'never'],
        'space-before-blocks'     : ['error', 'always'],
        'max-len'                 : ['error', {code: 120}],
        'require-jsdoc'           : 0,
        'no-invalid-this'         : 0,
        'indent'                  : ['error', 4],
        'no-console'              : 0,
        'no-prototype-builtins'   : 0,
        'new-cap'                 : 0,
        'no-undef'                : 0,
        'no-useless-catch'        : 0
    }
};
