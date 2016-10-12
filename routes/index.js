var express = require('express');
var router = express.Router();

var sentiment = require('sentiment');
var Twitter = require('node-twitter');

var twitter = new Twitter.SearchClient(
    '4hqgaAIFpjxqnslCkH0nAMkjW',
    'sKBiW41GDblRVmmHhc6yRazsERKXK8bxmQEqY5zoUEr0W7cnoQ',
    '772612067484282880-S1OHtG3wOr9DTyhcmTsSQNC1iHUpWwj',
    'e5j2RTZhlyz40PsHzROMsNH9kLO9E3FYfE15Ym1unfw3Q'
);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Trump, Yey or Ney?' });
});


var resultTweet = []; // shouln't be global, change later, not to niggrid
var tweetFlag = false;

var twitterSearch = function (tweet) {
    twitter.search({'q': tweet}, function (error, result) {
        /// if error occurs, render home page and notify the user
        if (error) {
            console.log('twittersearch failed ' + error);

        }
        if (result) {
            var tweets = result.statuses;
            var count = 0;

            /// parse response from API
            for (var i = 0; i < tweets.length; i++) {
                var text = tweets[i].text; /// tweet text
                var tweetID = tweets[i].id_str; /// tweet ID
                if(!(tweetID in resultTweet)){
                    resultTweet.push({tweet: text, tweet_id: tweetID}); /// add result to list
                    count += 1;
                }
            }
            console.log(count);
            console.log(resultTweet);
            tweetFlag = true;
        }
    });
};


var analysis = function(tweet) {
    var analyseList = [];
    var s = sentiment(tweet);
    analyseList.push(s);
    console.log(analyseList);

};

var createAnalysisScore = function (list) {
    for (var t = 0; t < list.length; t ++) {
        analysis(list[t].tweet);
    }
};

var main = function() {
    twitterSearch("Trump");
    setTimeout(function () {
        if(tweetFlag == true) {
            createAnalysisScore(resultTweet);
        }
    },5000); // maa fikset paa

};

main();


module.exports = router;
