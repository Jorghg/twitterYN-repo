var express = require('express');
var router = express.Router();

var sentiment = require('sentiment');
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'OaNHqnoh4K5mV9Dhte6Xpgbwd',
    consumer_secret: 'q1UUfta3Ta5RgSead5hwBGaaZex95hpYU5u3LbWoDzmAvdYZoQ',
    access_token_key: '772612067484282880-S1OHtG3wOr9DTyhcmTsSQNC1iHUpWwj',
    access_token_secret: 'e5j2RTZhlyz40PsHzROMsNH9kLO9E3FYfE15Ym1unfw3Q'
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Trump, Yey or Ney?' });
});


var resultTweet = []; // shouln't be global, change later, not to niggrid
var tweetFlag = false;

var twitterSearch = function (inputTweet) {
    client.stream('statuses/filter', {track: inputTweet},  function(stream) {
        stream.on('data', function(tweet) {
            var sentimentTweet = sentiment(tweet.text);
            var sentimentScore = sentimentTweet.score;
            console.log(sentimentScore);
            resultTweet.push({tweet: tweet.text, analysis: sentimentScore}); /// add result to list

        });
        stream.on('error', function(error) {
            console.log(error);
        });
    });
};

var main = function() {
    twitterSearch("trump");
};


main();



module.exports = router;
