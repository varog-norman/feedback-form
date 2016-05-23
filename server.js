var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var static = require('node-static');

var file = new static.Server();

http.createServer(function(request, response) {

	request.addListener( 'end', function () {
        file.serve( request, response );
    } ).resume();

}).listen(process.env.PORT || 8888);
