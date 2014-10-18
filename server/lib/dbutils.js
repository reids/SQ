var util = require('util');
var rest = require('request');

var dbutils = {
	
	initialize: function(dbUrl, apiKey, dbName, collection) {
		this.dbUrl = dbUrl;
		this.apiKey = apiKey;
		this.dbName = dbName;
		this.collection = collection;
		this.baseUrl = this.dbUrl + '/databases/' + this.dbName + '/collections/' + collection + '/';
	},

	// Query the users collection
	query: function(query, done) {
	
	  query.apiKey = this.apiKey;     // Add the apiKey to the passed in query
	  var request = rest.get(this.baseUrl, { qs: query, json: {} }, function(err, response, body) {
	    done(err, body);
	  });
	},
	
	// Get a user by id
	get: function(id, done) {
		
	  var query = { apiKey: this.apiKey };
	  var request = rest.get(this.baseUrl + id, { qs: query, json: {} }, function(err, response, body) {
	    done(err, body);
	  });
	},
	
	// Find a user by their email
	findByEmail: function(email, done) {
		
	  this.query({ q: JSON.stringify({email: email}) }, function(err, result) {
	    if ( result && result.length === 1 ) {
	      return done(err, result[0]);
	    }
	    done(err, null);
	  });
	},

	// Check whether the user passed in is a valid one
	verifyUser: function(email, password, done) {
	
	  this.findByEmail(email, function(err, user) {
	    if (!err && user) {
	      if (user.password !== password) {
	        user = null;
	      }
	    }
	    done(err, user);
	  });
	}
}

module.exports = dbutils;