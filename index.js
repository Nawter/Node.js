var url = require('url');
var http = require('http');
var StringDecoder = require('string_decoder').StringDecoder;


// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(4000, function() {
  console.log("The server is listeninig on port 4000");
})



// All the server logic for both the http and https server
var unifiedServer = function(req,res){
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;


  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Get the headers
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function(data) {
    buffer += decoder.end();

    // Choose the handler this request should go to.
    // if one is not found use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
      router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data,function(statusCode,payload){
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler, or default to an empty queryStringObject
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string_decoder
      var payloadString = JSON.stringify(payload);

      // Retrun the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request path
      console.log('Returning this response', statusCode,payloadString);

    });
  });
};

// Define the handlers
var handlers = {};

// Hello World handler
handlers.hello = function(data,callback){
    callback(200,{'message':'Hello World!'});
};

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};


// Define a request router
var router = {
  'hello': handlers.hello
};
