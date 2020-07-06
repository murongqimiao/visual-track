// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: false,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    eqeqeq: 'off', // 不能始用==
    'no-unused-vars': 'off', // 消除未使用的变量
    'no-undef': 'off', // 未使用变量报错
    'no-unreachable': 'off', // 不能执行的代码检测
    //此处一下还可以根据个人习惯设置更多个性化内容
    'space-before-function-paren': ["error", {
      "anonymous": "ignore",
      "named": "ignore",
      "asyncArrow": "ignore"
    }],
  }
}