$(function () {
    var socket = io.connect('/');

    var $checkStream = $('#stream');

    var stream = true;

    $(document).ready(function () {

        console.log(stream);
        $checkStream.click(function () {
            if ($('#stream').prop("checked"))
            {
                stream=true;
            } else {
                stream=false;
            }
            $.ajax({
                type: 'POST',
                data: stream,
                contentType: 'application/json',
                url: '/',
                success: function() {
                    console.log(stream);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });


    socket.on('trumpTweet', function (data) {
        console.log($('#feedTrump li').length);
        if ( $('#feedTrump li').length > 150 ){

            $('#feedTrump li:last').remove();
        }

        $("#feedTrump").prepend('<li class="tweet">' + data.tweet + '</li></br>');

        count1.innerHTML = data.count;
        pos1.innerHTML = data.positive;
        neg1.innerHTML = data.negative;


    });

    socket.on('clintonTweet', function (data) {
        $("#feedClinton").prepend('<li class="tweet">' + data.tweet + '</li></br>');

        if ( $('#feedClinton li').length > 150 ){
            $('#feedClinton li:last').remove();
        }
        count2.innerHTML = data.count;
        pos2.innerHTML = data.positive;
        neg2.innerHTML = data.negative;


    });

    socket.on('obamaTweet', function (data) {
        $("#feedObama").prepend('<li class="tweet">' + data.tweet + '</li></br>');

        if ( $('#feedObama li').length > 150 ){
            $('#feedObama li:last').remove();
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