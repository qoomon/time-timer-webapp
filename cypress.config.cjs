const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5176',
    screenshotsFolder: 'cypress/screenshots',
    video: false,
  },
})
