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
    var table = "TrumpStats";

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

    //compare
    router.get('/compare', function(req, res, next) {
        compareWith = req.query.with; /// retrieve value of input from client side
        userId = Math.floor(Math.random()*1000);
        resultTweetS = '';
        positiveS = 0;
        negativeS = 0;
        posPercentS = '';
        negPercentS = '';
        resultSearched = [];
        res.render('index', { title: 'Trump, Yey or Ney?' , userId: userId});
    });

    // classifier
    var Classifier = '';

    //global variables...
    var resultTotal = [];
    var resultTrump = [];
    var resultSearched = [];
    var totalPos = 0;
    var totalNeg = 0;
    var totalPosPer = '';
    var totalNegPer = '';
    var positiveT = 0;
    var negativeT = 0;
    var posPercentT = '';
    var negPercentT = '';
    var positiveS = 0;
    var negativeS = 0;
    var posPercentS = '';
    var negPercentS = '';
    var compareWith = '';
    var resultTweetTotal = '';
    var resultTweetT = '';
    var resultTweetS = '';
    var count = 0;
    var userId = 0;
    var socketConnected = 0;

    //define stream
    var stream = twit.stream('statuses/filter',{language:'en',track: 'trump,bieber,clinton,obama'});

    natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
        Classifier = classifier;
    });

    io.on('connection', function (socket) {

        // if no sockets are connected
         if (socketConnected == 0) {
             console.log('Her må vi sette trump verdier.');
         }

        socketConnected += 1;

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
                    console.log(resultTweetT);
                }
                else if(inTweet.includes(compareWith)){
                    searched(tweet);
                    io.emit(userId,resultTweetS);
                }
            }

        });

        // catch error
        stream.on('error', function(error) {
            console.log('Stream error: ' + error.message);
        });

        socket.on('disconnect', function () {
            socketConnected -= 1;
            console.log('Disconnect')
            console.log('Sockets connected:' + socketConnected);
            stream.stop();
            // If no sockets are connected
            //if (socketConnected == 0){
            //    //Parameters for table
            //    var params = {
            //        TableName:table,
            //        Item:{
            //            "timestamp": Date.now(),
            //            "content":{
            //                "Positive": posPercentT,
            //                "Neutral": neutralPercentT,
            //                "Negative": negPercentT
            //            }
            //        }
            //    };

                //Puts all params entries into database
            //    docClient.put(params, function(err, data) {
            //        if (err) {
            //            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            //        } else {
            //            console.log("Added item:", JSON.stringify(data, null, 2));
            //        }
            //    });
            //}
        });

    });

    // Analyse all tweets
    var total = function(tweet) {
        count += 1;
        var sentence = '';
        var tweetText = tweet.text;
        var stemmer = natural.PorterStemmer;
        stemmer.attach();
        var tokenList = tweetText.tokenizeAndStem();
        for (var i = 0; i < tokenList.length; i++) {
            sentence += tokenList[i] + ' ';
        }
        var sentValue = Classifier.classify(sentence);

        resultTotal.push({tweet: tweet.text, score: sentValue}); /// add result to list

        analysisTotal(sentValue);

        resultTweetTotal = {count: count, positive:totalPosPer, negative: totalNegPer};

    };

    // analyse trump tweets
    var trump = function(tweet) {
        var sentence = '';
        var tweetText = tweet.text;
        var stemmer = natural.PorterStemmer;
        stemmer.attach();
        var tokenList = tweetText.tokenizeAndStem();
        for (var i = 0; i < tokenList.length; i++) {
            sentence += tokenList[i] + ' ';
        }
        var sentValue = Classifier.classify(sentence);

        resultTrump.push({tweet: tweet.text, score: sentValue}); /// add result to list

        analysisTrump(sentValue);

        resultTweetT = {tweetID:tweet.id_str, positive:posPercentT, negative: negPercentT};
    };

    // analyse searched tweets
    var searched = function(tweet) {
        var sentence = '';
        var tweetText = tweet.text;
        var stemmer = natural.PorterStemmer;
        stemmer.attach();
        var tokenList = tweetText.tokenizeAndStem();
        for (var i = 0; i < tokenList.length; i++) {
            sentence += tokenList[i] + ' ';
        }
        var sentValue = Classifier.classify(sentence);

        resultSearched.push({tweet: tweet.text, score: sentValue}); /// add result to list

        analysisSearched(sentValue);

        resultTweetS = {tweetID:tweet.id_str, positive:posPercentS, negative: negPercentS, userId: userId};

    };

    // percent total
    var analysisTotal = function (score) {

        if(score==4) {
            totalPos +=1;
        }
        else {
            totalNeg +=1;
        }

        // calculate percentages
        totalPosPer = Math.round((totalPos/resultTotal.length)*100);
        totalNegPer = Math.round((totalNeg/resultTotal.length)*100);

    };

    // percent trump tweets
    var analysisTrump = function (score) {

        if(score==4) {
            positiveT +=1;
        }
        else {
            negativeT +=1;
        }

        // calculate percentages
        posPercentT = Math.round((positiveT/resultTrump.length)*100);
        negPercentT = Math.round((negativeT/resultTrump.length)*100);
    };

    // percent seached tweets
    var analysisSearched = function (score) {

        if(score==4) {
            positiveS +=1;
        }
        else {
            negativeS +=1;
        }

        // calculate percentages
        posPercentS = Math.round((positiveS/resultSearched.length)*100);
        negPercentS = Math.round((negativeS/resultSearched.length)*100);

    };
    
    return router;
};