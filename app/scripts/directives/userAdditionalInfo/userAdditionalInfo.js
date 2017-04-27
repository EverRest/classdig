angular.module('classDigApp')
  .directive('userAdditionalInfo', [function () {
    return {
      scope: {
        userInformation: "="
      },
      templateUrl: 'scripts/directives/userAdditionalInfo/userAdditionalInfoTemplate.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q) {
              }]
    }
  }]);
