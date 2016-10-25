module.exports = function (io) {

    var express = require('express');
    var router = express.Router();

    var sentiment = require('sentiment');
    var Twitter = require('twitter');

    var client = new Twitter({
        consumer_key: 'XoP0cUhbC3KIzM5lqkkQpn06N',
        consumer_secret: 'k0ImtPjZ6iN1DwIZaBZrHuLIxxhtnRMaeycIreKJ9AN2JFu7sP',
        access_token_key: '1917108290-38rqsxvEuJmXKOmBrsqHuygsO09MBTTJrFr5l3Z',
        access_token_secret: 'bY1tBzx9BgF5PYlsm8DQmCEGRnkj1SMO6w4lJsbcjePun'
    });

    /* GET home page. */
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Trump, Yey or Ney?' });
    });


    //note to self, disse burde endres på
    var resultTweets = [];
    var positive = 0;
    var negative = 0;
    var neutral= 0;
    var posProsent = 0;
    var negProsent = 0;
    var neutralProsent = 0;
    var resultAnalysis = [];

    var twitterSearch = function (inputTweet) {
        client.stream('statuses/filter', {track: inputTweet},  function(stream) {
            stream.on('data', function(tweet) {
                var sentimentTweet = sentiment(tweet.text);
                var sentimentScore = sentimentTweet.score;

                resultTweets.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

                sentimentAnalysis(sentimentScore);

                var resultTweet = {tweetID:tweet.id_str, positive:posProsent, neutral:neutralProsent, negative: negProsent};

                io.emit('liveTweet',resultTweet);


            });
            stream.on('error', function(error) {
                console.log(error);
            });
        });
    };

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

        posProsent = (positive/resultTweets.length)*100;
        negProsent = (negative/resultTweets.length)*100;
        neutralProsent = (neutral/resultTweets.length)*100;

        resultAnalysis.push({positive:posProsent, negative: negProsent, neutral: neutralProsent});
        console.log(resultAnalysis)
    };

    var main = function() {
        twitterSearch("trump");
    };


    main();

    return router;
};



