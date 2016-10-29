
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
    var resultTrump = [];
    var resultSearched = [];
    var positiveT = 0;
    var negativeT = 0;
    var neutralT = 0;
    var posPercentT = '';
    var negPercentT = '';
    var neutralPercentT = '';
    var positiveS = 0;
    var negativeS = 0;
    var neutralS = 0;
    var posPercentS = '';
    var negPercentS = '';
    var neutralPercentS = '';
    var compareWith = '';
    var resultTweetT = '';
    var resultTweetS = '';

    //define stream
    var stream = twit.stream('statuses/filter',{language:'en',track: 'trump,a'});

    //catch tweet
    stream.on('tweet',function(tweet) {
        var inTweet = tweet.text.toLowerCase();
        if (compareWith == ''){
            if (inTweet.includes('trump')){
                trump(tweet);
                var results = [resultTweetT,resultTweetS];
                io.emit('liveTweet',results);
            }
        } else {
            if (inTweet.includes('trump')){
                trump(tweet);
                var results = [resultTweetT,resultTweetS];
                io.emit('liveTweet',results);
            }
            if(inTweet.includes(compareWith)){
                searched(tweet);
                var results = [resultTweetT,resultTweetS];
                io.emit('testTweet',results);
            }
        }

    });

    stream.on('error', function(error) {
        console.log('Stream error: ' + error.message);
    });


    var trump = function(tweet) {
        var sentimentTweet = sentiment(tweet.text);
        var sentimentScore = sentimentTweet.score;

        resultTrump.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

        analysisTrump(sentimentScore);

        resultTweetT = {tweetID:tweet.id_str, positive:posPercentT, neutral:neutralPercentT, negative: negPercentT};
    };

    var searched = function(tweet) {
        var sentimentTweet = sentiment(tweet.text);
        var sentimentScore = sentimentTweet.score;

        resultSearched.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

        analysisSearched(sentimentScore);

        resultTweetS = {tweetID:tweet.id_str, positive:posPercentS, neutral:neutralPercentS, negative: negPercentS};
    };

    //sentiment analysis
    var analysisTrump = function (score) {

        if(score>0) {
            positiveT +=1;
        }
        if(score<0) {
            negativeT +=1;
        }
        if(score==0){
            neutralT +=1;
        }

        // calculate percentages
        posPercentT = (positiveT/resultTrump.length)*100;
        negPercentT = (negativeT/resultTrump.length)*100;
        neutralPercentT = (neutralT/resultTrump.length)*100;

        var resultAnalysis = {positive:posPercentT, negative: negPercentT, neutral: neutralPercentT};
    };

    //sentiment analysis
    var analysisSearched = function (score) {

        if(score>0) {
            positiveS +=1;
        }
        if(score<0) {
            negativeS +=1;
        }
        if(score==0){
            neutralS +=1;
        }

        // calculate percentages
        posPercentS = (positiveS/resultSearched.length)*100;
        negPercentS = (negativeS/resultSearched.length)*100;
        neutralPercentS = (neutralS/resultSearched.length)*100;

        var resultAnalysis = {positive:posPercentS, negative: negPercentS, neutral: neutralPercentS};
    };



    return router;
};
