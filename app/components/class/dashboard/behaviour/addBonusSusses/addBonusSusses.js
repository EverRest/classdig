angular.module('classDigApp')
  .controller('addBonusSussesController', function ($uibModalInstance,$scope, $rootScope, information) {

    $scope.information = angular.copy(information);
    $scope.userData = {
      'iconAddFile': 'images/files-library/icon-addfile-' + $rootScope.user.data.role + '.svg',
      'iconCreateFolder': 'images/files-library/icon-createfolder-' + $rootScope.user.data.role + '.svg',
      'iconFolder': 'images/files-library/icon-folder-' + $rootScope.user.data.role + '.svg',
      'iconArrowBack': 'images/files-library/icon-arrow-back-' + $rootScope.user.data.role + '.svg',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'background': $rootScope.user.data.role + '-background',
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png'
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });

