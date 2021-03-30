const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const getLaunch = async () => await puppeteer.launch();

const getStart = async (browser, urlTarget) => {
	const page = await browser.newPage();
	await page.goto(urlTarget);
	return page;
};

const init = async () => {
	try {
		console.log("Start to scrape");
		console.time("End to scrape");
		const browser = await getLaunch();
		const page = await getStart(
			browser,
			"https://casa.mercadolibre.com.co/MCO-613587719-casa-en-bella-suizabogota-rah-fa-21-790-_JM#position=36&type=item&tracking_id=5d6509c4-0788-4b07-a9c0-50758a943d55",
		);

		const property = await page.evaluate(() => {
			const regex = new RegExp(/(\r\n|\n|\r)/, "gim");

			const getInnerText = (selector) =>
				document
					.querySelector(selector)
					?.innerText.replaceAll(regex, "")
					.trim() || "";

			const mainTitle = getInnerText(".item-title h1");
			const category = getInnerText(".vip-classified-info dl");
			const rooms = getInnerText(
				"#productInfo .item-attributes .align-room",
			);
			const bathrooms = getInnerText(
				"#productInfo .item-attributes .align-bathroom",
			);

			const ubication = {
				address: getInnerText(
					"section > div.section-map-title > div > h2",
				),
				location: getInnerText(
					"section > div.section-map-title > div > h3",
				),
			};

			const areaLabels = [
				"Superficie total",
				"Área construida",
				"Superficie de terreno",
			];

			const labels = [
				getInnerText(".specs-container ul li:first-child strong"),
				getInnerText(".specs-container ul li:nth-child(2) strong"),
				getInnerText(".specs-container ul li:nth-child(3) strong"),
			];

			const values = [
				getInnerText(".specs-container ul li:first-child span"),
				getInnerText(".specs-container ul li:nth-child(2) span"),
				getInnerText(".specs-container ul li:nth-child(3) span"),
			];

			const area = {
				total: "",
				built: "",
				groud: "",
			};

			if (labels.includes(areaLabels[0])) {
				area.total = values[0];

				if (labels.includes(areaLabels[1])) {
					area.built = values[1];

					if (labels.includes(areaLabels[2])) {
						area.groud = values[2];
					}
				}
			}

			const lastChild = getInnerText(
				".specs-container.specs-layout-alternate > ul > li:last-child > strong",
			);
			let age;
			let parking;
			let parkingLabel;
			let adminAmount = "";

			switch (lastChild) {
				case "Antigüedad":
					age = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:last-child > span",
					);
					parkingLabel = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > strong",
					);
					parking = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span",
					).concat(" ", parkingLabel);
					break;
				case "Valor administración":
					adminAmount = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:last-child > span",
					);
					age = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > span",
					);
					parkingLabel = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:nth-last-child(2) > strong",
					);
					parking = getInnerText(
						".specs-container.specs-layout-alternate > ul > li:nth-last-child(3) > span",
					).concat(" ", parkingLabel);
					break;
			}

			const description = getInnerText("#description-includes p");

			const images = [];
			document
				.querySelectorAll("#gallery_dflt > div a")
				.forEach((element) => images.push(element.href));

			const details = [];
			document
				.querySelectorAll(
					".item-details__content.ui-view-more__content > ul > li",
				)
				.forEach((element) => details.push(element.innerText));

			const price = parseInt(
				getInnerText("#productInfo .price-tag-fraction").replaceAll(
					".",
					"",
				),
			);

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
			};
		});

		property.url = page.url();
		console.log(property);

		const data = [];
		data.push(property);

		await fs
			.writeFile("./src/public/demoML.json", JSON.stringify(data), {
				encoding: "utf-8",
			})
			.then(() => console.log("Data has been writed successfully! 🔥"));

		await browser.close().then(() => console.log("Good bye 👋"));
	} catch (error) {
		console.error(`Something was wrong. ${error}`);
	}
	console.timeEnd("End to scrape");
};

init();
