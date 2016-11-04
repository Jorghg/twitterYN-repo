module.exports = function (io) {

    var express = require('express');
    var router = express.Router();
    var body = require('body-parser');
    var Twitter = require('twit');
    var natural = require('natural');
    var AWS = require("aws-sdk");
    var sqs = new AWS.SQS({});


    AWS.config.update({
        region: "us-west-2",
        endpoint: "https://dynamodb.us-west-2.amazonaws.com"
        });

    //start page
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Trump, Yey or Ney?', userId: userId});
    });

    var docClient = new AWS.DynamoDB.DocumentClient();

    // DB table
    var table = "TrumpStats";

    // classifier for sentiment
    var Classifier = '';

    //global variables...
    var socketConnected = [];
    var yey = '';
    var userId = 0;
    var socketId = 0;
    var resultTrump = 0;
    var resultClinton = 0;
    var resultObama = 0;
    var resultTweetObama = '';
    var resultTweetTrump = '';
    var resultTweetClinton = '';
    var posObama = 0;
    var negObama = 0;
    var obamaPosPer = '';
    var obamaNegPer = '';
    var posTrump = 0;
    var negTrump = 0;
    var trumpPosPer = '';
    var trumpNegPer = '';
    var posClinton = 0;
    var negClinton = 0;
    var clintonPosPer = '';
    var clintonNegPer = '';
    var run = '';


    // load classifier
    natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
        Classifier = classifier;
    });

    // on connect
    io.on('connection', function (socket) {

        socketId = socket.id;
        socketConnected.push(socketId);
        console.log('Sockets connected: ' + socketConnected.length);

        // load stats from db
        var paramsQuery = {
            TableName: table,
            KeyConditionExpression: "#searchNumber = :number",
            ExpressionAttributeNames: {
                "#searchNumber": "ID"
            },
            ExpressionAttributeValues: {
                ":number": 1
            }

        };

        docClient.query(paramsQuery, function(err, data) {
            if (err) {
                console.error("Unable to query. Error: ", JSON.stringify(err, null, 2));
            }  else  {
                console.log("Query succeeded. ");

                data.Items.forEach(function(item) {
                    posTrump = item.posTrump;
                    resultTrump = item.countTrump;
                    negTrump = resultTrump - posTrump;

                    posClinton = item.posClinton;
                    resultClinton = item.countClinton;
                    negClinton = resultClinton - posClinton;

                    posObama = item.posObama;
                    resultObama = item.countObama;
                    negObama = resultObama - posObama;
                });


            }
        });

        //buffer stream
        router.post('/', function(req, res, next) {
            res.render('index', { title: 'Trump, Yey or Ney?', userId: userId});
            console.log('body: ' + JSON.stringify(req.body));
        });

        // Calls recieve function in interval
        setInterval(function () {
            recieve();
        },200);

        socket.on('disconnect', function () {
            console.log('Socket disconnect');
            // remove from socket list
            var index = socketConnected.indexOf(socketId);
            if (index > -1) {
                socketConnected.splice(index, 1);
            }
            console.log('Sockets connected:' + socketConnected.length);

            // Update DB
            var params = {
                TableName:table,
                Key:{
                    "ID": 1
                },
                UpdateExpression: "set posTrump=:pT, posClinton=:pC, posObama=:pO, countTrump=:cT, countClinton=:cC, countObama=:cO",
                ExpressionAttributeValues:{
                    ":pT":posTrump,
                    ":pC":posClinton,
                    ":pO":posObama,
                    ":cT":resultTrump,
                    ":cC":resultClinton,
                    ":cO":resultObama
                },
                ReturnValues:"UPDATED_NEW"
            };

            console.log("Updating DB...");
            docClient.update(params, function(err, data) {
                if (err) {
                    console.log("Unable to add to DB: Error JSON", JSON.stringify(err, null, 2));
                }  else  {
                    console.log("Database updated with items: ", data);
                }
            });
        });

    });

    // Pulls tweets from SQS, analyse and emit
    var recieve = function () {
        var params = {
            QueueUrl: "https://sqs.us-west-2.amazonaws.com/643927985634/Tweets010",
            MaxNumberOfMessages: 1
        };
        sqs.receiveMessage(params, function(err, data) {
            var tweetObject = JSON.parse(data.Messages[0].Body);
            var inTweet = tweetObject.text.toLowerCase();
            if (inTweet.includes('trump')){
                trump(tweetObject);
                io.emit('trumpTweet',resultTweetTrump);
            } else if (inTweet.includes('clinton')) {
                clinton(tweetObject);
                io.emit('clintonTweet',resultTweetClinton);
            } else if (inTweet.includes('obama')){
                obama(tweetObject);
                io.emit('obamaTweet',resultTweetObama);
            }
            statusTweet();
            io.emit('status',yey);
            deleteTweet(data);
        });
    };

    // remove tweet from SQS
    var deleteTweet = function (object) {
        var params = {
            QueueUrl: "https://sqs.us-west-2.amazonaws.com/643927985634/Tweets010",
            ReceiptHandle: object.Messages[0].ReceiptHandle
        };

        sqs.deleteMessage(params, function(err, data) {
            if(err) {
                res.send(err.message);
            }
        });
    };


    // Analyse Obama tweets
    var obama = function(tweet) {
        var sentence = '';
        var tweetText = tweet.text;
        var stemmer = natural.PorterStemmer;
        stemmer.attach();
        var tokenList = tweetText.tokenizeAndStem();
        for (var i = 0; i < tokenList.length; i++) {
            sentence += tokenList[i] + ' ';
        }
        var sentValue = Classifier.classify(sentence);

        resultObama += 1;

        calcObama(sentValue); // call calculate function

        // set result
        resultTweetObama = {tweetID:tweet.id_str, tweet:tweet.text, positive:obamaPosPer, negative: obamaNegPer, count:resultObama};

    };

    // analyse Trump tweets
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

        resultTrump += 1;

        calcTrump(sentValue); // calculate function on sentiment value

        // set result
        resultTweetTrump = {tweetID:tweet.id_str, tweet:tweet.text, positive:trumpPosPer, negative: trumpNegPer, count: resultTrump};
    };

    // analyse clinton tweets
    var clinton = function(tweet) {
        var sentence = '';
        var tweetText = tweet.text;
        var stemmer = natural.PorterStemmer;
        stemmer.attach();
        var tokenList = tweetText.tokenizeAndStem();
        for (var i = 0; i < tokenList.length; i++) {
            sentence += tokenList[i] + ' ';
        }
        var sentValue = Classifier.classify(sentence);

        resultClinton += 1;

        calcClinton(sentValue);

        resultTweetClinton = {tweetID:tweet.id_str, tweet:tweet.text, positive:clintonPosPer, negative: clintonNegPer, count:resultClinton};

    };

    // calculate Obama percentage
    var calcObama = function (score) {

        if(score==4) {
            posObama +=1;
        }
        else {
            negObama +=1;
        }

        // calculate percentages
        obamaPosPer = Math.round((posObama/resultObama)*100);
        obamaNegPer = Math.round((negObama/resultObama)*100);

    };

    // calculate Trump percentage
    var calcTrump = function (score) {

        if(score==4) {
            posTrump +=1;
        }
        else {
            negTrump +=1;
        }

        // calculate percentages
        trumpPosPer = Math.round((posTrump/resultTrump)*100);
        trumpNegPer = Math.round((negTrump/resultTrump)*100);
    };

    // calculte clinton percentage
    var calcClinton = function (score) {

        if(score==4) {
            posClinton +=1;
        }
        else {
            negClinton +=1;
        }

        // calculate percentages
        clintonPosPer = Math.round((posClinton/resultClinton)*100);
        clintonNegPer = Math.round((negClinton/resultClinton)*100);

    };

    // checks percentages
    var statusTweet = function () {
        if(trumpPosPer > clintonPosPer && trumpPosPer > obamaPosPer) {
            yey = {trump: true, clinton:false, obama:false, tc: false, to: false};
        } else if (trumpPosPer > clintonPosPer) {
            yey = {trump: false, clinton:false, obama:false, tc: true, to: false}
        } else if (trumpPosPer > obamaPosPer) {
            yey = {trump: false, clinton:false, obama:false, tc: false, to: true}
        } else {
           if (clintonPosPer > obamaPosPer) {
               yey = {trump:false, clinton:true, obama:false, tc: false, to: false};
           } else {
               yey = {trump:false, clinton:false, obama:true, tc: false, to: false};
           }
        }
    };


    return router;
};
