const path = require('path');

module.exports = {
    chainWebpack: config => {
        config.module.rules.delete('eslint');
    },
    outputDir: path.resolve(__dirname, '../server/build-front'),
    devServer: {
    	proxy: 'http://localhost:3000'
 	},

    pluginOptions: {
      i18n: {
        locale: 'en',
        fallbackLocale: 'en',
        localeDir: 'locales',
        enableLegacy: true,
        runtimeOnly: false,
        compositionOnly: true,
        fullInstall: true
      }
    }
}
