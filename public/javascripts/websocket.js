var socket = io.connect('/');
tweets = document.getElementById('tweets');
socket.on('liveTweet', function (data) {
    twttr.widgets.createTweet(
        data.tweetID,
        document.getElementById('tweets'),
        {
            theme: 'light'
        });

    pos.innerHTML = Math.round(data.positive);
    neu.innerHTML = Math.round(data.neutral);
    neg.innerHTML = Math.round(data.negative);
});

