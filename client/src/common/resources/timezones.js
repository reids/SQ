angular.module('resources.timezones', [ 'mongolabResource' ]);

//angular.module('resources.timezones').service('Timezones',
//		[ 'mongolabResource', function(mongolabResource) {
//
//			var Timezones = mongolabResource('timezones');
//			return Timezones;
//}]);

angular.module('resources.timezones').factory('Timezones',
		[ 'mongolabResource', function($mongolabResource) {

			var Timezones = $mongolabResource('timezones');
			return Timezones;
}]);
