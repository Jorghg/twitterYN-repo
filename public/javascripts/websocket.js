var socket = io.connect('/');


var alreadyPosted = [];

socket.on('liveTweet', function (data) {
    twttr.widgets.createTweet(
        data[0].tweetID,
        document.getElementById('tweets1'),
        {
            theme: 'light'
        });

    pos1.innerHTML = Math.round(data[0].positive);
    neu1.innerHTML = Math.round(data[0].neutral);
    neg1.innerHTML = Math.round(data[0].negative);

    alreadyPosted.push(data[0].tweetID);
    console.log(alreadyPosted + ' ' + alreadyPosted.length);

});

socket.on('testTweet', function (data) {
    twttr.widgets.createTweet(
        data[1].tweetID,
        document.getElementById('tweets2'),
        {
            theme: 'light'
        });

    pos2.innerHTML = Math.round(data[1].positive);
    neu2.innerHTML = Math.round(data[1].neutral);
    neg2.innerHTML = Math.round(data[1].negative);

    alreadyPosted.push(data[1].tweetID);
    console.log(alreadyPosted + ' ' + alreadyPosted.length);

});
