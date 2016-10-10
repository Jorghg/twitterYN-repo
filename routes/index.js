var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Trump, Yey or Ney?' });
});

var Twitter = require('node-twitter');

var twitterSearchClient = new Twitter.SearchClient(
    '4hqgaAIFpjxqnslCkH0nAMkjW',
    'sKBiW41GDblRVmmHhc6yRazsERKXK8bxmQEqY5zoUEr0W7cnoQ',
    '772612067484282880-S1OHtG3wOr9DTyhcmTsSQNC1iHUpWwj',
    'e5j2RTZhlyz40PsHzROMsNH9kLO9E3FYfE15Ym1unfw3Q'
);

twitterSearchClient.search({'q': 'Trump'}, function(error, result) {
  if (error)
  {
    console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
  }

  if (result)
  {
    console.log(result);
  }
});






module.exports = router;
