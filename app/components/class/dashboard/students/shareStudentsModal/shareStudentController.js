angular.module('classDigApp')
  .controller('shareStudentsController', function ($uibModalInstance, $rootScope,  items, $timeout, $http, appSettings, $log, $scope,Upload, $routeParams,localStorageService) {

    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png',
      'arrow' : 'images/distinguished/icon-arrow-' + $rootScope.user.data.role + '_3x.png'
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
      $rootScope.$broadcast('action-was-not-approved');
    };

    $scope.shareStudents = function () {
      $rootScope.$broadcast('share-students', $scope.mail);
      $uibModalInstance.close();
    }

  })
;

