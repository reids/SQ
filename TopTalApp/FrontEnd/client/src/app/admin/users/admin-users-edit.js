angular.module('admin-users-edit',[
  'services.crud',
  'services.i18nNotifications',
  'admin-users-edit-validateEquals'
])

.controller('UsersEditCtrl', ['$scope', '$location', 'i18nNotifications', 'user', function ($scope, $location, i18nNotifications, user) {

  $scope.user = user;
  $scope.password = user.password;

  $scope.onSave = function (user) {
    i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', {email : user.email});
    $location.path('/dashboard');
  };

  $scope.onError = function(statusText) {
    i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error', {statusText : statusText });
  };

  $scope.emailToLower = function() {
	  $scope.user.email = angular.lowercase($scope.user.email);
  };

}]);