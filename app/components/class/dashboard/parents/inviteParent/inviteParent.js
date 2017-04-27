angular.module('classDigApp')
  .controller('inviteParentModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.currentUser = items;
      //$scope.parentEmail =angular.copy(items);
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      if(valid){
        return
      }
      $scope.inviteParent = {
        'id': $routeParams.classId,
        'email': $scope.inviteParentEmail,
        'code':$rootScope.user.classData.code,
        'class_name':$rootScope.user.classData.name,
        'student_id':$scope.currentUser.id
      };
        $http({
          url: appSettings.link + 'class/'+$routeParams.classId+'/parent/invitation',
          method: "POST",
          data: $scope.inviteParent
        })
          .then(function (response) {
              $uibModalInstance.close();
            },
            function (response) {
              $scope.ExamServerError = true;
            });

    };
  });
