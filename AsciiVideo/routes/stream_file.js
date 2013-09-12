var request = require('request');
var src = "http://www.w3schools.com/tags/movie.mp4";

var sources = [];
sources.push({'src': src });

/*
exports.stream_file = function(req, res){
    var index = streamSources.push({ 'src': req.body.videoSource }) - 1;
    res.writeHead('Content-Type', 'application/json');
    res.end({ 'id': index });
};*/

exports.stream_file = function(req, res) {
    var id = parseInt(req.params.id);
    console.log(sources[id]);
    request.get(sources[id].src).pipe(res);
};

exports.request_video = function(req, res) {
    var remoteSrc = req.body.remoteSrc;
    console.log(req.body);
    var index = sources.push({'src': remoteSrc}) - 1;
    res.json({
    	id: index
    });
};