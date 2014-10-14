angular.module('dashboard', ['security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	  $routeProvider.when('/dashboard', {
	    templateUrl:'dashboard/dashboard.tpl.html',
	    controller:'DashboardCtrl',
	    resolve:{
//	    	userInfo: security.requestCurrentUser().then(function(userInfo) {
//	    		return userInfo;
//	          })
	    }
	  });
	}])
  
	
.controller('DashboardCtrl', ['$scope', '$location', 'security', function ($scope, $location, security) {
  
    security.requestCurrentUser().then(function(userInfo) {
        if ( security.isAuthenticated() ) {
            $location.path('/timezones');
        } else {
            $location.path('/dashboard');
        }
      });

}])

.run(['security', function(security) {
	  // Get the current user when the application starts
	  // (in case they are still logged in from a previous session)
	  security.requestCurrentUser();
}]);
