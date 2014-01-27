var http  = require("http");
var U     = require('util');
var cli   = require('commander');

// Setup options
cli.version('0.0.5')
.option('-r, --response-code <HTTP response code>',     'HTTP response code to send')
.option('-p, --port <port>',                            'Port to listen on')
.option('-d, --debug',                                  'Enable debug output')
.option('-D, --debug-header',                           'Enable debug header')
.option('-H, --headers <Header:Value>,<Header:Value>',  'Add response header');

// ### Command: launch
cli.command('run')
.description("Add /sleep:DIGITS/ to the URL path to sleep for DIGITS milliseconds\n" +
             "                       " + // ugly hack to align description
             "Add /response:DIGITS/ to the url to respond with HTTP DIGITS code\n\n" +
             "                       " + // ugly hack to align description
             "Alternately, send X-Httdp-Sleep and/or X-Httdp-Response headers")
.action(function() {
    var port             = cli.port         || 7001;
    var resp             = cli.responseCode || 200;
    var response_headers = { };

    // We get a list like: foo:1,bar:2 etc and we intend to coerce that into
    // { foo: 1, bar: 2} as headers to send.
    if( cli.headers ) {
      var hlist = cli.headers.split(',');
      for( var i in hlist ) {
        var kv = hlist[i].split(':');
        response_headers[ kv[0] ] = kv[1];
      }
    }

    if( cli.debug ) {
      U.debug( "Listening on port: " + port );
      U.debug( "Sending default response code: " + resp );
      U.debug( "Sending headers: " + U.inspect(response_headers) );
    }

    http.createServer(function(request, response) {
      // The request headers
      var headers    = request.headers || {};
      var h_sleep    = headers['x-httpd-sleep']    || false;
      var h_response = headers['x-httpd-response'] || resp;

      // How long to sleep for
      var sleep_match = request.url.match( /\/sleep:(\d+)/ );
      var sleep_time  = parseInt(sleep_match && sleep_match[0] ? sleep_match[1] : h_sleep);

      // Response code
      var resp_match = request.url.match( /\/response:(\d+)/ );
      var resp_code  = parseInt(resp_match && resp_match[0] ? resp_match[1] : h_response);

      // diagnostics
      if( cli.debug ) {
        U.debug( "===========================" );
        U.debug( "URL: "              + U.inspect( request.url ) );
        U.debug( "Headers: "          + U.inspect( request.headers ) );
        U.debug( "Sleep for: "        + (sleep_time || 0) + " ms" );
        U.debug( "Response code: "    + resp_code );

        if( cli.headers ) {
          U.debug( "Response headers: " + U.inspect( response_headers ) );
        }
      }

      // we may respond asynchronously, so store the response in a function
      var response_func = function() {

          // if running in debug mode, also send a debug header
          if( cli.header ) {
              response.setHeader( 'X-Httpd-Slept', sleep_time || 0);
          }

          response.writeHead( resp_code, response_headers );
          response.end();
      }

      // sleep
      if( sleep_time ) {
        var i = parseInt( sleep_time );
        setTimeout( function() {
          response_func();
        }, i);
      } else {
        response_func();
      }

    }).listen( port );
});

cli.parse( process.argv );
