const puppeteer = require('puppeteer')
const fs  = require('fs');

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

        await page.goto('https://listado.mercadolibre.com.co/inmuebles/casas/venta/bogota-dc/#origin=search&as_word=true')

        const linkPages = await page.evaluate(() => {
            const links = []
            document.querySelectorAll('ol > li .ui-search-result__wrapper .ui-search-result__image a')
                .forEach(element => links.push(element.href))

            return links

        })

        let counter = 1
        const properties = []
        for (const link of linkPages) {
            await page.goto(link)
            await page.waitForSelector('.item-title h1')
            const property = await page.evaluate(() => {
                const mainTitle = document.querySelector('.item-title h1').innerText
                const category = document.querySelector('.vip-classified-info dl').innerText
                const rooms = document.querySelector('#productInfo .item-attributes .align-room').innerText
                const bathrooms = document.querySelector('#productInfo .item-attributes .align-bathroom').innerText

                const ubication = {
                    address: document.querySelector('section > div.section-map-title > div > h2').innerText,
                    location: document.querySelector('section > div.section-map-title > div > h3').innerText,
                }

                const areaLabels = [
                    'Superficie total',
                    'Área construida',
                    'Superficie de terreno',
                ]

                const labels = [
                    document.querySelector('.specs-container ul li:first-child strong').innerText,
                    document.querySelector('.specs-container ul li:nth-child(2) strong').innerText,
                    document.querySelector('.specs-container ul li:nth-child(3) strong').innerText,
                ]

                const values = [
                    document.querySelector('.specs-container ul li:first-child span').innerText,
                    document.querySelector('.specs-container ul li:nth-child(2) span').innerText,
                    document.querySelector('.specs-container ul li:nth-child(3) span').innerText,
                ]

                const area = {
                    total: '',
                    built: '',
                    groud: '',
                }

                if (labels.includes(areaLabels[0])) {

                    area.total = values[0]

                    if (labels.includes(areaLabels[1])) {

                        area.built = values[1]

                        if (labels.includes(areaLabels[2])) {

                            area.groud = values[2]

                        }

                    }

                }
                const lastChild = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > strong').innerText
                let age
                let parking
                let adminAmount

                switch (lastChild) {
                    case "Antigüedad":
                        age = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > span').innerText
                        parking = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span').innerText.concat(' parqueadero')
                        break;
                    case "Valor administración":
                        adminAmount = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > span').innerText
                        age = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span').innerText
                        parking = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(3) > span').innerText.concat(' parqueadero')
                        break;
                }

                let description = document.querySelector('#description-includes p') || ''
                if (description){
                    description = document.querySelector('#description-includes p').innerText
                }

                const images = []
                document.querySelectorAll('#gallery_dflt > div a')
                    .forEach(element => images.push(element.href))

                const details = []
                document.querySelectorAll('.item-details__content.ui-view-more__content > ul > li')
                    .forEach((element) => details.push(element.innerText))

                const price = parseInt(document.querySelector('#productInfo .price-tag-fraction')
                    .innerText
                    .replaceAll('.',''))

                return {
                    category,
                    mainTitle,
                    price,
                    rooms,
                    bathrooms,
                    parking,
                    age,
                    adminAmount,
                    details,
                    ubication,
                    area,
                    description,
                    images,
                }

            })
            property.url = page.url()
            properties.push(property)
            console.log(properties)
            console.log(`${counter++}`)
        }

        console.log(properties)

    } catch (error) {
        console.log(`Something was wrong. ${error}`);
    }
    console.timeEnd('End to scrape');
}

init()
