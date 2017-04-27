angular.module('classDigApp')
  .directive('arrayofMembers', ['$timeout', function ($timeout) {
    return {
      scope: {
        membersArray: "="
      },
      templateUrl: 'scripts/directives/arrayOfMembers/arrayOfMembers.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {

        $scope.background = $rootScope.userData.background;
        $timeout(function () {
        });


      }]
    }
  }]);
