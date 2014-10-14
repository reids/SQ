angular.module('resources.timezones', [ 'mongolabResource' ]);

//angular.module('resources.timezones').service('Timezones',
//		[ 'mongolabResource', function(mongolabResource) {
//
//			var Timezones = mongolabResource('timezones');
//			return Timezones;
//}]);

angular.module('resources.timezones').factory('Timezones',
		[ 'mongolabResource', function($mongolabResource) {

// Only want the timezones associated with the currently logged in user			
			var Timezones = $mongolabResource('timezones');
			Timezones.forUser = function(user) {
				return Timezones.query({user_id:user.id})
			};
			return Timezones;
}]);
