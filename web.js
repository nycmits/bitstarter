var express = require('express');

var app = express.createServer(express.logger());
var fs = require("fs")

app.get('/', function(request, response) {
  var buf = new Buffer(fs.readFileSync('index.html','utf8'));
  response.send(buf.toString('utf8'));

//  var k = fs.readFileSync('index.html','utf8');
//  response.send(k);

//  response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
