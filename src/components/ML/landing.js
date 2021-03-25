const puppeteer = require('puppeteer')

const init = async () => {

    try {
        console.time('Time to scraping')
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({
            height: 768,
            width: 1366,
            deviceScaleFactor: 1
        })
        // Por defecto se muestra Venta y Apartamentos
        await page.goto('https://www.mercadolibre.com.co/inmuebles')

        // enable this lines for select the opciont
        // await page.click('#searchOperations')
        // await page.keyboard.press('ArrowDown') //enable this line for select option "arriendo"

        // Enablr this lines for select category
        // await page.click('#searchCategories')
        // await page.keyboard.down('ArrowDown') //enable this line for select option "casas"



        await page.waitForSelector(`.nav-search-classi >.nav-search-classi-content >.ch-popover-wrapper input`)
        await page.type(`.nav-search-classi > .nav-search-classi-content > .ch-popover-wrapper input`, ' Bogotá D.C.', { delay: 100 })
        await page.waitForSelector(`.nav-search-classi > .nav-search-classi-content > .ch-popover-wrapper > .ch-popover > ul > .ch-autocomplete-item`, )
        await page.waitForTimeout(500)
        await page.click(`.nav-search-classi > .nav-search-classi-content > .ch-popover-wrapper > .ch-popover > ul > .ch-autocomplete-item`)
        console.timeEnd('Time to scraping')
    } catch (error) {
        console.log(`Something was wrong. ${error}`);
    }

}


module.exports = init()


