// TODO: how many posts am I getting exacly?
// const D3Node = require('d3-node')
// const d3n = new D3Node()

const puppeteer = require('puppeteer');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

/**
 * Handles setting up the Electron.js 
 */
(function electronSetup() {
	const createWindow = (fname) => {
		win = new BrowserWindow({
			width: 800,
			height: 800,
			webPreferences: {
				nodeIntegration: true,
				preload: path.join(__dirname, 'preload.js')
			}
		})
	
		win.loadFile(fname)
	}

	ipcMain.handle('formSubmission', async (event, data) => {
		event.sender.send("webScraping", {content: "<div id='root' class='loader'/>"})
		const { subredditName, filterParams } = data;
		const allPosts = await puppeteerSetup(subredditName, filterParams)
		event.sender.send("webScraping", {content: "<div id='root'/>"})
	})
	
	app.whenReady().then(() => {
		createWindow('index.html')
	
		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow('index.html')
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
		const URL = `https://www.reddit.com/r/${subredditName}/${filterParams}`
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.goto(URL)

		await autoScroll(page)

		const allPosts = {
			concatenatedPostTitles: "",
			concatenatedPostContent: ""
		}

		// allPosts.concatenatedPostTitles += await getPostsInfo(page, "div[slot='title']")
		// allPosts.concatenatedPostContent += await getPostsInfo(page, "div[slot='text-body'] p")

		allPosts.concatenatedPostTitles += await getPostsInfo(page, "h3")
		allPosts.concatenatedPostContent += await getPostsInfo(page, "p")

		await browser.close()
		return allPosts
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

async function getPostsInfo(page, query) {
	let concat_result = ""
	const postInfos = await page.$$(query)
	for (const postInfo of postInfos) {
		concat_result += " " + await postInfo.evaluate(x => x.innerText )
	}
	return concat_result
}