/**
 * support to massage API urls into DB urls The rest API is modelled on MongoDB in that it is considered
 * to be authenticated to do anything if the API key is valid. The API is more or less a proxy to the mongo
 * db just presenting an alternative flavour and some validations
 */
module.exports = function(mongoProxy, utils, securityhandler) {
	
	dbProxy = mongoProxy;
	dbUtils = utils;
	security = securityhandler;

	var apiRequest = function(req, res, next) {
		console.log (" API request for " + req.params.object, req.params.action, req.params.id);
			  
		switch (req.params.collection) {
		case "users":
			processUserRequest(req, res, next);
			break;
		case "timezones":
			processTimezoneRequest(req, res, next);
			break;
		default:
			res.json(501, 'Not Implemented ');
		}
	};

    return apiRequest;
};

function processUserRequest(req, res, next) {
    switch (req.params.action) {
    case "new":
    	processUserNewRequest(req, res, next);
    	break;
//Login removed we are using the mongo DB mechanism ie superuser API key     	
//    case "login":
//    	processUserLoginRequest(req, res, next);
//    	break;
    default:
		  res.json(501, 'Not Implemented ');
    }
		  
}

function processTimezoneRequest(req, res, next) {
    switch (req.params.action) {
    case "list":
    	processTimezoneListRequest(req, res, next);
    	break;
    case "create":
    	processTimezoneCreateRequest(req, res, next);
    	break;
    case "delete":
    	processTimezoneDeleteRequest(req, res, next);
    	break;
    case "update":
    	processTimezoneUpdateRequest(req, res, next);
    	break;
    default:
		  res.json(501, 'Not Implemented ');
    }
}

/**
 * Process a request for a new user
 * @param req
 * @param res
 * @param next
 */
function processUserNewRequest(req, res, next) {
	  // Cannot add a user that exists, cannot over write an existing user
	  if (!req.body._id && req.body.email) {
		  var done = function(err, user) {
			  if (err || !user) {
				  res.json(403, 'User exists');				  
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
		  res.json(403, 'Invalid body for new ');
	  }
}

/**
 * Login a user and return the user token
 * @param req
 * @param res
 * @param next
 */
function processUserLoginRequest(req, res, next) {
	security.login(req, res, next);
}

/**
 * List the timezones
 * @param req
 * @param res
 * @param next
 */
function processTimezoneListRequest(req, res, next) {
	
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		if (req.query.user_id) {
			var subQuery = { user_id : req.body.user_id };
			req.query = { q : JSON.stringify(subQuery) };
		}
		dbProxy(req, res, next);		  
}

function processTimezoneCreateRequest(req, res, next) {	

	// Need to have no documentid and a valid user id
//	TODO
	
	//don't do a create and pass a document id
	if (!req.query.id) {
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		dbProxy(req, res, next);		  
	} else {
		res.json(403, 'Invalid');
	}
}
/**
 * Delete a document, DELETE request
 * @param req
 * @param res
 * @param next
 */
function processTimezoneDeleteRequest(req, res, next) {
	
	// Document id is required and the proxy expects it as req.params[0]
	if (req.query.id) {
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.params[0] = '/' + req.query.id; 
		req.path = URL;
		req.body = [];
		dbProxy(req, res, next);		  
	} else {
		res.json(403, 'Invalid');
	}	
}

/**
 * Update a document
 * @param req
 * @param res
 * @param next
 */
function processTimezoneUpdateRequest(req, res, next) {
	
	// Document id is required and the proxy expects it as req.params[0]
	if (req.query.id) {
		var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
		req.path = URL;
		req.params[0] = '/' + req.query.id; 
		dbProxy(req, res, next);		  
	} else {
		res.json(403, 'Invalid');
	}
}
