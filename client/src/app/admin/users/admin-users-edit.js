angular.module('admin-users-edit',[
  'services.crud',
  'services.i18nNotifications',
  'admin-users-edit-uniqueEmail',
  'admin-users-edit-validateEquals'
])

.controller('UsersEditCtrl', ['$scope', '$location', 'i18nNotifications', 'user', function ($scope, $location, i18nNotifications, user) {

  user.admin=true;
  $scope.user = user;
  $scope.password = user.password;

  $scope.onSave = function (user) {
    i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', {id : user.$id()});
    $location.path('/dashboard');
  };

  $scope.onError = function() {
    i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error');
  };

}]);