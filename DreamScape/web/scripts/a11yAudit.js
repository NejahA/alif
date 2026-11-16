const { AxeBuilder } = require('axe-webdriverjs');
const { Builder } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

(async () => {
  // Launch a headless Chrome instance
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(require('selenium-webdriver/chrome').Options().headless())
    .build();

  try {
    const distPath = path.resolve(__dirname, '../../web/dist');
    const indexFile = `file://${distPath}/index.html`;
    await driver.get(indexFile);

    const results = await new AxeBuilder(driver).analyze();
    const reportPath = path.resolve(__dirname, 'a11y-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log('Accessibility audit completed. Report saved to', reportPath);
  } catch (e) {
    console.error('Error during accessibility audit:', e);
  } finally {
    await driver.quit();
  }
})();
