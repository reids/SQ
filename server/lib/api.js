/**
 * options to massage API urls into DB urls
 */
module.exports = function(mongoProxy, utils) {
	
var dbProxy = mongoProxy;
var dbUtils = utils;

var apiRequest = function(req, res, next) {
		  console.log (" API request for " + req.params.object, req.params.action, req.params.id);
		  if (req.params.collection == "users" && req.params.action == "new") {
			  if (req.body.email) {
				  var done = function(err, user) {
					  if (err || !user) {
						  res.json(403, 'User exists');				  
					  } else {
//			  Map to a mongo proxy friendly url, we are initially going to map like that, might revisit abd build it all around
//			  the api. We don't need to know the correct db name, the mongo proxy will fill it in
						  var URL = '/databases/' + 'dummydb' + '/collections/' + req.params.collection;
						  req.path = URL;
						  dbProxy(req, res, next);
					  }
				  }
				  dbUtils.findByEmail(req.body.email, function(err, user) {
					    done(err, user);
					  });
			  }
		  } else
			  res.json(400, 'Unauthorised ');
	  };

	  
    return apiRequest;
};
