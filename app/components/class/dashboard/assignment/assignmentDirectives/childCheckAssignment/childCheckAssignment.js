angular.module('classDigApp')
  .directive('childCheckAssignment', ['$timeout', function ($timeout) {
    return {
      scope: {
        membersArray: "=",
        fileArray:"="
      },
      templateUrl: 'components/class/dashboard/assignment/assignmentDirectives/childCheckAssignment/childCheckAssignment.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {
        $scope.role = $rootScope.userData.role;
         //console.log($scope.fileArray);
        $scope.checkChildSubmitAssignment = function(member){
          var show=false;
          for(var i=0;i<$scope.fileArray.length;i++){
            if ($scope.fileArray[i].id===member.id && $scope.fileArray[i].files.length>0 ){
              show = true;
            }
          }
          return show
        };
        $scope.background = $rootScope.userData.background;
        $timeout(function () {
        });


      }]
    }
  }]);
