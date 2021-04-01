const puppeteer = require("puppeteer");
const {
	getPageURL,
	getAllUrls,
	getLinksPerPage,
	saveDataOnFile,
	getAllDataPerPage,
} = require("./controller");

const init = async () => {
	console.log("Starting to scrape");
	console.time("End to scrape");
	const browserChromium = await puppeteer.launch({
		slowMo: 10,
		headless: false,
		defaultViewport: null,
	});
	const page = await browserChromium.newPage();
	const url = getPageURL();
	await page.goto(url);
	const allUrlForNavigation = await getAllUrls(page);

	let counterPage = 0;
	for (const urlPage of allUrlForNavigation) {
		await page.goto(urlPage);
		await page.waitForTimeout(200);

		const linksPerPage = await getLinksPerPage(page);

		const allDataPerPage = await getAllDataPerPage(linksPerPage, page);

		await saveDataOnFile({
			data: allDataPerPage,
			path: `./src/public/ML/housesForSale-Page-${counterPage}`,
			ext: "json",
		});

		console.log(
			`Page ${++counterPage} completed - ${
				allUrlForNavigation.length
			}. Rest ${allUrlForNavigation.length - counterPage} Pages 📖`,
		);
	}

	await browser.close().then(() => console.log("Good bye 👋"));
	console.timeEnd("End to scrape");
};

init();
