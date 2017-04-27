angular.module('classDigApp')
  .controller('markAssignmentModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.AssignmentServerError = false;

    $scope.currentStudent = items;

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
      $uibModalInstance.close();
      // if(items === undefined) {
      //   $http({
      //     url: appSettings.link + 'assignment/'+$rootScope.user.data.id + '/user',
      //     method: "PATCH",
      //     data: $scope.assignmentSubmit
      //   })
      //     .then(function (response) {
      //         console.log($scope.assignmentSubmit);
      //         $uibModalInstance.close();
      //         $rootScope.$broadcast('submitAssignmentByStudent', 'Update Submit');
      //       },
      //       function (response) {
      //         $scope.AssignmentServerError = true;
      //       });
      // }

    };
  });
