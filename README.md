node-httpd-sleep
================

Simple non-blocking HTTP daemon that can sleep for a amount of time (in milliseconds) and return a specific HTTP response code as specified through URL fragments.

installation
------------

```
### install dependencies - run from checkout directory
$ npm install
```

basic usage
-----------

Start the server:

``` 
$ node httpd-sleep.js run --debug 
DEBUG: Listening on port: 7001
DEBUG: Sending default response code: 200
```

Now connect with a client, and have it wait for a response for 100 ms:

```
$ time curl -I http://localhost:7001/sleep:100/
HTTP/1.1 200 OK
Date: Fri, 24 Jan 2014 02:03:20 GMT
Connection: keep-alive

real  0m0.108s
user  0m0.004s
sys   0m0.003s
```

On the server console you will see:

```
DEBUG: ===========================
DEBUG: URL: '/sleep:100/'
DEBUG: Headers: { 'user-agent': 'curl/7.30.0',
  host: 'localhost:7001',
  accept: '*/*' }
DEBUG: Sleep for: 100 ms
DEBUG: Response code: 200
```

advanced usage
--------------

Start the server on a different port, responding with 504 by default:

```
$ node httpd-sleep.js run --debug --port 8888 -r 504
DEBUG: Listening on port: 8888
DEBUG: Sending default response code: 504
```

Now connect 2 clients, in 2 different terminals:

```
### client #1, sleeps for 10 seconds
$ time curl -I http://localhost:8888/sleep:10000/
HTTP/1.1 504 Gateway Time-out
Date: Fri, 24 Jan 2014 02:05:47 GMT
Connection: keep-alive

real  0m10.009s
user  0m0.004s
sys   0m0.004s

### client #2, sleeps for 1 seconds
$ time curl -I http://localhost:8888/sleep:1000/
HTTP/1.1 504 Gateway Time-out
Date: Fri, 24 Jan 2014 02:05:43 GMT
Connection: keep-alive

real  0m1.007s
user  0m0.004s
sys   0m0.003s
```

On the server console, you will see:

```
DEBUG: ===========================
DEBUG: URL: '/sleep:10000/'
DEBUG: Headers: { 'user-agent': 'curl/7.30.0',
  host: 'localhost:8888',
  accept: '*/*' }
DEBUG: Sleep for: 10000 ms
DEBUG: Response code: 504
DEBUG: ===========================
DEBUG: URL: '/sleep:1000/'
DEBUG: Headers: { 'user-agent': 'curl/7.30.0',
  host: 'localhost:8888',
  accept: '*/*' }
DEBUG: Sleep for: 1000 ms
DEBUG: Response code: 504
```

changing the response code
--------------------------

You can change the response by adding a /response:CODE/ url fragment:

```
$ time curl -I http://localhost:8888/sleep:1000/response:204/
HTTP/1.1 204 No Content
Date: Fri, 24 Jan 2014 02:07:11 GMT
Connection: keep-alive

real  0m1.009s
user  0m0.004s
sys   0m0.003s
```

On the server console, you will see:

```
DEBUG: ===========================
DEBUG: URL: '/sleep:1000/response:204/'
DEBUG: Headers: { 'user-agent': 'curl/7.30.0',
  host: 'localhost:8888',
  accept: '*/*' }
DEBUG: Sleep for: 1000 ms
DEBUG: Response code: 204
```

url path vs param vs headers
----------------------------

And wherever you put that in the URL is up to you. You can send it as a query param as well:

```
$ time curl -I http://localhost:8888?_=/sleep:1000/response:204/
HTTP/1.1 204 No Content
Date: Fri, 24 Jan 2014 02:08:07 GMT
Connection: keep-alive

real 0m1.006s
user 0m0.004s
sys  0m0.003s
```

On the server console, you will see:


```
DEBUG: ===========================
DEBUG: URL: '/?_=/sleep:1000/response:204/'
DEBUG: Headers: { 'user-agent': 'curl/7.30.0',
  host: 'localhost:8888',
  accept: '*/*' }
DEBUG: Sleep for: 1000 ms
DEBUG: Response code: 204
```

Or you can send it as part of the request headers. Note that if you send both request headers AND url fragments, the url fragments will have higher priority:

```
$ time curl -H 'X-Httpd-Sleep: 1000' -H 'X-Httpd-Response: 204' -I http://localhost:8888/
HTTP/1.1 204 No Content
Date: Mon, 27 Jan 2014 19:40:40 GMT
Connection: keep-alive


real  0m1.016s
user  0m0.004s
sys   0m0.005s
```

On the server console, you will see:

```
DEBUG: ===========================
DEBUG: URL: '/'
DEBUG: Headers: { 'user-agent': 'curl/7.30.0',
  host: 'localhost:8888',
  accept: '*/*',
  'x-httpd-sleep': '1000',
  'x-httpd-response': '204' }
DEBUG: Sleep for: 1000 ms
DEBUG: Response code: 204
```
