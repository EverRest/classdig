angular.module('classDigApp')
  .controller('enterEmailGradeCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.exportGrade = items;


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      if(valid){
        return
      }

      $http({
        url: appSettings.link+ 'class/export-grades' ,
        method: "POST",
        data:$scope.exportGrade
      })
        .then(function (response) {
          $scope.codeWasSend = true;
          //$uibModalInstance.close();

          },
          function (response) {
            $scope.showErrorMessage = true;
            $scope.errorMessage = response.data.message;
          });

    };
  });
