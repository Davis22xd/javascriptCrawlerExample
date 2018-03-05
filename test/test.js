var assert = require('assert');
var crawler = require('../crawler');

describe('test setting parameters', function() {
    describe('setting the params', function() {
        it('should return two parameters', function() {
            const maxEntries = 30;
            var pageToVisit = "https://news.ycombinator.com/";

            crawler.setParameters(maxEntries, pageToVisit);

            assert.equal(crawler.maxEntries, 30);
            assert.equal(crawler.pageToVisit, "https://news.ycombinator.com/")
        });
    });
});

describe('test count words', function() {
    describe('countWords', function() {
        it('should return the correct number of words', function() {

            var number = crawler.countWords('this is an example');

            assert.equal(number, 4);
        });
    });
});