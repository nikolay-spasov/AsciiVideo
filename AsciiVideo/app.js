
/**
 * Module dependencies.
 */

var express = require('express');
//var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var request = require('request');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.get('/', function(req, res) {
  res.render('AsciiVideo');
});
app.get('/defragUndead', function (req, res) {
  var src = "https://www.dropbox.com/s/ecffulwunm4rxvn/defragUndead.mp4?dl=1";
  request.get(src).pipe(res);
});
app.get('/streamfile/:src', function (req, res) {
  var src = unescape(req.params.src);
  request.get(src).pipe(res);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
