<div align="center">

# Scraper & Visualizer for Reddit Data

</div>

<div align="center">

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/etfrer-yi/reddi-scraper-nodejs?color=blue)
![GitHub repo file count (file type)](https://img.shields.io/github/directory-file-count/etfrer-yi/reddi-scraper-nodejs?color=red)
![GitHub language count](https://img.shields.io/github/languages/count/etfrer-yi/reddi-scraper-nodejs?color=purple)
![GitHub top language](https://img.shields.io/github/languages/top/etfrer-yi/reddi-scraper-nodejs?color=orange)

</div>

# Introduction
This is a JavaScript project whose purpose is to draw insights about most commonly used words on a specific subreddit. Originally, it was simply a scraper for such Reddit data, but it has evolved into a multi-component, multi-framework project. There are three distinct frameworks/elements to the project:
1. A web scraper in Puppeteer.js that grabs the subreddit post titles and post content from a specific subreddit using mock scrolling with scroll height at least 15000 (specified in the code).
2. An Electron.js GUI that displays an interface for selecting the subreddit and the filters associated with the date range of posts' posting time.
3. Visualization (bar graph) of most commonly used words through d3.js.

The main insight from the final product is that most commonly used words are small pieces such as "a", "the", etc.

# Demo


https://github.com/etfrer-yi/reddi-scraper-nodejs/assets/77317763/d93e7dec-5e4e-4db5-bdff-8eb4c99f68d8


# Installation steps
1. Clone the repository and `cd` into it.
2. Run `npm install`.
3. Run `npm run start`.
