angular.module('classDigApp')
  .directive('customSwitcher', ['$timeout', function ($timeout) {
    return {
      scope: {
        switchValue: "=",
        switchId: "="
      },
      templateUrl: 'scripts/directives/customSwitcher/customSwitcher.html',
      controller: ['$scope','$rootScope', function ($scope, $rootScope) {
        $scope.background = $rootScope.userData.background;
        $scope.changeValue = function (id) {
          if ($scope.switchValue == 1) {

            $("#"+id).attr('checked','checked');
            $scope.switchValue = 0;
          }
          else {
            $("#"+id).attr('checked','none');
            $scope.switchValue = 1;
          }
        };


        $timeout(function () {
          //$scope.switchId = $scope.switchId;
          $scope.changeValue($scope.switchId);
        });


      }]
    }
  }]);
