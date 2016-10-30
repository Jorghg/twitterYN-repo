

var socket = io.connect('/');


socket.on('liveTweet', function (data) {
    twttr.widgets.createTweet(
        data.tweetID,
        document.getElementById('tweets1'),
        {
            theme: 'light'
        });

    pos1.innerHTML = data.positive;
    neu1.innerHTML = data.neutral;
    neg1.innerHTML = data.negative;


});

socket.on('testTweet', function (data) {
    twttr.widgets.createTweet(
        data.tweetID,
        document.getElementById('tweets2'),
        {
            theme: 'light'
        });

    pos2.innerHTML = data.positive;
    neu2.innerHTML = data.neutral;
    neg2.innerHTML = data.negative;


});

socket.on('totalTweet', function (data) {
    console.log('Count ' + data.count + ', Pos: ' + data.positive + ', Neg: ' + data.neutral + ' Neu: ' + data.negative);

});