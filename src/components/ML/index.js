const puppeteer = require("puppeteer");
const { sites } = require("./sites");
const {
	getPageURL,
	getAllUrls,
	getLinksPerPage,
	saveDataOnFile,
	getAllDataPerPage,
} = require("./controller");

const init = async () => {
	try {
		console.log("Starting to scrape");
		console.time("End to scrape");
		const browser = await puppeteer.launch({
			// slowMo: 10,
			// headless: false,
			// defaultViewport: null,
		});
		const page = await browser.newPage();
		const url = getPageURL();
		await page.goto(url);
		const allUrlForNavigation = await getAllUrls(page);

		let counterPage = 0;
		for (const urlPage of allUrlForNavigation) {
			await page.goto(urlPage);
			await page.waitForTimeout(200);

			const linksPerPage = await getLinksPerPage(page);

			const allDataPerPage = await getAllDataPerPage(linksPerPage, page);

			if (!allDataPerPage.length) {
				await browser
					.close()
					.then(() =>
						console.log(
							"Se cierra anticipadamente debido a que ya no hay más paginas 👋",
						),
					);

				await saveDataOnFile({
					data: allDataPerPage,
					path: `./src/public/ML/housesForSale-Page-${++counterPage}`,
					ext: "json",
				});

				console.timeEnd("End to scrape");
				return;
			}

			await saveDataOnFile({
				data: allDataPerPage,
				path: `./src/public/ML/housesForSale-Page-${++counterPage}`,
				ext: "json",
			});

			console.log(
				`Page ${counterPage} completed - ${
					allUrlForNavigation.length
				}. Rest ${allUrlForNavigation.length - counterPage} Pages 📖`,
			);
		}

		await browser.close().then(() => console.log("Good bye 👋"));
		console.timeEnd("End to scrape");
	} catch (error) {
		console.error(error);
	}
};

init();
