var alreadyPosted = [];

var socket = io.connect('/');

socket.on('liveTweet', function (data) {

    console.log(alreadyPosted);
    if(alreadyPosted.length == 0) {
        if(data[0].tweetID != ''){
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
        } else {
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
        }

    } else {
        if(data[0].tweetID in alreadyPosted){
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
        } else {
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

        }
    }

});
