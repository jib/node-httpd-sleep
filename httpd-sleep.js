var http  = require("http");
var U     = require('util');
var cli   = require('commander');

// Setup options
cli.version('0.0.3')
.option('-r, --response-code <HTTP response code>', 'HTTP response code to send')
.option('-p, --port <port>',                        'Port to listen on')
.option('-d, --debug',                              'Enable Debug output');

// ### Command: launch
cli.command('run')
.description("Add /sleep:DIGITS/ to the URL path to sleep for DIGITS milliseconds\n" +
             "                       " + // ugly hack to align description
             "Add /response:DIGITS/ to the url to respond with HTTP DIGITS code")
.action(function() {
    var port = cli.port         || 7001;
    var resp = cli.responseCode || 200;

    if( cli.debug ) {
        U.debug( "Listening on port: " + port );
        U.debug( "Sending default response code: " + resp );
    }

    http.createServer(function(request, response) {

      // How long to sleep for
      var sleep_match = request.url.match( /\/sleep:(\d+)/ );
      var sleep_time  = sleep_match && sleep_match[0] ? sleep_match[1] : false;

      // Response code
      var resp_match = request.url.match( /\/response:(\d+)/ );
      var resp_code  = resp_match && resp_match[0] ? resp_match[1] : resp;

      // diagnostics
      if( cli.debug ) {
        U.debug( "===========================" );
        U.debug( "URL: "           + U.inspect( request.url ) );
        U.debug( "Headers: "       + U.inspect( request.headers ) );
        U.debug( "Sleep for: "     + (sleep_time || 0) + " ms" );
        U.debug( "Response code: " + resp_code );
      }

      // sleep
      if( sleep_time ) {
        var i = parseInt( sleep_time );
        setTimeout( function() {
          // response
          response.writeHead( resp_code );
          response.end();
        }, i);
      } else {
        // response
        response.writeHead( resp_code );
        response.end();
      }

    }).listen( port );
});

cli.parse( process.argv );
