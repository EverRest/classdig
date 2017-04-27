angular.module('classDigApp')
  .controller('enterEmailCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_,classId) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.exportClass = items;


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      if(valid){
        return
      }

      $scope.codeWasSend = true;
      $http({

        url: appSettings.link+ 'class/export' ,
        method: "POST",
        data:$scope.exportClass
      })
        .then(function (response) {

          $rootScope.$broadcast('class-was-exported');
          // $uibModalInstance.close();

          },
          function (response) {
            scope.showErrorMessage = true;
            $scope.errorMessage = response.data.message;

          });

    };
  });
