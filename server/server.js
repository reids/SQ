var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync(__dirname + '/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/cert/server.crt').toString();
var credentials = {key: privateKey, cert: certificate};

var express = require('express');
var mongoProxy = require('./lib/mongo-proxy');
var config = require('./config.js');
var passport = require('passport');
var security = require('./lib/security');
var xsrf = require('./lib/xsrf');
var protectJSON = require('./lib/protectJSON');
require('express-namespace');
var restrictDB = require('./lib/restrictDB');

var app = express();
var secureServer = https.createServer(credentials, app);
var server = http.createServer(app);

require('./lib/routes/static').addRoutes(app, config);

app.use(protectJSON);

app.use(express.logger());                                  // Log requests to the console
app.use(express.bodyParser());                              // Extract the data from the body of the request - this is needed by the LocalStrategy authenticate method
app.use(express.cookieParser(config.server.cookieSecret));  // Hash cookies with this secret
app.use(express.cookieSession());                           // Store the session in the (secret) cookie
app.use(passport.initialize());                             // Initialize PassportJS
app.use(passport.session());                                // Use Passport's session authentication strategy - this stores the logged in user in the session and will now run on any request
app.use(xsrf);                                            // Add XSRF checks to the request
security.initialize(config.mongo.dbUrl, config.mongo.apiKey, config.security.dbName, config.security.usersCollection); // Add a Mongo strategy for handling the authentication

app.use(function(req, res, next) {
  if ( req.user ) {
    console.log('Current User:', req.user.firstName, req.user.lastName);
  } else {
    console.log('Unauthenticated');
  }
  next();
});

app.namespace('/databases/:db/collections/:collection*', function() {
  app.all('/', function(req, res, next) {
    if ( req.method !== 'GET'&& (req.params.collection !== 'users') ) {
      // We require the user is authenticated to modify any collections except create user
      security.authenticationRequired(req, res, next);
    } else {
      next();
    }
  });
  // restrict DB access to the logged in user
  app.get('/', restrictDB);
  // Proxy database calls to the MongoDB
  app.all('/', mongoProxy(config.mongo.dbUrl, config.mongo.apiKey));
});

require('./lib/routes/security').addRoutes(app, security);
require('./lib/routes/appFile').addRoutes(app, config);

// A standard error handler - it picks up any left over errors and returns a nicely formatted server 500 error
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// Start up the server on the port specified in the config
server.listen(config.server.listenPort);
console.log('Angular App Server - listening on port: ' + config.server.listenPort);
secureServer.listen(config.server.securePort);
console.log('Angular App Server - listening on secure port: ' + config.server.securePort);
