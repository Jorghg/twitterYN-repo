/**
 * Created by ingrskar on 10/30/2016.
 */
var fs = require('fs'), filename = "./trainingset.txt";
classifier = new natural.BayesClassifier();

fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;
    console.log('OK: ' + filename);

    line = data.split("\n");
    list = [];
    for (var i = 0; i < line.length; i++) {
        sentiment = line[i][2];
        tweetText = line[i].substring(7, line[i].length - 4);
        list.push([sentiment, tweetText]);
    }

    for (var j = 0; j < list.length; j++) {
        natural.PorterStemmer.attach();
        var tokentweet = list[j][1];
        tokentweet = tokentweet.tokenizeAndStem();
        var finalTweetString = "";
        for (var x = 0; x < tokentweet.length; x++) {
            finalTweetString += tokentweet[x] + " ";
        }
        classifier.addDocument(finalTweetString, list[j][0]);
    }
    classifier.train();
    classifier.save('classifier.json', function (err, classifier) {
        // the classifier is saved to the classifier.json file!
    });
    var check = 'I like icecream';
    console.log(check);
    console.log(classifier.classify(check));
    console.log(classifier.getClassifications(check));
});