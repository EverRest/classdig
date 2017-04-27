angular.module('classDigApp')
  .directive('seeResults', ['$timeout', function ($timeout) {
    return {
      scope: {
        resultId: "="
      },
      templateUrl: 'components/class/dashboard/polls/pollsModal/CreatePollsDirectives/seeVoterResults/seeVoterResults.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {
        $scope.see_result_id =['1','2','3'] ;

        $scope.color = $rootScope.userData.color;
        $scope.border = $rootScope.userData.border;
        $scope.background = $rootScope.userData.background;

        $scope.iconFlash =$rootScope.userData.iconFlash;
        $scope.iconClock = $rootScope.userData.iconClock;
        $scope.iconExit = $rootScope.userData.iconExit;

        $scope.FlashActive = $rootScope.userData.iconFlashActive;
        $scope.iconClockActive = $rootScope.userData.iconClockActive;
        $scope.iconExitActive = $rootScope.userData.iconExitActive;


        $scope.initPictures = function(id){
          $('#img-1').attr('src', $scope.iconFlash);
          $('#img-2').attr('src', $scope.iconClock);
          $('#img-3').attr('src', $scope.iconExit);
          $('#img-1-text').removeClass($scope.color);
          $('#img-2-text').removeClass($scope.color);
          $('#img-3-text').removeClass($scope.color);
          $scope.resultId = id;
          switch(id) {
            case '1':
              $('#img-1').attr('src', $scope.FlashActive);
              $('#img-1-text').addClass($scope.color);
              break;
            case '2':
              $('#img-2').attr('src', $scope.iconClockActive);
              $('#img-2-text').addClass($scope.color);
              break;
            case '3':
              $('#img-3').attr('src', $scope.iconExitActive);
              $('#img-3-text').addClass($scope.color);
              break;
            default:
              $('#img-1').attr('src', $scope.iconFlashActive);
              $('#img-1-text').addClass($scope.color);
          }
        };

        $timeout(function () {
          $scope.initPictures ($scope.resultId);
        });

        //////////////

      }]
    }
  }]);
