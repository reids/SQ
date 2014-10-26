var api = require('../api');

exports.addRoutes = function(app, dbProxy, dbUtils, security) {

app.namespace('/api/*', function() {
	
	app.all('/:collection/:action?*', api(dbProxy, dbUtils, security));
		
	app.all('/', function(req, res, next) {
		console.log("API request");
		next();
	})
});
	
};

