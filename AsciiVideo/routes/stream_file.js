var request = require('request');
var src = "http://www.w3schools.com/tags/movie.mp4";

var sources = [];
sources.push({ 'src': src });

exports.stream_file = function(req, res) {
  var id = parseInt(req.params.id);
  request.get(source[id].src).pipe(res);
};

exports.request_video = function(req, res) {
  var remoteSrc = req.body.remoteSrc;
  var index = sources.push( { 'src': remoteSrc }) - 1;
  res.json({ id: index });
};