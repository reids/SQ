var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync(__dirname + '/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/cert/server.crt').toString();
var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var config = require('./config.js');

var mongoProxy = require('./lib/mongo-proxy');
var dbProxy=mongoProxy(config.mongo);
var dbUtils = require('./lib/dbutils');
dbUtils.initialize(config.mongo.dbUrl, config.mongo.apiKey, config.mongo.dbName, config.security.usersCollection)

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

security.initialize(config.mongo.dbUrl, 
		config.mongo.apiKey, 
		config.security.dbName, 
		config.security.usersCollection,
		config.broker);

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
    if ( req.method !== 'POST'&& (req.params.collection !== 'users') ) {
      // We require the user is authenticated to modify any collections except create user
      security.authenticationRequired(req, res, next);
    } else {
      next();
    }
  });
  // restrict DB access
  app.all('/', restrictDB(dbUtils));
  // Proxy database calls to the MongoDB
  app.all('/', dbProxy);
});

require('./lib/routes/api').addRoutes(app, dbProxy, dbUtils, security);
require('./lib/routes/security').addRoutes(app, security);
require('./lib/routes/appFile').addRoutes(app, config);

// A standard error handler - it picks up any left over errors and returns a nicely formatted server 500 error
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// Start up the server on the port specified in the config
server.listen(config.server.listenPort);
console.log('Angular App Server - listening on port: ' + config.server.listenPort);
secureServer.listen(config.server.securePort);
console.log('Angular App Server - listening on secure port: ' + config.server.securePort);
