var assert = require('assert');
var crawler = require('../crawler');

describe('test count words', function() {
    describe('countWords', function() {
        it('should return the correct number of words', function() {

            var number = crawler.countWords('this is an example');

            assert.equal(number, 4);
        });
    });
});