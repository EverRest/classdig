angular.module('classDigApp')
  .controller('createNewDiscussion', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, Upload, $routeParams) {

    $scope.newDiscussion = {
      "group_id" : $routeParams.groupId
    };

    // $rootScope.user.pickedGroup.participants.length

    // console.log($rootScope.user.pickedGroup.participants.length);
    if($rootScope.user.pickedGroup.participants.length <= 2){
      $scope.notEnoughusers = true;
    } else  $scope.notEnoughUsers = false;

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.createDiscussion = function () {
      $http.post('http://api.classdig.oyihost.com/group/discussion', $scope.newDiscussion)
      // $http.post('http://loc.classdig.com/group/discussion', $scope.newDiscussion)
        .success(function (response) {
            $log.log(response.data);
            $scope.discussionCreated = true;
            $rootScope.$broadcast('new-discussion-created', response.data);
            $uibModalInstance.dismiss('cancel');
          },
          function (error) {
            $scope.errorMessage = error.data.message;
            $scope.showErrorMessage = true;
            $log.log(error.data.message);
          });
    };
  });
