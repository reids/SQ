/**
 * support to massage API urls into DB urls The rest API is modelled on MongoDB in that it is considered
 * to be authenticated to do anything if the API key is valid. The API is more or less a proxy to the mongo
 * db just presenting an alternative flavour and some validations
 */
module.exports = function(mongoProxy, utils, securityhandler) {
	
	dbProxy = mongoProxy;
	dbUtils = utils;
	security = securityhandler;
	APIKey = '1234';

	var apiRequest = function(req, res, next) {
		console.log (" API request for " + req.params.object, req.params.action, req.params.id);
			  
		try {
			
			switch (req.params.collection) {
			case "users":
				processUserRequest(req, res, next);
				break;
			case "timezones":
				validateAPIUP(req, res, next, function(user) {
					if (user) {
						processTimezoneRequest(req, res, next, user);
					}
					else
						res.json(401, { statusText: 'Unauthorized'});
				});
				break;
			default:
				res.json(501, { statusText: 'Not Implemented'});
			}	
		}
		catch(err) {
			switch (err) {
			case 1:
				res.json(400, { statusText: 'Invalid method'});
				break;
			case 2:
				res.json(401, { statusText: 'Unauthorized'});
				break;
			default:
				res.json(501, { statusText: 'Unknown internal Error'});
			}
		} 
	};

    return apiRequest;
};

function processUserRequest(req, res, next) {
    switch (req.params.action) {
    case "create":
    case "new":
    	processUserNewRequest(req, res, next);
    	break;
    default:
		res.json(501, { statusText: 'Not Implemented'});
    }
		  
}

function processTimezoneRequest(req, res, next, user) {
	try {
	    switch (req.params.action) {
	    case "list":
	    	processTimezoneListRequest(req, res, next, user);
	    	break;
	    case "new":
	    case "create":
	    	processTimezoneCreateRequest(req, res, next, user);
	    	break;
	    case "delete":
	    	processTimezoneDeleteRequest(req, res, next, user);
	    	break;
	    case "update":
	    	processTimezoneUpdateRequest(req, res, next, user);
	    	break;
	    default: 
			res.json(501, { statusText: 'Not Implemented'});
	    }
	}
	catch(err) {
		switch (err) {
		case 1:
			res.json(400, { statusText: 'Invalid method'});
			break;
		case 2:
			res.json(401, { statusText: 'Unauthorized'});
			break;
		default:
			res.json(501, { statusText: 'Unknown internal Error'});
		}
	} 
}

/**
 * Process a request for a new user
 * @param req
 * @param res
 * @param next
 */
function processUserNewRequest(req, res, next) {
	if (req.method != 'POST')
		throw 1;
	
	  // Cannot add a user that exists, cannot over write an existing user
	  if (!req.body._id && req.body.email) {
		  req.body.email = req.body.email.toLowerCase();
		  var done = function(err, user) {
			  if (user) {
				  res.json(403, { statusText: 'User already exists'});				  
			  } else {
//	  Map to a mongo proxy friendly url, we are initially going to map like that, might revisit and build it all around
//	  the api. We don't need to know the correct db name, the mongo proxy will fill it in
				  var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
				  req.path = URL;
				  dbProxy(req, res, next);
			  }
		  }
		  dbUtils.findByEmail(req.body.email, function(err, user) {
			    done(err, user);
			  });
	  } else {
		  res.json(403, { statusText: 'Invalid body for new '});
	  }
}

/**
 * List the timezones
 * @param req
 * @param res
 * @param next
 */
function processTimezoneListRequest(req, res, next, user) {
	if (req.method != 'GET')
		throw 1;

	var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
	req.path = URL;
	var subQuery = {};
	subQuery.user_id = user._id.$oid;	
	if (req.query.id)
		subQuery._id = { $oid: req.query.id };
	req.query = { q : JSON.stringify(subQuery) };
	dbProxy(req, res, next);		  
}

/**
 * Create a new timezone document POST request
 */
function processTimezoneCreateRequest(req, res, next, user) {	
	if (req.method != 'POST')
		throw 1;
	
	//don't do a create and pass a document id
	if (!req.query.id) {
		//	patch the userid into the request
		req.body.user_id = user._id.$oid;
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		dbProxy(req, res, next);		  
	} else {
		res.json(403, { statusText: 'Invalid'});
	}
}
/**
 * Delete a document, DELETE request
 * @param req
 * @param res
 * @param next
 */
function processTimezoneDeleteRequest(req, res, next, user) {
	if (req.method != 'DELETE')
		throw 1;

	// We can't use a delete or we delete the document regardless, to qualify the delete with
	// the user id we must use a PUT and qualify $oid and user_id in the query
	// Document id is required and the proxy expects it as req.params[0]
	if (req.query.id) {
		//	patch the userid and oid into the query
		var subQuery = {};
		subQuery.user_id = user._id.$oid;	
		subQuery._id = {};
		subQuery._id.$oid = req.query.id;	
		req.query.q = JSON.stringify(subQuery);
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
//		req.params[0] = '/' + req.query.id; 
		req.path = URL;
		req.method = 'PUT';
		req.body = [];
		dbProxy(req, res, next);		  
	} else {
		res.json(403, { statusText: 'Invalid'});
	}	
}

/**
 * Update a document
 * @param req
 * @param res
 * @param next
 */
function processTimezoneUpdateRequest(req, res, next, user) {
	if (req.method != 'PUT')
		throw 1;

	// Document id is required and the proxy expects it as req.params[0]
	if (req.query.id) {
		//	patch the userid into the request
		req.body.user_id = user._id.$oid;
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		req.params[0] = '/' + req.query.id; 
		dbProxy(req, res, next);		  
	} else {
		res.json(403, { statusText: 'Invalid'});
	}
}

function validateAPIKey(req) {
	if (!security.loginAPI(req.query.APIKEY))
		throw 2;
}

function validateAPIUP(req, res, next, done) {
	security.loginAPIUP(req, res, next, function (user){
		if (user) {
			delete req.query.email;
			delete req.query.password;
		}
		done(user)
	});
}

