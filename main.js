// TODO: how many posts am I getting exacly?

const puppeteer = require('puppeteer');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

/**
 * Handles setting up the Electron.js 
 */
(function electronSetup() {
	const createWindow = () => {
		const win = new BrowserWindow({
			width: 800,
			height: 600,
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
			}
		})

		ipcMain.on('formSubmission', (event, data) => {
			const {subredditName, filterParams } = data;
			puppeteerSetup(subredditName, filterParams)
		})
	
		win.loadFile('index.html')
	}
	
	app.whenReady().then(() => {
		createWindow()
	
		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow()
			}
		})
	})
	
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})
})()

/**
 * Handles web scraping Reddit posts using Puppeteer
 */
async function puppeteerSetup(subredditName, filterParams) {
	try {
		const URL = `https://www.reddit.com/r/${subredditName}/${filterParams}/`
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.goto(URL)

		await autoScroll(page)

		const allPosts = {
			concatenatedPostTitles: "",
			concatenatedPostContent: ""
		}

		allPosts.concatenatedPostTitles += await printPosts(page, "div[slot='title']")
		allPosts.concatenatedPostContent += await printPosts(page, "div[slot='text-body'] p")

		console.log(allPosts)

		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

// HELPER FUNCTIONS =====================================================
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
	let concat_result = ""
	const postInfos = await page.$$(query)
	for (const postInfo of postInfos) {
		concat_result += " " + await postInfo.evaluate(x => x.innerText )
	}
	console.log(concat_result)
	return concat_result
}