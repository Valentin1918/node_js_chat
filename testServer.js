var http = require('http');
var url = require('url');

var server = http.createServer();

server.on('request', function(req, res) {
  var urlParsed = url.parse(req.url, true);
  debugger;
  if(req.method === 'GET' && urlParsed.pathname === '/echo' && urlParsed.query.message) {
    res.end(urlParsed.query.message);
    return;
  }

  res.status = 404;
  res.end('Not Found');
});

server.listen(1337);
console.log('Server is running');

//TODO: started dev-2-debug