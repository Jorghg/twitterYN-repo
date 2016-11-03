$(function () {
    var socket = io.connect('/');

    $(document).ready(function () {
        var trumpTweetList = [];
        var clintonTweetList = [];
        var obamaTweetList = [];

    socket.on('trumpTweet', function (data) {
        if(trumpTweetList.length > 10){
            trumpTweetList.shift();
        }
        trumpTweetList.push(data.tweet);
        feedTrump.innerHTML = '<p id="tweet">' + trumpTweetList[trumpTweetList.length -1] + '</p></br>' + feedTrump.innerHTML;
        count1.innerHTML = data.count;
        pos1.innerHTML = data.positive;
        neg1.innerHTML = data.negative;


    });

    socket.on('clintonTweet', function (data) {
        twttr.widgets.createTweet(
            data.tweetID,
            document.getElementById('feedClinton'),
            {
                theme: 'light'
            });
        count2.innerHTML = data.count;
        pos2.innerHTML = data.positive;
        neg2.innerHTML = data.negative;


    });

    socket.on('obamaTweet', function (data) {
        twttr.widgets.createTweet(
            data.tweetID,
            document.getElementById('feedObama'),
            {
                theme: 'light'
            });
        count3.innerHTML = data.count;
        pos3.innerHTML = data.positive;
        neg3.innerHTML = data.negative;

    });
        socket.on('status', function (data) {

            if (data.trump == true) {
                statusTweet.innerHTML = "YEY!"
            } else if (data.clinton == true) {
                statusTweet.innerHTML = "Ney.. Clinton for the win!";
            } else if (data.obama == true){
                statusTweet.innerHTML = "GO OBAMA!";
            } else if (data.tc == true){
                statusTweet.innerHTML = "NEY.. At least he's more yey than Clinton";
            } else if (data.to == true){
                statusTweet.innerHTML = "NEY.. Beats Obama tho";
            }

        });
    });
});