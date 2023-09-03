// TODO: how many posts am I getting exacly?
// https://stackoverflow.com/questions/44932154/how-to-open-update-electron-browser-window-with-a-new-html-file
const D3Node = require('d3-node')

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
				preload: path.join(__dirname, 'preload.js')
			}
		})
	
		win.loadFile(fname)
	}

	ipcMain.handle('formSubmission', async (event, data) => {
		event.sender.send("webScraping", {content: "<div id='root' class='loader'/>"})
		const { subredditName, filterParams } = data
		const allPosts = await puppeteerSetup(subredditName, filterParams)
		const postTitleWordCounts = wordCountSetup(allPosts.concatenatedPostTitles, "titleWordCounts", "Title Word Counts")
		const postContentWordCounts = wordCountSetup(allPosts.concatenatedPostContent, "contentWordCounts", "Content Word Counts")
		const allWordCounts = wordCountSetup(allPosts.concatenatedPostContent + " " + allPosts.concatenatedPostTitles, "allWordCounts", "All WordCounts")
		const titleChart = chartSetup(postTitleWordCounts)
		const contentChart = chartSetup(postContentWordCounts)
		const allWordsChart = chartSetup(allWordCounts)
		event.sender.send("webScraping", {content: allWordsChart + titleChart + contentChart})
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
 * Generates a dictionary of word counts
 */
function wordCountSetup(allWords) {
	const splitWords = allWords.split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/)
	const map = {}
	for (var i = 0; i < splitWords.length; i++) {
		const word = splitWords[i]
		if (!map[word]) {
			map[word] = 0;
		}
		map[word]++;
	}
	return map
}

/**
 * Generates raw HTML associated with the graphs. Most of the source code is derived from:
 * https://d3-graph-gallery.com/graph/barplot_animation_start.html
 */
function chartSetup(wordCounts, chartId, chartTitle) {
	const options = { selector: `#${chartId}`, container: `<div id="container"><div id="${chartId}"></div></div>` }
	const margin = {top: 10, right: 30, bottom: 90, left: 40}
  const width = 460 - margin.left - margin.right
  const height = 450 - margin.top - margin.bottom;

	let data = Object.entries(wordCounts).map(([word, frequency]) => ({ word, frequency }));
	data.sort(compareFn)
	const lenToGrab = Math.min(data.length, 10)
	data = data.slice(-1 * lenToGrab)

	function compareFn(a, b) {
		if (a.frequency < b.frequency) {
			return -1;
		} else if (a.frequency > b.frequency) {
			return 1;
		}
		// a must be equal to b
		return 0;
	}

	const d3n = new D3Node(options) // initializes D3 with container element
	const d3 = d3n.d3
	const svg = d3.select(d3n.document.querySelector(`#${chartId}`))
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		// Add X axis
	const x = d3.scaleBand()
		.range([ 0, width ])
		.domain(data.map(function(d) { return d.word; }))
		.padding(0.2);
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");
	
	// Add Y axis
	const y = d3.scaleLinear()
		.domain([0, data[data.length - 1].frequency])
		.range([ height, 0]);
	svg.append("g")
		.call(d3.axisLeft(y));

	// Bars
	svg.selectAll("mybar")
	.data(data)
	.enter()
	.append("rect")
		.attr("x", function(d) { return x(d.word); })
		.attr("width", x.bandwidth())
		.attr("fill", "#69b3a2")
		.attr("height", function(d) { return height - y(d.frequency); })
		.attr("y", function(d) { return y(d.frequency); })

	// Title
	svg.append("svg:title").text(chartTitle)

	return d3n.html()
}


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