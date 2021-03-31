const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const sites = [
	"https://listado.mercadolibre.com.co/inmuebles/casas/venta/bogota-dc/",
	"https://listado.mercadolibre.com.co/inmuebles/casas/arriendo/bogota-dc/",
	"https://listado.mercadolibre.com.co/inmuebles/apartamentos/venta/bogota-dc/",
	"https://listado.mercadolibre.com.co/inmuebles/apartamentos/arriendo/bogota-dc/",
];

const getPageURL = (numberPage = 1) => {
	const currentPage = 1 + 48 * (numberPage - 1);
	let url = `https://listado.mercadolibre.com.co/inmuebles/casas/venta/bogota-dc/_Desde_${currentPage}`;
	return url;
};

// const getPageURL = (
// 	numberPage = 1,
// 	url = "https://listado.mercadolibre.com.co/inmuebles/casas/venta/bogota-dc/_Desde_",
// ) => {
// 	const currentPage = 1 + 48 * (numberPage - 1);
// 	let urlParse = `${url}${currentPage}`;
// 	return urlParse;
// };

const getNumberOfAllResult = async (page) => {
	await page.waitForNavigation();
	const pagesAmount = await page.evaluate(() => {
		const quantityResults = parseInt(
			document
				.querySelector("span.ui-search-search-result__quantity-results")
				.innerText.split(" ")[0]
				.replace(".", ""),
		);
		let arr = [];
		let totalPages = Math.ceil(quantityResults / 48);
		for (let index = 1; index <= totalPages; index++) {
			arr.push(index);
		}
		return arr;
	});
	return pagesAmount;
};

const getAllUrls = async (page) => {
	const allUrls = [];
	const totalPages = await getNumberOfAllResult(page);

	totalPages.forEach((numberPage) => {
		const urlPage = getPageURL(numberPage);
		allUrls.push(urlPage);
	});

	return allUrls;
};

const getLinksPerPage = async (page) => {
	await page.waitForNavigation();
	const links = await page.evaluate(() => {
		const linksPerPage = [];
		document
			.querySelectorAll(
				"ol > li .ui-search-result__wrapper .ui-search-result__image a",
			)
			.forEach((element) => linksPerPage.push(element.href));
		return linksPerPage;
	});
	return links;
};

const saveDataOnFile = async ({ data, path }) =>
	await fs
		.writeFile(path, JSON.stringify(data), { encoding: "utf-8" })
		.then(() => console.log("Data has been writed successfully! 🔥"));

const getAllDataAndSaveOnFile = async () => {
	console.log("Starting to scrape");
	console.time("End to scrape");
	const browserChromium = await puppeteer.launch();
	const pageBrowser = await browserChromium.newPage();
	const url = getPageURL();
	await pageBrowser.goto(url);

	const allUrlForNavigation = await getAllUrls(pageBrowser);
	console.log({ ...allUrlForNavigation });

	let counterPage = 1;
	let counterInmubeles = 0;
	const properties = [];

	for (urlForNavigation of allUrlForNavigation) {
		await pageBrowser.goto(url);
		await pageBrowser.waitForNavigation();
		console.log(`visitando la pagina ${urlForNavigation}`);
		const linksPerPage = await getLinksPerPage(pageBrowser);
		console.log({ ...linksPerPage });

		for (const link of linksPerPage) {
			await pageBrowser.goto(link);
			await pageBrowser.waitForNavigation();
			await pageBrowser.waitForSelector(".item-title h1");
			const property = await pageBrowser.evaluate(() => {
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
					// ubication,
					address: ubication["address"],
					location: ubication["location"],
					// area,
					areaTotal: area["total"],
					areaBuilt: area["built"],
					areaGroud: area["groud"],
					description,
					images,
				};
			});
			property.url = link;
			properties.push(property);

			console.log(property);
			console.log(
				`Inmueble ${++counterInmubeles} - ${
					linksPerPage.length
				}. Rest ${linksPerPage.length - counterInmubeles} Inmuebles 🏡
			        \rPage ${counterPage} - ${allUrlForNavigation.length}. Rest ${
					allUrlForNavigation.length - counterPage
				} Pages 📖`,
			);
		}
		++counterPage;
		counterInmubeles = 0;
	}

	await browser.close().then(() => console.log("Good bye 👋"));
	console.timeEnd("End to scrape");

	return {
		data: properties,
		path: "./src/public/housesForSaleMl.json",
	};
};

getAllDataAndSaveOnFile().then(async (data) => await saveDataOnFile(data));
