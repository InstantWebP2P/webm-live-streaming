var http = require('http');
var connect = require('connect');

var srv = connect();

srv.use(connect.static(__dirname));

http.createServer(srv).listen(8188);
console.log('content server listen on 8188');