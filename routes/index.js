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
    var positive = 0;
    var negative = 0;
    var neutral= 0;
    var posPercent = '';
    var negPercent = '';
    var neutralPercent = '';
    var compareWith = '';


    //define stream
    var stream = twit.stream('statuses/filter', {track: 'happy'});

    stream.on('tweet',function(tweet) {
        var tweetString = 'trump is an asshole';
        if(tweetString.includes()){
            toClient(tweet);
            console.log(tweet.text);
        } else {
            console.log('compare with here');
        }
    });

    stream.on('error', function(error) {
        console.log('Stream error: ' + error.message);
    });


    var toClient = function(tweet) {
        var sentimentTweet = sentiment(tweet.text);
        var sentimentScore = sentimentTweet.score;

        resultTweets.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

        sentimentAnalysis(sentimentScore);

        var resultTweet = {tweetID:tweet.id_str, positive:posPercent, neutral:neutralPercent, negative: negPercent};

        io.emit('liveTweet',resultTweet);
    };

    //sentiment analysis
    var sentimentAnalysis = function (score) {

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



    return router;
};



