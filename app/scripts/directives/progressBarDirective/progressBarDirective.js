angular.module('classDigApp')

  .directive('progressBar',[function ($scope, $rootScope) {
    return{
      scope:{
        progressNumber: "=progressNumber",
        currentText: "="
      },
      templateUrl: 'scripts/directives/progressBarDirective/progressBarDirective.html',
      controller:['$scope','$rootScope', function($scope, $rootScope ){
        $scope.background = $rootScope.userData.background;
       ;
      }]
    }

  }]);
