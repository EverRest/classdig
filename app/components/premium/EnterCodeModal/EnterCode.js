angular.module('classDigApp')
  .controller('enterCodeInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_,$location) {
    var $ctrl = this;
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      if(valid){
        return false
      }
      else{

        $http({
          url: appSettings.link + 'payments/check-code',
          method: "POST",
          data: {"code": $scope.premiumCode}
        })
          .then(function (response) {
              $uibModalInstance.dismiss('cancel');
              $location.path('/classes');
            },
            function (response) {
              $scope.showErrorMessage= true;
              $scope.errorMessage = 'The selected code is invalid.'
            });
      }
    };
  });
