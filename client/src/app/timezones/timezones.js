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
  $scope.alltimezones = timezones;

  $scope.currtimes = [];
  
  $scope.currenttime = moment().format('HH:mm:ss');
  angular.forEach($scope.timezones, function(timezone) {
	    $scope.currtimes[timezone.$id()] = moment().zone(timezone.offset * -60).format('HH:mm:ss');
	  });
  
  var tick = function() {
    $scope.currenttime = moment().format('HH:mm:ss');
    angular.forEach($scope.timezones, function(timezone) {
	    $scope.currtimes[timezone.$id()] = moment().zone(timezone.offset * -60).format('HH:mm:ss');
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

  $scope.filter = function () {
	  // Do we want to filter the timezones by name?
		  
		  try {
			  if ($scope.filterregexp) {
                var timezones = [];
			    var re = new RegExp($scope.filterregexp, 'i');
			    angular.forEach($scope.alltimezones, function(timezone) {
			    	if (timezone.name.match(re)) {
			    		timezones.push(timezone);  
			    	}
			    });
			    $scope.timezones = timezones;
     		  } else
			    $scope.timezones = $scope.alltimezones;
			}
            $scope.regExpErr = false;
			catch(err) {
				$scope.regExpErr = true;
			}
  };
	 
}]);
