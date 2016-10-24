var socket = io.connect('/');
tweets = document.getElementById('tweets');
socket.on('liveTweet', function (data) {
    twttr.widgets.createTweet(
        data.tweetID,
        document.getElementById('tweets'),
        {
            theme: 'light'
        })
});

