angular.module('admin-timezones', [
  'resources.timezones',
  'services.crud',
  'security.authorization',
  'security.service'
])

.config(['crudRouteProvider', 'securityAuthorizationProvider', function (crudRouteProvider, securityAuthorizationProvider) {

    this.$get = angular.noop;

  crudRouteProvider.routesFor('Timezones', 'admin')
    .whenList({
      timezones: ['Timezones', 'security', function(Timezones, security) { 
    	  var promise = security.requestCurrentUser();
    	  return promise.then(function(currentUser) {
    		  return Timezones.forUser(currentUser);	    		  
    	  })
   	  }],
      adminUser: securityAuthorizationProvider.requireAuthenticatedUser,
    })
    .whenNew({
      timezone: ['Timezones', function(Timezones) { return new Timezones(); }],
      adminUser: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .whenEdit({
      timezone: ['Timezones', '$route', function(Timezones, $route) { return Timezones.getById($route.current.params.itemId); }],
      adminUser: securityAuthorizationProvider.requireAuthenticatedUser
    });
}])

.controller('TimezonesListCtrl', ['$scope', '$interval', 'crudListMethods', 'timezones', function($scope, $interval, crudListMethods, timezones) {
  $scope.timezones = timezones;
	  
  $scope.currtimes = [];
  
  var tick = function() {
    angular.forEach($scope.timezones, function(timezone) {
	    $scope.currtimes[timezone.$id()] = moment().zone(timezone.offset * -60).format('HH:mm:ss');
  	  });
  }
  
  tick();
  $interval(tick, 1000);
  angular.extend($scope, crudListMethods('/admin/timezones'));
}])

.controller('TimezonesEditCtrl', ['$scope', '$location', 'i18nNotifications', 'timezone', 'security', function($scope, $location, i18nNotifications, timezone, security) {

  timezone.user_id=security.currentUser.id;

  $scope.timezone = timezone;

  $scope.onSave = function(timezone) {
    i18nNotifications.pushForNextRoute('crud.timezone.save.success', 'success', {name : timezone.name});
    $location.path('/admin/timezones');
  };

  $scope.onError = function() {
    i18nNotifications.pushForCurrentRoute('crud.timezone.save.error', 'error');
  };

}]);