var http  = require("http");
var U     = require('util');
var sleep = require('sleep');
var cli   = require('commander');

// Setup options
cli.version('0.0.1')
.option('-r, --response-code <HTTP response code>', 'HTTP response code to send')
.option('-p, --port <port>',                        'Port to listen on')
.option('-n, --micro-seconds',                      'Sleep time provided in microseconds')
.option('-d, --debug',                              'Enable Debug output');

// ### Command: launch
cli.command('run')
.description('Add /sleep:DIGITS/ to the URL path to sleep for DIGITS (micro)seconds')
.action(function() {
    var port = cli.port         || 7001;
    var resp = cli.responseCode || 200;
    var unit = cli.microSeconds ? "micro seconds" : "seconds";

    if( cli.debug ) {
        U.debug( "Listening on port: " + port );
        U.debug( "Sending response code: " + resp );
        U.debug( "Sleep time in: " + unit );
    }

    http.createServer(function(request, response) {

      // How long to sleep for
      var match      = request.url.match( /\/sleep:(\d+)/ );
      var sleep_time = match && match[0] ? match[1] : false;

      // diagnostics
      if( cli.debug ) {
        U.debug( "===========================" );
        U.debug( "URL: "     + U.inspect( request.url ) );
        U.debug( "Headers: " + U.inspect( request.headers ) );
        U.debug( "Sleep for: " + (sleep_time || 0) + " " + unit );
      }

      // sleep
      if( sleep_time ) {
        var i = parseInt( sleep_time );
        cli.microSeconds ? sleep.usleep( i ) : sleep.sleep( i );
      }

      // response
      response.writeHead( resp );
      response.end();

    }).listen( port );
});

cli.parse( process.argv );
