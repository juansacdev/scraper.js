const puppeteer = require('puppeteer')
const json2csv = require('json2csv')
const fs = require('fs').promises

const init = async () => {

    try {
        console.log('Start to scrape')
        console.time('End to scrape')
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        await page.setViewport({
            height: 768,
            width: 1366,
            deviceScaleFactor: 1
        })

        await page.goto('https://casa.mercadolibre.com.co/MCO-613461989-vendo-casa-niza-mls-21-995-rcc-_JM#position=5&type=item&tracking_id=e7d8d199-8de5-493f-9476-65b57579bde4')
        const property = await page.evaluate(() => {
            const mainTitle = document.querySelector('.item-title h1')
                .innerText
                .replaceAll(/(\r\n|\n|\r)/gm, "")
                .trim()
            const category = document.querySelector('.vip-classified-info dl')
                .innerText
                .replaceAll(/(\r\n|\n|\r)/gm, "")
                .trim()
            const rooms = document.querySelector('#productInfo .item-attributes .align-room')
                .innerText
                .replaceAll(/(\r\n|\n|\r)/gm, "")
                .trim()
            const bathrooms = document.querySelector('#productInfo .item-attributes .align-bathroom')
                .innerText
                .replaceAll(/(\r\n|\n|\r)/gm, "")
                .trim()

            const ubication = {
                address: document.querySelector('section > div.section-map-title > div > h2')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
                location: document.querySelector('section > div.section-map-title > div > h3')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
            }

            const areaLabels = [
                'Superficie total',
                'Área construida',
                'Superficie de terreno',
            ]

            const labels = [
                document.querySelector('.specs-container ul li:first-child strong')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
                document.querySelector('.specs-container ul li:nth-child(2) strong')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
                document.querySelector('.specs-container ul li:nth-child(3) strong')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
            ]

            const values = [
                document.querySelector('.specs-container ul li:first-child span')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
                document.querySelector('.specs-container ul li:nth-child(2) span')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
                document.querySelector('.specs-container ul li:nth-child(3) span')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim(),
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

            const lastChild = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > strong')
                .innerText
                .replaceAll(/(\r\n|\n|\r)/gm, "")
                .trim()
            let age
            let parking
            let parkingLabel
            let adminAmount = ''

            switch (lastChild) {
                case "Antigüedad":
                    age = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > span')
                        .innerText
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    parkingLabel = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > strong')
                        .innerText
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    parking = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span')
                        .innerText
                        .concat(' ', parkingLabel)
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    break
                case "Valor administración":
                    adminAmount = document.querySelector('.specs-container.specs-layout-alternate > ul > li:last-child > span')
                        .innerText
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    age = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span')
                        .innerText
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    parkingLabel = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > strong')
                        .innerText
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    parking = document.querySelector('.specs-container.specs-layout-alternate > ul > li:nth-last-child(3) > span')
                        .innerText
                        .concat(' ', parkingLabel)
                        .replaceAll(/(\r\n|\n|\r)/gm, "")
                        .trim()
                    break
            }

            let description = document.querySelector('#description-includes p') || ''
            if (description){
                description = document.querySelector('#description-includes p')
                    .innerText
                    .replaceAll(/(\r\n|\n|\r)/gm, "")
                    .trim()
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
        console.log(property)

        const data =[]
        data.push(property)

        const csv = json2csv.parse(data, {
            quote:'',
            escapedQuote: '',
            delimiter: '|',
        })

        await fs.writeFile('./src/public/demoML.csv', csv, { encoding:'utf-8' })
            .then(() => console.log('Data has been writed successfully! 🔥'))

        await browser.close()
            .then(() => console.log('Good bye 👋'))

    } catch (error) {
        console.log(`Something was wrong. ${error}`)
    }
    console.timeEnd('End to scrape')
}

init()