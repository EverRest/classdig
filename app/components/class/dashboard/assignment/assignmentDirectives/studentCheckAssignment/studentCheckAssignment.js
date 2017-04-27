angular.module('classDigApp')
  .directive('studentCheckAssignment', ['$timeout', function ($timeout) {
    return {
      scope: {
        membersArray: "=",
        fileArray:"=",
        fontColor: "="
      },
      templateUrl: 'components/class/dashboard/assignment/assignmentDirectives/studentCheckAssignment/studentCheckAssignment.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {
        $scope.role = $rootScope.userData.role;
        $scope.currentId = $rootScope.user.data.id;
        //console.log($scope.currentId);
         //console.log($scope.fileArray);


        $scope.checkSubmitAssignment = function(){
          $scope.submittedArray=0;
          for(var i=0;i<$scope.fileArray.length;i++){
            if ($scope.fileArray[i].submission===1 && $scope.fileArray[i].id !== $scope.currentId){
              $scope.submittedArray++;
            }
          }
          return $scope.submittedArray
        };

        $scope.checkNotSubmitAssignment = function(){
          $scope.notsubmittedArray = 0;
          for(var i=0;i<$scope.fileArray.length;i++){
            if ($scope.fileArray[i].submission===0 && $scope.fileArray[i].id !== $scope.currentId){
              $scope.notsubmittedArray++;
            }
          }
          return $scope.notsubmittedArray
        };

        $scope.background = $rootScope.userData.background;
        $timeout(function () {
        });
      }]
    }
  }]);
