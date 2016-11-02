module.exports = function (io) {

    var express = require('express');
    var router = express.Router();
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
        res.render('index', { title: 'Trump, Yey or Ney?', userId: userId});
    });


    // classifier for sentiment
    var Classifier = '';

    //global variables...
    var socketConnected = 0;
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

    // HUSK!!!!
    var dbID = 0;
    var ready = false;

    //define stream
    var stream = twit.stream('statuses/filter',{language:'en',track: 'trump,clinton,obama'});

    // load classifier
    natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
        Classifier = classifier;
    });

    // on connect
    io.on('connection', function (socket) {

        socketId = socket.id;

        // if no sockets is connected, load from db and start stream
        if(socketConnected == 0){
            var paramsQuery = {
                TableName: table,
                KeyConditionExpression: "#searchNumber = :number",
                ExpressionAttributeNames: {
                    "#searchNumber": "ID"
                },
                ExpressionAttributeValues: {
                    ":number": dbID
                }

            };

            docClient.query(paramsQuery, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error: ", JSON.stringify(err, null, 2));
                }  else  {
                    console.log("Query succeeded. ");

                    data.Items.forEach(function(item) {
                        posTrump = item.stats.posTrump;
                        resultTrump = item.stats.countTrump;
                        negTrump = resultTrump - posTrump;

                        posClinton = item.stats.posClinton;
                        resultClinton = item.stats.countClinton;
                        negClinton = resultClinton - posClinton;

                        posObama = item.stats.posObama;
                        resultObama = item.stats.countObama;
                        negObama = resultObama - posObama;
                        ready = true;
                        console.log('Query Worked ! Goodshit');

                    });
                }
            });
            if (ready == true) {
                stream.start();
                console.log('started');
            }

        }

        socketConnected += 1;

        console.log('Sockets connected: ' + socketConnected);


        socket.on('disconnect', function () {
            socketConnected -= 1;
            console.log('Disconnect');
            console.log('Sockets connected:' + socketConnected);
            dbID += 1;
            // if no sockets are connected, put into db
            if (socketConnected == 0){
                ready = false;
                stream.stop();
                console.log('stopped');
                var paramsPut = {
                    TableName:table,
                    Item: {
                        "ID": dbID,
                        "stats": {
                            "posTrump": posTrump,
                            "posClinton": posClinton,
                            "posObama": posObama,
                            "countTrump": resultTrump,
                            "countClinton": resultClinton,
                            "countObama": resultObama
                        }
                    }
                };
                require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                    console.log('addr: '+add);
                })
                docClient.put(paramsPut, function(err, data) {
                    if (err) {
                        console.log("Unable to add to DB: Error JSON", JSON.stringify(err, null, 2));
                    }  else  {
                        console.log("Items added to DB: ", data);
                    }
                });
            }
        });

    });


    //catch tweet
    stream.on('tweet',function(tweet) {
        var inTweet = tweet.text.toLowerCase();
        if (inTweet.includes('trump')){
            trump(tweet);
            io.emit('trumpTweet',resultTweetTrump);
        } else if (inTweet.includes('clinton')) {
            clinton(tweet);
            io.emit('clintonTweet',resultTweetClinton);
        } else if (inTweet.includes('obama')){
            obama(tweet);
            io.emit('obamaTweet',resultTweetObama);
        }
        statusTweet();
        io.emit('status',yey);

    });

    // catch error
    stream.on('error', function(error) {
        console.log('Stream error: ' + error.message);
    });



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
        resultTweetObama = {tweetID:tweet.id_str, positive:obamaPosPer, negative: obamaNegPer, count:resultObama};

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
        resultTweetTrump = {tweetID:tweet.id_str, positive:trumpPosPer, negative: trumpNegPer, count: resultTrump};
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

        resultTweetClinton = {tweetID:tweet.id_str, positive:clintonPosPer, negative: clintonNegPer, count:resultClinton};

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