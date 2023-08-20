const puppeteer = require('puppeteer')
const prompt = require("prompt-sync")({ sigint: true });

const subreddit = prompt("What subreddit would you like to query for? ");

async function autoScroll(page){
	await page.evaluate(async () => {
			await new Promise((resolve) => {
					// let totalHeight = 0;
					const distance = 100;
					const timer = setInterval(() => {
						window.scrollBy(0, distance);
						// totalHeight += distance;

						if(document.body.scrollHeight >= 15000){
								clearInterval(timer)
								resolve()
						}
				}, 100);
			});
	});
}

async function getVisual() {
	try {
		const URL = `https://www.reddit.com/r/${subreddit}/`
		const browser = await puppeteer.launch({
			headless: false
		})

		const page = await browser.newPage()
		await page.goto(URL)

		await autoScroll(page)

		const results = [];
		const postContents = await page.$$("p")
		for(let postContent of postContents) {
			results.push(await postContent.evaluate(x => x.textContent));
		}

		console.log(results)

		
		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

getVisual()