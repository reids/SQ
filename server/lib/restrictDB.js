/**
 * ExpressJS middleware to restrict DB access to the DB from the client side
 */
module.exports = function(utils) {

	dbUtils = utils;
	
	var restrictDB = function(req, res, next) {
		
		var subQuery;
			
	    if (req.isAuthenticated()) {
	    	// If authenticated then DB access must include the userid, so add it
	    	if (req.params.collection == 'timezones') {
				subQuery = { user_id : getuserId(req.user) };
			} else if (req.params.collection == 'users') {
				subQuery = { _id : { $oid : getuserId(req.user) } };
			}
			req.query = { q : JSON.stringify(subQuery) };
			next();
	    } else {    	
	    	if (req.params.collection == 'users') {
	    		checkUnauthenticatedUserRequest(req, res, next);
	    	} else
	    		res.json(401, { statusText: 'Unauthorised'});

	    }
	};

	return restrictDB;
};

var getuserId = function(user) {
  if ( user ) {
    return user._id.$oid;
  } else {
    return null;
  }
};

function checkUnauthenticatedUserRequest(req, res, next) {

	switch (req.method) {
	case 'POST':
		  // Cannot add a user that exists, cannot over write an existing user
		  if (!req.body._id && req.body.email) {
			  req.body.email = req.body.email.toLowerCase();
			  var done = function(err, user) {
				  if (user) {
					  res.json(403, { statusText: 'User already exists'});				  
				  } else {
					  next();
				  }
			  }
			  dbUtils.findByEmail(req.body.email, function(err, user) {
				    done(err, user);
				  });
		  } else
				res.json(401, { statusText: 'Unauthorised'});
		break;
// Unauthorised get is required for the uniqueEmail check
// Decided to implement that by returning an error at new user create time. This is a security hole otherwise		
//	case 'GET':
//		// will only return email address
//		req.query.f =  JSON.stringify({ email : 1});
//		next();
//		break;
	default:
		res.json(401, 'Unauthorised');
	}
};
