const puppeteer = require('puppeteer')
const sites = [
    'https://listado.mercadolibre.com.co/inmuebles/casas/venta/bogota-dc/#origin=search&as_word=true',
    'https://listado.mercadolibre.com.co/inmuebles/casas/arriendo/bogota-dc/#origin=search&as_word=true',
    'https://listado.mercadolibre.com.co/inmuebles/apartamentos/venta/bogota-dc/#origin=search&as_word=true',
    'https://listado.mercadolibre.com.co/inmuebles/apartamentos/arriendo/bogota-dc/#origin=search&as_word=true'
]

const init = async () => {

    console.time('End to scrape');
    try {
        console.log('Start to scrape')
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({
            height: 768,
            width: 1366,
            deviceScaleFactor: 1
        })
        for (site of sites) {
            await page.goto(site)
            await page.screenshot({
                path: `page-${sites.indexOf(site)}.jpg`,
                fullPage: true,
            })
        }
    } catch (error) {
        console.log(`Something was wrong. ${error}`);
    }
    console.timeEnd('End to scrape');
}


init()


