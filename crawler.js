const puppeteer = require('puppeteer')
const prompt = require("prompt-sync")({ sigint: true })

const subreddit = prompt("What subreddit would you like to query for? ")

async function autoScroll(page){
	await page.evaluate(async () => {
			await new Promise((resolve) => {
					const distance = 100
					const timer = setInterval(() => {
						window.scrollBy(0, distance)

						if(document.body.scrollHeight >= 15000){
								clearInterval(timer)
								resolve()
						}
				}, 10)
			})
	})
}

async function printPosts(page, query) {
	// const results = []
	let concat_result = "";
	const postInfos = await page.$$(query)
	for (const postInfo of postInfos) {
		concat_result += "\n" + await postInfo.evaluate(x => x.innerText );
		// results.push(await postInfo.evaluate(x => x.innerText ))
	}
	return concat_result;
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

		let concat_result = ""

		concat_result += await printPosts(page, "div[slot='title']")
		concat_result += await printPosts(page, "div[slot='text-body'] p")

		console.log(concat_result)

		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

getVisual()