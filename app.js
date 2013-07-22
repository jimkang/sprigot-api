var http = require('http');
var url = require('url');

var port = 80;

if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'dev') {
  port = 3000;
}


http.createServer(function createSprigotServer(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
})
.listen(port, '127.0.0.1');

console.log('Server running at http://127.0.0.1:' + port);

