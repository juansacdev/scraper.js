const puppeteer = require('puppeteer')

const init = async () => {

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({
            height: 768,
            width: 1366,
            deviceScaleFactor: 1
        })
        await page.goto('https://www.mercadolibre.com.co/inmuebles')
        await page.waitForSelector(`
            .nav-search-classi >
            .nav-search-classi-content >
            .ch-popover-wrapper input`
        )
        await page.type(`
            .nav-search-classi >
            .nav-search-classi-content >
            .ch-popover-wrapper input`,
            ' Bogotá',
            { delay: 100 }
        )
        await page.waitForSelector(`
            .nav-search-classi >
            .nav-search-classi-content >
            .ch-popover-wrapper >
            .ch-popover >
            ul >
            .ch-autocomplete-item`
        )
        await page.keyboard.press(`ArrowDown`, { delay: 300 })
        await page.keyboard.press(`ArrowDown`, { delay: 300 })
        await page.waitForSelector(`
            .nav-search-classi >
            .nav-search-classi-content >
            .ch-popover-wrapper >
            .ch-popover >
            ul >
            .ch-autocomplete-highlighted`
        )
        await page.keyboard.press(`Enter`, {delay: 400})
    } catch (error) {
        console.log(`Something was wrong. ${error}`);
    }

}


module.exports = init()


