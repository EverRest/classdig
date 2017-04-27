angular.module('classDigApp')
  .directive('settingsClassList', [function () {
    return {
      scope: {
        classList: "=",
        classIdForGradableItems:"="
      },
      templateUrl: 'scripts/directives/settingsClassList/settingsClassList.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q) {
        $scope.selectClass = function (myClass) {
          $scope.classIdForGradableItems = myClass.id;
        }
      }]
    }
  }]);
