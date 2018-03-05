var request = require('request');
var cheerio = require('cheerio');

var maxEntries = 30;
var mainList = [];
var pageToVisit = '';

function setParameters(maxEntries, pageToVisit) {
    this.pageToVisit = pageToVisit;
    this.maxEntries = maxEntries;
}

function crawl(maxEntries, pageToVisit) {

    setParameters(maxEntries, pageToVisit);

    console.log("Visiting page " + pageToVisit);

    request(pageToVisit, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if (response.statusCode === 200) {
            // Parse the document body
            var $ = cheerio.load(body);

            console.log("Page title:  " + $('title').text());

            setAllAttributesToMainList($);

            printAll30Entries();

            performMoreThanFiveWordsProcess();
            performLessThanSixWordsProcess();

        }
    });
}

function setAllAttributesToMainList($) {
    setListFromAtributte($, '.rank', 'rank');
    setListFromAtributte($, '.storylink', 'title');
    setListFromAtributte($, '.score', 'score');
    convertScoreInNumbers();
    setItemsIdInlistItems($, '.athing');

    var commentsList = getCommentsListIfContainWords($);
    setCommentsinMainList(commentsList);
}


function printAll30Entries() {
    console.log("The 30th first items in the page are:")
    console.log(mainList);
}

function performMoreThanFiveWordsProcess() {
    console.log("Entries with more than five words in the title ordered by amount of comments: ");
    moreThanFiveWordsList = getEntriesWithMoreThanFiveWordsInTitle();
    moreThanFiveWordsList.sort(compareByNumberOfComments);
    console.log(moreThanFiveWordsList);
}


function performLessThanSixWordsProcess() {
    console.log("Entries with less than or equal to five words in the title ordered by points: ");
    lessThanSixWordsList = getEntriesWithLessThanWordsInTitle();
    lessThanSixWordsList.sort(compareByScore);
    console.log(lessThanSixWordsList);
}

function compareByNumberOfComments(a, b) {
    if (a.numberOfComments < b.numberOfComments)
        return -1;
    if (a.numberOfComments > b.numberOfComments)
        return 1;
    return 0;
}


function compareByScore(a, b) {
    if (a.score < b.score)
        return -1;
    if (a.score > b.score)
        return 1;
    return 0;
}

function convertScoreInNumbers() {
    mainList.forEach(function (element) {
        var score;
        var finalIndex = element.score.indexOf('points');
        score = element.score.substring(0, finalIndex - 1);
        element.score = Number(score);
    }.bind(this));
}

function getEntriesWithMoreThanFiveWordsInTitle() {
    var list = [];
    mainList.forEach(function (element) {
        var words = countWords(element.title);
        if (words > 5) {
            list.push(element);
        }
    }.bind(this));
    return list;
}

function getEntriesWithLessThanWordsInTitle() {
    var list = [];
    mainList.forEach(function (element) {
        var words = countWords(element.title);
        if (words <= 5) {
            list.push(element);
        }
    }.bind(this));
    return list;
}

////
// Set the id in each object of an array
// number of entries and set the corresponding attribute and value to each object in the mainList array
//
//@param {$}   cheerio object to be read.
//@param {element} could be an tag name, id, class, property
//
////
function setItemsIdInlistItems($, element) {
    $(element).slice(0, maxEntries).each(function (i, elem) {
        mainList[i].id = $(this).attr('id');
    });
}

////
// Given an tag name, property or id gets all the elements of that type, then slice the array result until the max
// number of entries and set the corresponding attribute and value to each object in the mainList array
//
//@param {$}   cheerio object to be read.
//@param {element} could be an tag name, id, class, property
//@param {attribute} the name of the attribute to be set on each object
//
////
function setListFromAtributte($, element, attribute) {
    $(element).slice(0, maxEntries).each(function (i, elem) {
        if (!mainList[i]) {
            mainList[i] = {};
        }
        mainList[i][attribute] = $(this).text();
    });
}

