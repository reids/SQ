/**
 * ExpressJS middleware to restrict DB access to the authenticated user where appropriate
 */
var getuserId = function(user) {
  if ( user ) {
    return user._id.$oid;
  } else {
    return null;
  }
};


var restrictDB = function(req, res, next) {
	
	var subQuery;
		
    if (req.isAuthenticated()) {
    	// If authenticated then DB access must include the userid
    	if (req.params.collection == 'timezones') {
			subQuery = { user_id : getuserId(req.user) };
		} else if (req.params.collection == 'users') {
			subQuery = { _id : { $oid : getuserId(req.user) } };
		}
		req.query = { q : JSON.stringify(subQuery) };
		next();
    } else {
		// If not authenticated then you can only post to the user collection, and with no id set
    	if (req.params.collection == 'users') {
    		if (!req.query.q && !req.put.params[_id])
    			next();
    	} else {
    		res.json(401, 'Unauthorised');
    	}
    }
  };

module.exports = restrictDB;