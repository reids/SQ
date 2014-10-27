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
	  
	  if (validateUser(req) && !req.body._id && req.body.email) {
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
	if (validateTimezone(req) && !req.query.id) {
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
	if (req.query.id) {
		//	patch the userid and oid into the query
		var subQuery = {};
		subQuery.user_id = user._id.$oid;	
		subQuery._id = {};
		subQuery._id.$oid = req.query.id;	
		req.query.q = JSON.stringify(subQuery);
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		req.method = 'PUT';
        req.headers['Content-Type'] = 'application/json';
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

	// Similar to delete we qualify the update with the $oid and user_id in the query
	if (validateTimezone(req) && req.query.id) {
		//	patch the userid into the request
		req.body.user_id = user._id.$oid;
		//	patch the userid and oid into the query
		var subQuery = {};
		subQuery.user_id = user._id.$oid;	
		subQuery._id = {};
		subQuery._id.$oid = req.query.id;	
		req.query.q = JSON.stringify(subQuery);
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		dbProxy(req, res, next);		  
	} else {
		res.json(403, { statusText: 'Invalid'});
	}
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

// validate there is only a user in the request
var validateUser = function(req) {
	  body=req.body;
	  if (body.email && body.password && body.firstName && body.lastName ) {
		  user = {
			  email: body.email,
			  password: body.password,
			  firstName: body.firstName,
			  lastName: body.lastName				  
		  }
		  req.body = user;
		  return true;
	  } else {
	    return false;
	  }
};

//validate there is only a timezone in the request
var validateTimezone = function(req) {
	  body=req.body;
	  if (body.name && body.city && body.offset && isNumeric(body.offset)) {
		  timezone = {
			  name: body.name,
			  city: body.city,
			  offset: body.offset
		  }
		  req.body = timezone;
		  return true;
	  } else {
	    return false;
	  }
};

function isNumeric(n)
{
    var n2 = n;
    n = parseFloat(n);
    return (n!='NaN' && n2==n);
}