////
// Extract the id of the relative direction of a link
//
//@param {$}   cheerio object to be read.
//@param {link} relative path that has the id of entry
//
//@return {object} Object with the result of the comparison.
//
////
function getIdsFromComments($, link) {
    var relativeDirection = $(link).attr('href');
    var startNumber = relativeDirection.indexOf('=') + 1;
    return relativeDirection.substring(startNumber, relativeDirection.length);
}

////
// CGet all the links of a page
//
//@param {$}   cheerio object to be read.
//
//@return {array} Array of links of the page.
//
////
function getLinksOfPage($) {
    var links = $('a'); //jquery get all hyperlinks
    return links;
}

////
// Compare a string with the comment pattern to see if it is a comments line
//
//@param {$}   cheerio object to be read.
//@param {link} relative path that has the id of entry
//
//@return {object} Object with the result of the comparison.
//
////
function compareIfMatchCommentFormat($, link) {
    var commentPattern = /^[0-9].+comments$/;
    var comment = $(link).text();
    var matchResult = comment.match(commentPattern);
    return matchResult;
}


////
// Push an item of type comment to the list that will contain all the comments
// of comments
//
//@param {$}   cheerio object to be read.
//@param {list} array of objects
//@param {comment} string with the number of comments
//@param {link} relative path that has the id of entry
//@param {numberOfComments} number of comments
//
//@return {array} Description.
//
////
function addCommentToList($, list, comment, link, numberOfComments) {
    list.push(
        {comments: comment, id: getIdsFromComments($, link), numberOfComments: Number(numberOfComments)}
    );
}

////
// Search all the links in file then search if there is a comment or a discuss and set the value of the comment in a list
// of comments
//
//@param {$}   cheerio object to be read.
//
//@return {array} Description.
//
////
function getCommentsListIfContainWords($) {
    var list = [];
    var numberOfComments = 0;

    $(getLinksOfPage($)).each(function (i, link) {

        var matchResult = compareIfMatchCommentFormat($, link);
        var comment = matchResult ? matchResult.input : '';

        if (matchResult) {
            var finalIndex = comment.indexOf('comments');
            numberOfComments = comment.substring(0, finalIndex - 1);

            addCommentToList($, list, comment, link, numberOfComments)
        }
        else if (comment === 'discuss') {
            addCommentToList($, list, comment, link, numberOfComments);
        }
    });

    return list;
}

////
// Set the comment and the value of this in the corresponding item in the mainList
//
//@param {arrayList}   list of comments to set in mainList.
//
////
function setCommentsinMainList(commentsList) {
    var commentsLenght = commentsList.length;
    var mainListLenght = mainList.length;

    for (var i = 0; i < commentsLenght; i++) {
        for (var j = 0; j < mainListLenght; j++) {

            if (mainList[j].id === commentsList[i].id) {
                mainList[j].comments = commentsList[i].comments;
                mainList[j].numberOfComments = commentsList[i].numberOfComments;
            }

        }
    }
}

//Count words in a string
countWords: function countWords(str) {
    var count = 0;
    var words = str.split(" ");
    for (var i = 0; i < words.length; i++) {
        // inner loop -- do the count
        if (words[i] !=="")
            count += 1;
    }
    return count;
}


module.exports = {
    addCommentToList:addCommentToList,
    countWords: countWords,
    crawl:crawl,
    getEntriesWithMoreThanFiveWordsInTitle:getEntriesWithMoreThanFiveWordsInTitle,
    getEntriesWithLessThanWordsInTitle:getEntriesWithLessThanWordsInTitle,
    convertScoreInNumbers: convertScoreInNumbers,
    compareByNumberOfComments: compareByNumberOfComments,
    compareByScore:compareByScore,
    setItemsIdInlistItems: setItemsIdInlistItems,
    setCommentsinMainList: setCommentsinMainList,
    setParameters: setParameters,
    getIdsFromComments:getIdsFromComments,
    getLinksOfPage:getLinksOfPage,
    compareIfMatchCommentFormat:compareIfMatchCommentFormat,
    setListFromAtributte:setListFromAtributte,
    getCommentsListIfContainWords: getCommentsListIfContainWords,
};


