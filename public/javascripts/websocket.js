$(function () {
    var socket = io.connect('/');

    $(document).ready(function () {


    socket.on('trumpTweet', function (data) {
        twttr.widgets.createTweet(
            data.tweetID,
            document.getElementById('feedTrump'),
            {
                theme: 'light'
            });
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
                statusTweet.innerHTML = "Ney.. Clinton for the win";
            } else if (data.obama == true){
                statusTweet.innerHTML = "GO OBAMA!";
            }

        });
    });
});