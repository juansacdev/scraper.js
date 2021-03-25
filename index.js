const puppeteer = require('puppeteer')
const $ = require('cheerio');

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

        // await page.goto('https://listado.mercadolibre.com.co/inmuebles/casas/venta/bogota-dc/#origin=search&as_word=true')

        // const linkPages = await page.evaluate(() => {
        //     const elements = document.querySelectorAll('ol > li .ui-search-result__wrapper .ui-search-result__image a')

        //     const links = []
        //     for (const element of elements) {
        //         links.push(element.href)
        //     }
        //     return links
        // })

        // for (const linkPage of linkPages) {
        //     await page.goto(linkPage)
        //     console.log(`visitando la pagina ${linkPage}`);
        // }

        await page.goto('https://casa.mercadolibre.com.co/MCO-612776051-vendo-casa-en-villa-del-doradobogota-mls-21-429-_JM#position=1&type=item&tracking_id=337c21fe-425e-4f35-9482-a3c06845e517')

        const property = await page.evaluate(() => {
            const mainTitle = document.querySelector('.item-title h1').innerText
            const category = document.querySelector('.vip-classified-info dl').innerText
            const rooms = parseInt(document.querySelector('#productInfo .item-attributes .align-room').innerText)
            const bathrooms = parseInt(document.querySelector('#productInfo .item-attributes .align-bathroom').innerText)
            const price = parseInt(document.querySelector('#productInfo .price-tag-fraction')
                .innerText
                .replaceAll('.',''))
            const area = document.querySelector('#productInfo .item-attributes .align-surface')
                .innerText
                .split(' ', 2)
                .join('')

            return {
                category,
                mainTitle,
                price,
                area,
                rooms,
                bathrooms,
            }
        })
        property.url = page.url()
        console.log(property);


        // const html = await page.evaluate(() => document.body.innerHTML)
        // $('ol > li .ui-search-result__wrapper .ui-search-result__image ')

        // for (site of sites) {
        //         await page.goto(site)
        //         const html = await page.evaluate(() => document.body.innerHTML)
        //         $('.ui-search-breadcrumb__title', html).each(function() {
        //             let title = $(this).text()
        //             console.log(title);
        //         })
        //         $('ol > li .ui-search-result__wrapper a .ui-search-result__content-wrapper .ui-search-item__group--price span .price-tag-fraction', html).each(function () {
        //             let prices = $(this).text()
        //             console.log(prices)
        //         })
            //     await page.screenshot({
        //         path: `page-${sites.indexOf(site)}.jpg`,
        //         fullPage: true,
        //     })
        // }

    } catch (error) {
        console.log(`Something was wrong. ${error}`);
    }
    console.timeEnd('End to scrape');
}


init()


