const crawler = require('../crawler');

 //Example using the crawl library

const MAX_ENTRIES = 30;
var pageToVisit = "https://news.ycombinator.com/";

crawler.crawl(MAX_ENTRIES,pageToVisit);
