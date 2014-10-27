var express = require('express');
var passport = require('passport');
var mongoStrategy = require('./mongo-strategyAMQ');
var app = express();
var rest = require('request');

var filterUser = function(user) {
  if ( user ) {
    return {
      user : {
        id: user._id.$oid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
  } else {
    return { user: null };
  }
};

var security = {

	initialize: function(url, apiKey, dbName, authCollection) {
    passport.use(new mongoStrategy(url, apiKey, dbName, authCollection));
    //Load our APIKey, don't confuse with the mongoDB one
    query = {};
    query.apiKey = apiKey;
    this.baseUrl = url + '/databases/' + dbName + '/collections/' + 'apikey';
    thismodule = this;
    var request = rest.get(this.baseUrl, { qs: query, json: {} }, function(err, response, body) {
    	if (body.length == 1)
    		thismodule.apiKey=body[0].apiKey;
    	else {
    		console.log ("Warning, failed to retrieve APIKEY");
    	}
      });
  },
  authenticationRequired: function(req, res, next) {
    console.log('authRequired');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.json(401, filterUser(req.user));
    }
  },
  adminRequired: function(req, res, next) {
    console.log('adminRequired');
    if (req.user && req.user.admin ) {
      next();
    } else {
      res.json(401, filterUser(req.user));
    }
  },
  sendCurrentUser: function(req, res, next) {
    res.json(200, filterUser(req.user));
    res.end();
  },
  login: function(req, res, next) {
    function authenticationcb(err, user, info){
      if (err) { return next(err); }
      if (!user) { return res.json(filterUser(user)); }
      req.logIn(user, function(err) {
        if ( err ) { return next(err); }
        return res.json(filterUser(user));
      });
    }

    return passport.authenticate(mongoStrategy.name, authenticationcb)(req, res, next);
  },
  logout: function(req, res, next) {
	    req.logout();
	    res.send(204);
  },
  // Think of this as a login method for API, all it does is validate the APIKey
  loginAPI: function(apiKey) {
	  	if (this.apiKey && this.apiKey == apiKey)
	  		return true;
	  	else
	  		return false;
  },
  loginAPIUP: function(req, res, next, callback) {
	    function authenticationcb(err, user, info){
	      callback (user);
	    }

	    return passport.authenticate(mongoStrategy.name, authenticationcb)(req, res, next);
  }

};

module.exports = security;