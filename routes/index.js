module.exports = function (io) {

    var express = require('express');
    var router = express.Router();
    var sentiment = require('sentiment');
    var Twitter = require('twit');
    var natural = require('natural');
    var AWS = require("aws-sdk");

    AWS.config.update({
        region: "us-west-2",
        endpoint: "https://dynamodb.us-west-2.amazonaws.com"
        });

    var docClient = new AWS.DynamoDB.DocumentClient();
    var table = "Tweets";

    //twitter cresidentals
    var twit = new Twitter({
        consumer_key: 'XoP0cUhbC3KIzM5lqkkQpn06N',
        consumer_secret: 'k0ImtPjZ6iN1DwIZaBZrHuLIxxhtnRMaeycIreKJ9AN2JFu7sP',
        access_token: '1917108290-38rqsxvEuJmXKOmBrsqHuygsO09MBTTJrFr5l3Z',
        access_token_secret: 'bY1tBzx9BgF5PYlsm8DQmCEGRnkj1SMO6w4lJsbcjePun'
    });

    //start page
    router.get('/', function(req, res, next) {
        console.log('user id render start ' + userId);
        res.render('index', { title: 'Trump, Yey or Ney?', userId:0 });
    });

    router.get('/compare', function(req, res, next) {
        compareWith = req.query.with; /// retrieve value of input from client side
        userId = Math.floor(Math.random()*1000);
        console.log('userid compare; ' + userId);
        resultTweetS = '';
        positiveS = 0;
        negativeS = 0;
        neutralS = 0;
        posPercentS = '';
        negPercentS = '';
        neutralPercentS = '';
        resultSearched = [];
        res.render('index', { title: 'Trump, Yey or Ney?' , userId: userId});
    });


    var Classifier = '';

    //global variables...
    var resultTotal = [];
    var resultTrump = [];
    var resultSearched = [];
    var totalPos = 0;
    var totalNeg = 0;
    var totalNeu = 0;
    var totalPosPer = '';
    var totalNegPer = '';
    var totalNeuPer = '';
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
    var resultTweetTotal = '';
    var resultTweetT = '';
    var resultTweetS = '';
    var count = 0;
    var userId = 0;

    //define stream
    var stream = twit.stream('statuses/filter',{language:'en',track: 'trump,a'});

    natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
        Classifier = classifier;
    });

    io.on('connection', function (socket) {

        stream.start();

        //catch tweet
        stream.on('tweet',function(tweet) {
            total(tweet);
            io.emit('totalTweet',resultTweetTotal);
            var inTweet = tweet.text.toLowerCase();
            if (compareWith == ''){
                if (inTweet.includes('trump')){
                    trump(tweet);
                    io.emit('liveTweet',resultTweetT);
                }
            } else {
                if (inTweet.includes('trump')){
                    trump(tweet);
                    io.emit('liveTweet',resultTweetT);
                }
                if(inTweet.includes(compareWith)){
                    searched(tweet);
                    console.log('user id should be equal to compare ' + resultTweetS.userId);
                    io.emit(userId,resultTweetS);
                }
            }

        });

        // catch error
        stream.on('error', function(error) {
            console.log('Stream error: ' + error.message);
        });


        var total = function(tweet) {
            count += 1;
            var sentence = '';
            var tweetText = tweet.text;
            var stemmer = natural.PorterStemmer;
            stemmer.attach();
            var tokenList = tweetText.tokenizeAndStem();
            for (var i = 0; i < tokenList.length; i++) {
                sentence += tokenList[i];
            }
            var sentValue = Classifier.classify(sentence);

            var sentimentTweet = sentiment(tweet.text);
            var sentimentScore = sentimentTweet.score;

            resultTotal.push({tweet: tweet.text, score: sentimentScore}); /// add result to list

            analysisTotal(sentimentScore);

            var params = {
                TableName:table,
                Item:{
                    "tweetID": tweet.user.id_str,
                    "userID": tweet.user.screen_name,
                    "content":{
                        "tweetText": tweet.text,
                        //"posPros": posPercentT,
                        //"negPros": negPercentS
                    }
                }
            };
            console.log(tweet.user.id_str, " ", tweet.user.screen_name," ", tweetText, posPercentT, negPercentT);


            docClient.put(params, function(err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                }
            });

            resultTweetTotal = {count: count, positive:posPercentT, neutral:neutralPercentT, negative: negPercentT};

        };


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

            resultTweetS = {tweetID:tweet.id_str, positive:posPercentS, neutral:neutralPercentS, negative: negPercentS, userId: userId};
        };

        // percent analysis total
        var analysisTotal = function (score) {

            if(score>0) {
                totalPos +=1;
            }
            if(score<0) {
                totalNeg +=1;
            }
            if(score==0){
                totalNeu +=1;
            }

            // calculate percentages
            totalPosPer = Math.round((totalPos/resultTotal.length)*100);
            totalNeg = Math.round((totalNeg/resultTotal.length)*100);
            totalNeuPer = Math.round((totalNeu/resultTotal.length)*100);

            var resultAnalysis = {positive:totalPosPer, negative: totalNegPer, neutral: totalNeuPer};
        };

        // percent analysis
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
            posPercentT = Math.round((positiveT/resultTrump.length)*100);
            negPercentT = Math.round((negativeT/resultTrump.length)*100);
            neutralPercentT = Math.round((neutralT/resultTrump.length)*100);

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
            posPercentS = Math.round((positiveS/resultSearched.length)*100);
            negPercentS = Math.round((negativeS/resultSearched.length)*100);
            neutralPercentS = Math.round((neutralS/resultSearched.length)*100);

            var resultAnalysis = {positive:posPercentS, negative: negPercentS, neutral: neutralPercentS};
        };

        socket.on('disconnect', function () {
            console.log('disconnect');
            stream.stop();
        });

    });
    
    return router;
};