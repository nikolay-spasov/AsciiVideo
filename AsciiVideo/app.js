
/**
 * Module dependencies.
 */

var express = require('express');
//var routes = require('./routes');
var user = require('./routes/user');
var stream_file = require('./routes/stream_file');
var http = require('http');
var path = require('path');

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

app.get('/', function(req, res) {
  res.render('AsciiVideo');
});
app.post('/requestVideo', stream_file.request_video);
app.post('/streamFile/:id', stream_file.stream_file);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
