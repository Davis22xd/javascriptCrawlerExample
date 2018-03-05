var request = require('request');
var cheerio = require('cheerio');

var MAX_ENTRIES = 30;
var mainList= [];

var pageToVisit = "https://news.ycombinator.com/";

console.log("Visiting page " + pageToVisit);

request(pageToVisit, function(error, response, body) {
    if(error) {
        console.log("Error: " + error);
    }
    // Check status code (200 is HTTP OK)
    console.log("Status code: " + response.statusCode);
    if(response.statusCode === 200) {
        // Parse the document body
        var $ = cheerio.load(body);

        console.log("Page title:  " + $('title').text());

        setListFromAtributte($,'.rank','rank');
        setListFromAtributte($,'.storylink','title');
        setListFromAtributte($,'.score','score');
        setItemsIdInlistItems($,'.athing');

        var commentsList = getCommentsListIfContainWords($);
        setCommentsinMainList(commentsList);
        console.log(mainList.length);
        console.log(mainList);

    }
});

function setItemsIdInlistItems($,element) {
    $(element).slice(0, MAX_ENTRIES).each(function(i, elem) {
        mainList[i].id=$(this).attr('id');
    });
}

function setListFromAtributte($,element,attribute) {
    $(element).slice(0, MAX_ENTRIES).each(function(i, elem) {
        if(!mainList[i]){
            mainList[i] = {};
        }
        mainList[i][attribute]=$(this).text();
    });
}

function getIdsFromComments($,link) {
    var relativeDirection = $(link).attr('href');
    var startNumber = relativeDirection.indexOf('=') + 1;
    return relativeDirection.substring(startNumber, relativeDirection.length );
}

function getCommentsListIfContainWords($) {
    var list = [];
    links = $('a'); //jquery get all hyperlinks
    $(links).each(function(i, link){
        var commentPattern = /^[0-9].+comments$/;
        var comment = $(link).text();
        var matchResult = comment.match(commentPattern);

        if(matchResult || comment === 'discuss' ){
            list.push(
                {comment:comment, id :getIdsFromComments($,link)}
                );
        }
    });
    return list;
}

function setCommentsinMainList(commentsList) {
    var commentsLenght = commentsList.length;
    var mainListLenght = mainList.length;

    for(var i = 0; i< commentsLenght; i++) {
        for (var j = 0; j< mainListLenght; j++){

            if(mainList[j].id === commentsList[i].id){
                mainList[j].comment = commentsList[j].comment;
            }

        }
    }
}
