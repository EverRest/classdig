angular.module('classDigApp')
  .directive('chooseUserRole', ['$timeout', function ($timeout) {
    return {
      // scope: {
      //     userRole:"="
      // },
      templateUrl: 'scripts/directives/chooseUserRole/chooseUserRole.html',
      controller: ['$scope','$rootScope', function ($scope, $rootScope, $routeParams) {
        $scope.selectRole = function (role) {
          $scope.selectedRole = role;
          $scope.userRole = role;
          $rootScope.$broadcast('userRoleChanged',$scope.userRole);
          //$scope.users.nextPage($routeParams.classId, role);
        };

        $scope.selectRole($scope.userRole);
        if($rootScope.userData.role =='teacher'){
          $scope.roles = [
            {id: 'student', description: 'Students', url: 'users'},
            {id: 'parent', description: 'Parents', url: 'parents'}
          ];
        }
       else{
          $scope.roles = [
            {id: 'student', description: 'Students', url: 'users'}
          ];
        }


      }]
    }
  }]);
