var http = require('http');
var url = require('url');
var server = http.createServer();
var port = 1337;

server.on('request', function(req, res) {
  var urlParsed = url.parse(req.url, true);
  // debugger;
  wtf();
  if(req.method === 'GET' && urlParsed.pathname === '/echo' && urlParsed.query.message) {
    res.end(urlParsed.query.message);
    return;
  }

  res.status = 404;
  res.end('Not Found');
});

server.listen(port);
console.log('Server is running on port ' + port);


/** node debug testServer.js --> if using built-in debugger (deprecated)*/
/** node inspect testServer.js --> if using built-in debugger*/
/** server will start but pending -- so always need command (c) to continue, after that open browser)*/

/** help -- all commands list*/
/** c -- continue command*/
/** repl -- debug mode in console*/

/** node-inspect testServer.js  --> if using node-inspect (don't need it at all)*/

/** node --inspect testServer.js  --> if using Chrome debugger*/

/** to trigger non existing methods as wft() above */
//TODO: started dev-2-debug 07:00