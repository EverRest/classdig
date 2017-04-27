angular.module('classDigApp')
  .controller('confirmationModalController', function ($uibModalInstance,$scope, items) {
    if(items) {
      $scope.message = items;
    }
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
