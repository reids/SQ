// ActiveMQ connection items
var Stomp = require('stomp-client');
var destination = '/queue/submit.authenticate';
var responseDdestination = '/queue/response.authenticate';
var client = new Stomp('127.0.0.1', 61613, 'user', 'pass');
var outstandingRequests = new Array();

client.connect(function(sessionId) {
    client.subscribe(responseDdestination, function(body, headers) {
    	console.log('This is the body of a message on the subscribed queue:', body);
    	var correlationid = headers['correlation-id'];
	    var responseClosure = outstandingRequests[correlationid];
	    if (typeof responseClosure !== "undefined") {
	    	delete outstandingRequests[correlationid];
	    	outstandingRequests.splice(correlationid, 1);
	    	responseClosure(body);
	    }
	    else {
	    	console.log('Error, recieved a message for which I have no closure');
    	}
    });
});

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

var authservice = {
	
	initialize: function(config) {
		// TODO read config from config
	},

	// Authenticate a password
	// User is the user as read from the non Auth DB 
	authenticate: function(email, password, user, done) {
        var responseClosure = function(text) {
			body = JSON.parse(text)
            if (body.status !== 'authenticated') {
                user = null;
              }
            done('', user); // Don't have an err to return here, send empty string
            }
        var correlationid = guid();
        outstandingRequests[correlationid] = responseClosure;
		authrequest = { 
				type : 'authenticate',
				userid : email,
				password : password
				}
        client.publish(destination, JSON.stringify(authrequest), { "correlation-id" : correlationid });
	},
	
	// create a user in the db
	create: function(email, password, done) {
        var responseClosure = function(text) {
        	user = { 'email' : email };
			body = JSON.parse(text)
            if (body.status !== 'created') {
                user = null;
              }
            done(user);
            }
        var correlationid = guid();
        outstandingRequests[correlationid] = responseClosure;
		authrequest = { 
				type : 'createuser',
				userid : email,
				password : password
				}
        client.publish(destination, JSON.stringify(authrequest), { "correlation-id" : correlationid });		
	}
	
}

module.exports = authservice;