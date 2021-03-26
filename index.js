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
            // const links = []
            // const elements = document.querySelectorAll('ol > li .ui-search-result__wrapper .ui-search-result__image a')
                // .forEach(element => links.push(element.href))

            // return links

        // })

        // for (const link of linkPages) {
        //     await page.goto(link)
        //     console.log(`visitando la pagina ${link}`);
        // }

        await page.goto('https://casa.mercadolibre.com.co/MCO-612776051-vendo-casa-en-villa-del-doradobogota-mls-21-429-_JM#position=1&type=item&tracking_id=337c21fe-425e-4f35-9482-a3c06845e517')

        const property = await page.evaluate(() => {
            const mainTitle = document.querySelector('.item-title h1').innerText
            const category = document.querySelector('.vip-classified-info dl').innerText
            const rooms = parseInt(document.querySelector('#productInfo .item-attributes .align-room').innerText)
            const bathrooms = parseInt(document.querySelector('#productInfo .item-attributes .align-bathroom').innerText)

            const ubication = {
                address: document.querySelector('section > div.section-map-title > div > h2').innerText,
                location: document.querySelector('section > div.section-map-title > div > h3').innerText,
            }

            const parking = parseInt(document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span').innerText)
            const age = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > span').innerText
            const description = document.querySelector('#description-includes p').innerText

            const images = []
            document.querySelectorAll('#gallery_dflt > div a')
                .forEach(element => images.push(element.href))

            const details = []
            document.querySelectorAll('.item-details__content.ui-view-more__content > ul > li')
                .forEach((element) => details.push(element.innerText))

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
                parking,
                age,
                details,
                ubication,
                description,
                images,
            }

        })

        property.url = page.url()
        console.log(property);


        ///     await page.screenshot({
        //         path: `page-${sites.indexOf(site)}.jpg`,
        //         fullPage: true,
        //     })

    } catch (error) {
        console.log(`Something was wrong. ${error}`);
    }
    console.timeEnd('End to scrape');
}


init()


