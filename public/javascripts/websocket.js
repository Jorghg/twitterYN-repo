$(function () {
    var socket = io.connect('/');

    $(document).ready(function () {


    socket.on('trumpTweet', function (data) {
        if ( $('#feedTrump li').length > 10 ){
            $('#feedTrump li').last().remove();
        }

        $("#feedTrump").prepend('<li id="tweet">' + data.tweet + '</li></br>');

        count1.innerHTML = data.count;
        pos1.innerHTML = data.positive;
        neg1.innerHTML = data.negative;


    });

    socket.on('clintonTweet', function (data) {
        $("#feedClinton").prepend('<li id="tweet">' + data.tweet + '</li></br>');

        if ( $('#feedClinton li').length > 10 ){
            $('#feedClinton li:last-child').remove();
        }
        count2.innerHTML = data.count;
        pos2.innerHTML = data.positive;
        neg2.innerHTML = data.negative;


    });

    socket.on('obamaTweet', function (data) {
        $("#feedObama").prepend('<li id="tweet">' + data.tweet + '</li></br>');

        if ( $('#feedObama li').length > 10 ){
            $('#feedObama li:last-child').remove();
        }
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