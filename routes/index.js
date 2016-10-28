
module.exports = function (io) {

    var express = require('express');
    var router = express.Router();
    var sentiment = require('sentiment');
    var Twitter = require('twit');

    //twitter cresidentals
    var twit = new Twitter({
        consumer_key: 'XoP0cUhbC3KIzM5lqkkQpn06N',
        consumer_secret: 'k0ImtPjZ6iN1DwIZaBZrHuLIxxhtnRMaeycIreKJ9AN2JFu7sP',
        access_token: '1917108290-38rqsxvEuJmXKOmBrsqHuygsO09MBTTJrFr5l3Z',
        access_token_secret: 'bY1tBzx9BgF5PYlsm8DQmCEGRnkj1SMO6w4lJsbcjePun'
    });

    //start page
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Trump, Yey or Ney?' });
    });

    router.get('/compare', function(req, res, next) {
        compareWith = req.query.with; /// retrieve value of input from client side
        res.render('index', { title: 'Trump, Yey or Ney?' });
    });


    //global variables...
    var resultTweets = [];
    var resultTweets2 = [];
    var positive = 0;
    var negative = 0;
    var neutral= 0;
    var posPercent = '';
    var negPercent = '';
    var neutralPercent = '';
    var positive2 = 0;
    var negative2 = 0;
    var neutral2= 0;
    var posPercent2 = '';
    var negPercent2 = '';
    var neutralPercent2 = '';
    var compareWith = '';
    var resultTweet1 = '';
    var resultTweet2 = '';


    //define stream
    var stream = twit.stream('statuses/filter', {track: 'trump,a'});

    stream.on('tweet',function(tweet) {
        var tweetString = tweet.text;
        if(compareWith == ""){
            if(tweetString.includes("trump")){
                first(tweet);
                var results = [resultTweet1,resultTweet2];
                io.emit('liveTweet',results);
            }
        } else {
            if(tweetString.includes("trump") || tweetString.includes(compareWith)){
                if(tweetString.includes("trump")){
                    first(tweet);
                    console.log("yes");
                }
                if(tweetString.includes(compareWith)){
                    second(tweet);
                    console.log("no");
                }
                var results = [resultTweet1,resultTweet2];
                io.emit('liveTweet',results);
            }

        }
    });

    stream.on('error', function(error) {
        console.log('Stream error: ' + error.message);
    });


    var first = function(tweet) {
        var sentimentTweet = sentiment(tweet.text);
        var sentimentScore = sentimentTweet.score;

        resultTweets.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

        sentimentAnalysis1(sentimentScore);

        resultTweet1 = {tweetID:tweet.id_str, positive:posPercent, neutral:neutralPercent, negative: negPercent};
    };

    var second = function(tweet) {
        var sentimentTweet = sentiment(tweet.text);
        var sentimentScore = sentimentTweet.score;

        resultTweets2.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

        sentimentAnalysis2(sentimentScore);

        resultTweet2 = {tweetID:tweet.id_str, positive:posPercent2, neutral:neutralPercent2, negative: negPercent2};
    };

    //sentiment analysis
    var sentimentAnalysis1 = function (score) {

        if(score>0) {
            positive +=1;
        }
        if(score<0) {
            negative +=1;
        }
        if(score==0){
            neutral +=1;
        }

        // calculate percentages
        posPercent = (positive/resultTweets.length)*100;
        negPercent = (negative/resultTweets.length)*100;
        neutralPercent = (neutral/resultTweets.length)*100;

        var resultAnalysis = {positive:posPercent, negative: negPercent, neutral: neutralPercent};
    };

    //sentiment analysis
    var sentimentAnalysis2 = function (score) {

        if(score>0) {
            positive2 +=1;
        }
        if(score<0) {
            negative2 +=1;
        }
        if(score==0){
            neutral2 +=1;
        }

        // calculate percentages
        posPercent2 = (positive2/resultTweets2.length)*100;
        negPercent2 = (negative2/resultTweets2.length)*100;
        neutralPercent2 = (neutral2/resultTweets2.length)*100;

        var resultAnalysis = {positive:posPercent2, negative: negPercent2, neutral: neutralPercent2};
    };



    return router;
};



