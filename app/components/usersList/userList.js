var app = angular.module("classDigApp");

app.directive('pickStudents', [function(){
    return {
      templateUrl: 'components/usersList/userList.html',
        controller: ['$scope', '$http', '$rootScope', 'classData', '$routeParams', '$timeout', function($scope, $http, $rootScope, classData, $routeParams, $timeout){

          $scope.propertyName = 'first_name';

          $scope.userData ={
            'userListBorder': $rootScope.user.data.role + '-userListBorder'
          };
            $scope.pickStudent = function(student){
              student.state = !student.state;
              if(student.state === true){
                $scope.pickedStudents.push(student);
                  if($scope.attendanceViewIsActive)  $rootScope.$broadcast("student-was-selected-in-attendance", student);
                  if($scope.studentsViewIsActive)  $rootScope.$broadcast("student-was-selected-in-students", student);
                } else {
                  for(var i = 0; i <$scope.pickedStudents.length; i++){
                    if($scope.pickedStudents[i].state === false){
                      $scope.pickedStudents.splice(i, 1)
                    }
                  }
                }
              if($scope.behaviourViewIsActive)  $rootScope.$broadcast("student-was-selected-in-behaviour", student);
              if($scope.studentsViewIsActive)  $rootScope.$broadcast("student-was-selected-in-students-all", student);
              if($scope.distingushedViewIsActive)  $rootScope.$broadcast("student-was-selected-in-distinguished-all", student);
            };

            $rootScope.$on("sort-by-changed", function (event, param, sort) {
              $scope.propertyName = param;
              if(sort == 0) {
                $scope.sorting = false;
              } else {
                $scope.sorting = true;
              }
            });

          $rootScope.$on("display-mode-changed", function (event, param) {
            $scope.displayMode = param;
          });
        }]
    }
}]);
