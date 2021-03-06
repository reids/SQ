var url = require('url');
var qs = require('querystring');
var https = require('https');
var authservice = require('./authservice.js');

module.exports = function(mongoconf) {

  var basePath = url.parse(mongoconf.dbUrl);
  var apiKey = mongoconf.apiKey;
  var dbName = mongoconf.dbName;

  // Map the request url to the mongolab url
  // @Returns a parsed Url object
  var mapUrl = module.exports.mapUrl = function(reqUrlString, reqQuery) {
  var reqUrl = url.parse(reqUrlString, true);
  var newUrl = {
      hostname: basePath.hostname,
      protocol: basePath.protocol
    };
    var query = { apiKey: apiKey};
    for(var key in reqQuery) {
      query[key] = reqQuery[key];
    }
    // https request expects path not pathname!
    newUrl.path = basePath.pathname + reqUrl.pathname + '?' + qs.stringify(query);

    return newUrl;
  };


  // Map the incoming request to a request to the DB
  var mapRequest = module.exports.mapRequest = function(req) {
	  var dbPath = '/databases/' + dbName + '/collections/' + req.params.collection + (req.params[0] ? req.params[0] : '');   
	  var newReq = mapUrl(dbPath, req.query);
	  newReq.method = req.method;
	  newReq.headers = req.headers || {};
	  // Don't specify content length, let the server work it out, we've seen problems with umlauts.
	  delete newReq.headers['content-length'];
	  // We need to fix up the hostname
	  newReq.headers.host = newReq.hostname;
	  return newReq;
  };
  /**
   * If we are writing a user then we intercept it so as to send the auth details to the 
   * auth DB. We strip out the password and send a create request to the authservice
   */
  var doUserPreWriteTasks = function(req, res, next, done) {
	  
	  if (req.method !== 'POST' || req.params.collection !== 'users')
		  done(req, res, next);
	  else {
		  // processing a user, we only have user writes, never updates
		  var email = req.body.email;
		  var password = req.body.password;
		  delete req.body.password;
		  
		  authservice.create(email,password, function(user){
			  if (user == null)
					res.json(501, { statusText: 'failed to write authentication data'});
			  else
				  done(req, res, next)
		  });
	  }
   }

  /**
   * Generic proxy for all db requests
   */
  var proxy = function(req, res, next) {
    try {
      var options = mapRequest(req);
      doUserPreWriteTasks(req, res, next, function(req, res, next) {
	      body=JSON.stringify(req.body);
	      // Create the request to the db
	      var dbReq = https.request(options, function(dbRes) {
	        var data = "";
	        res.headers = dbRes.headers;
	        dbRes.setEncoding('utf8');
	        dbRes.on('data', function(chunk) {
	          // Pass back any data from the response.
	          data = data + chunk;
	        });
	        dbRes.on('end', function() {
	          res.header('Content-Type', 'application/json');
	          res.statusCode = dbRes.statusCode;
	          res.httpVersion = dbRes.httpVersion;
	          res.trailers = dbRes.trailers;
	          res.send(data);
	          res.end();
	        });
	      });
	      // Send any data the is passed from the original request, better way to detect an empty body?
	      dbReq.write(JSON.stringify(req.body))
	      dbReq.end();
      });
    } catch (error) {
      console.log('ERROR: ', error.stack);
      res.json(error);
      res.end();
    }
  };

  // Attach the mapurl fn (mostly for testing)
  proxy.mapUrl = mapUrl;
  proxy.mapRequest = mapRequest;
  return proxy;
};