angular.module('classDigApp')
  .directive('whenseeResults', ['$timeout', function ($timeout) {
    return {
      scope: {
        resultId: "="
      },
      templateUrl: 'components/class/dashboard/polls/pollsModal/CreatePollsDirectives/whenSeeVoterResults/whenSeeVoterResults.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {

        $scope.iconFlash = 'images/poll/icon-flash.png';
        $scope.iconClock = 'images/poll/icon-clock.png';
        $scope.iconExit =  'images/poll/icon-exit.png';

      }]
    }
  }]);
