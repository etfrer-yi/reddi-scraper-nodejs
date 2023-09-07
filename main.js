/* TODO: 
- how many posts am I getting exacly?
- support filter by hour
- support error handling when the subreddit does not exist
*/
const D3Node = require('d3-node')

const puppeteer = require('puppeteer');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

const SUBREDDIT_NOT_FOUND = "Subreddit Not Found";

/**
 * Handles setting up the Electron.js 
 */
(function electronSetup() {
	const createWindow = (fname) => {
		win = new BrowserWindow({
			width: 400,
			height: 400,
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
			}
		})
	
		win.loadFile(fname)
	}

	ipcMain.handle('formSubmission', async (event, data) => {
		event.sender.send("webScraping", "<div id='root' class='loader'/>")
		const { subredditName, filterParams } = data
		const allPosts = await puppeteerSetup(subredditName, filterParams)
		if (allPosts === SUBREDDIT_NOT_FOUND) {
			event.sender.send("webScraping", 
			`<p>No such subreddit exists. Please select again!</p>
			<br>
      <label for="subreddit">Which subreddit would you like to query?</label><br>
      <input type="text" id="subreddit" name="subreddit" class="fullWidth"><br>

      <label for="filterParams">What filter do you want?</label><br>
      <select id="filterParams" name="filterParams" class="fullWidth">
        <option value="hot">Hot</option>
        <option value="new">New</option>
        <option value="top/?t=day">Today</option>
        <option value="top/?t=week">This Week</option>
        <option value="top/?t=month">This Month</option>
        <option value="top/?t=year">This Year</option>
        <option value="top/?t=all">All Time</option>
        <option value="rising">Rising</option>
      </select>
    <br>
    <button id="btn" class="fullWidth">Submit</button>`)
		return;
		}
		const postTitleWordCounts = wordCountSetup(allPosts.concatenatedPostTitles)
		const postContentWordCounts = wordCountSetup(allPosts.concatenatedPostContent)
		const allWordCounts = wordCountSetup(allPosts.concatenatedPostContent + " " + allPosts.concatenatedPostTitles)
		const titleChart = chartSetup(postTitleWordCounts, "titleWordCounts", "Post Title Word Counts")
		const contentChart = chartSetup(postContentWordCounts, "contentWordCounts", "Post Content Word Counts")
		const allWordsChart = chartSetup(allWordCounts, "allWordCounts", "All Word Counts")
		event.sender.send("webScraping",  titleChart + contentChart + allWordsChart)
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
	const margin = {top: 50, bottom: 50, left: 50, right: 50}
  const width = 300 - margin.left - margin.right;
  const height = 280 - margin.top - margin.bottom;

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
	svg.append("text")
		.attr("x", (width / 2))             
		.attr("y", 0 - (margin.top / 2))
		.attr("text-anchor", "middle")  
		.style("font-size", "16px") 
		.text(chartTitle)

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
		
		const [notFoundMsg] = await page.$x("//div[contains(., 'This community may have been banned or the community name is incorrect.')]");
		if (notFoundMsg) {
			return SUBREDDIT_NOT_FOUND
		}

		await autoScroll(page)

		const allPosts = {
			concatenatedPostTitles: "",
			concatenatedPostContent: ""
		}

		if ((filterParams.includes("top/?t") || filterParams.includes("new"))) {
			allPosts.concatenatedPostTitles += await getPostsInfo(page, "div[slot='title']")
			allPosts.concatenatedPostContent += await getPostsInfo(page, "div[slot='text-body'] p")
		} else {
			allPosts.concatenatedPostTitles += await getPostsInfo(page, "h3")
			allPosts.concatenatedPostContent += await getPostsInfo(page, "p")
		}

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