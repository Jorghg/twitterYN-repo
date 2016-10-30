$(function () {
    var socket = io.connect('/');

    var $genUser = $('#searchBtn');

    var userId = '';

    $(document).ready(function () {
        userId = $('#userId').val();
        $genUser.click(function () {
            console.log('userid ' + userId)
        });

    socket.on('liveTweet', function (data) {
        console.log('useriddidididi; ' + userId);
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

    socket.on(userId, function (data) {
        console.log('userid; ' + userId);
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
        //console.log('Count ' + data.count + ', Pos: ' + data.positive + ', Neg: ' + data.neutral + ' Neu: ' + data.negative);

    });
});
});