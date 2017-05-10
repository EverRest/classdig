angular.module('classDigApp')
  .controller('joinGroupByCodeModalInstance', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, Upload, $routeParams) {


    $uibModalInstance.opened.then(function() {
      $rootScope.$broadcast('action-was-not-approved');
    });


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.join = function () {
      $log.log($scope.code);
      $http({
             url: 'http://api.classdig.oyihost.com/group/join/' + $scope.code,
            // url: 'http://loc.classdig.com' + $scope.code,
            method: 'GET'
          })
            .then(function (response) {
                $log.log(response.data);
                $scope.codeWasSend = true;
                // $rootScope.$broadcast('groups-have-to-be-reloaded');
              },
              function (error) {
                $scope.errorMessage = error.data.message;
                $scope.showErrorMessage = true;
                $log.log(error.data.message);
              });
    };
  });
