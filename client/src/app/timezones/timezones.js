angular.module('timezones', ['resources.timezones', 'security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	  $routeProvider.when('/timezones', {
	    templateUrl:'timezones/timezones-list.tpl.html',
	    controller:'TimezonesViewCtrl',
	    resolve:{
	      timezones:['Timezones', 'security', function (Timezones, security) {
	        return Timezones.forUser(security.currentUser);
	      }],
	      authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
	    }
	  });
	}])

.controller('TimezonesViewCtrl', ['$scope', '$timeout', '$location', 'timezones', 'security', function ($scope, $timeout, $location, timezones, security) {
  $scope.timezones = timezones;

  $scope.currtimes = [];
  
  $scope.currenttime = moment.tz('').format('HH:mm:ss');
  angular.forEach($scope.timezones, function(timezone) {
	    $scope.currtimes[timezone.$id()] = moment.tz(timezone.name).format('HH:mm:ss');
	  });
  
  var tick = function() {
    $scope.currenttime = moment.tz('').format('HH:mm:ss');
    angular.forEach($scope.timezones, function(timezone) {
	    $scope.currtimes[timezone.$id()] = moment.tz(timezone.name).format('HH:mm:ss');
  	  });
	$timeout(tick, 1000);
  }
	
  tick();

  $scope.viewTimezone = function (timezone) {
    $location.path('/timezones/'+timezone.$id());
  };

  $scope.edit = function (timezone) {
    $location.path('/timezones/'+timezone.$id()+'/edit');
  };

  $scope.remove = function (timezone) {
    $location.path('/timezones/'+timezone.$id()+'/remove');
  };

}]);
