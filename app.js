var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var aws = require('aws-sdk');
var Twitter = require('twit');

var routes = require('./routes/index');

var app = express();

app.io = require('socket.io')();

// Instantiate SQS.
var sqs = new aws.SQS({"accessKeyId":"AKIAID4S7EMMHOAWRRTA", "secretAccessKey": "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", "region": "us-west-2"});

//twitter cresidentals
var twit = new Twitter({
  consumer_key: 'XoP0cUhbC3KIzM5lqkkQpn06N',
  consumer_secret: 'k0ImtPjZ6iN1DwIZaBZrHuLIxxhtnRMaeycIreKJ9AN2JFu7sP',
  access_token: '1917108290-38rqsxvEuJmXKOmBrsqHuygsO09MBTTJrFr5l3Z',
  access_token_secret: 'bY1tBzx9BgF5PYlsm8DQmCEGRnkj1SMO6w4lJsbcjePun'
});

app.get('/receive', function (req, res) {
  var params = {
    QueueUrl: "https://sqs.us-west-2.amazonaws.com/643927985634/Tweets010",
    MaxNumberOfMessages: 10
  };

  sqs.receiveMessage(params, function(err, data) {
    if(err) {
      res.send(err);
    }
    else {
      res.send(data);
    }
  });
});

//define stream
var stream = twit.stream('statuses/filter',{language:'en',track: 'trump,clinton,obama'});

//catch tweet
stream.on('tweet',function(tweet) {
  send(tweet);
});

// catch error
stream.on('error', function(error) {
  console.log('Stream error: ' + error.message);
});


function send(tweet) {
  var params = {
    MessageBody: JSON.stringify(tweet),
    QueueUrl: "https://sqs.us-west-2.amazonaws.com/643927985634/Tweets010"
  };
  sqs.sendMessage(params, function(err, data) {
    if (err){
      console.log(err.message);
    }
  });
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes(app.io));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
