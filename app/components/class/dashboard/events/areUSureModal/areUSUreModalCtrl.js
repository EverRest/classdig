angular.module('classDigApp')

  .controller('areUSureModalEventsCtrl',
    function ($scope, $rootScope, $http, $log, $routeParams, $uibModalInstance, appSettings, items) {
    var $ctrl = this;
    $ctrl.items = items;

    $ctrl.approveStatus = false;

    $uibModalInstance.closed.then(function() {
      if($ctrl.approveStatus) {
        $rootScope.$broadcast('delete-was-approved',  $ctrl.items);
      } else {
        $rootScope.$broadcast('delete-was-not-approved');
      }
    });

    $ctrl.approve = function () {
      $ctrl.approveStatus = true;
      $uibModalInstance.close();
    };
    $ctrl.cancel = function () {
      $ctrl.approveStatus = false;
      $uibModalInstance.close();
    }
  });

