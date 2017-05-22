angular.module('classDigApp')
  .controller('announcementsModalInstanceCtrl', function ($uibModalInstance, $scope  ,$routeParams, $rootScope,Upload,appSettings,$http, $timeout,$log, items, socket) {
    var $ctrl = this;
    /*$rootScope.postAnnouncement;
      console.log($rootScope.postAnnouncement);*/
    //INIT DEFAULT VALUE

if(items ===undefined){
    $scope.newAnnouncement = {
      'title': '',
      'class_id': $routeParams.classId,
      'description': '',
      'participants': []
    };

  this.modalConstant = {
    header: "Create Announcement",
    buttonSubmit: "ADD ANNOUNCEMENT"
  };
}
else{
  $scope.newAnnouncement = angular.copy(items);
 // $scope.newAnnouncement.class_id = $routeParams.classId;

  this.modalConstant = {
    header: "Update Announcement",
    buttonSubmit: "UPDATE ANNOUNCEMENT"
  };
}
    $scope.createPollModal = true;
    $scope.addVoters = false;

    $scope.addVoteParticipants = function () {
      $scope.createPollModal = true;
      $scope.addVoters = false;
      $scope.userRole = "users";
      $rootScope.$broadcast('userRoleChanged',$scope.userRole);
      var array = $.map($scope.selectedUsers, function(value, index) {
        return [value.id];
      });
      $scope.newAnnouncement.participants = array;
    };

    $scope.cancelVoteParticipants = function(){
      $scope.createPollModal = true;
      $scope.addVoters = false;
    };

    $scope.showParticipantsList = function () {
      $scope.createPollModal =false;
      $scope.addVoters = true;
    };

    $scope.userRole = "users";

    $ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.ok = function () {
      if(items===undefined){
      $http({
        url: appSettings.link + 'announcement',
        method: "POST",
        data: $scope.newAnnouncement
      })
        .then(function (response) {
                $http({
                    url: appSettings.link + 'newactivity',
                    method: "POST",
                    data: {'user_id': $scope.user.user_id, 'type': 'story', 'data':  $scope.newAnnouncement}
                }).then(function (data) {
                    console.log(data);
                });

            $rootScope.$broadcast('createAnnouncement', $scope.newAnnouncement);
            $uibModalInstance.close();
            socket.io.emit('newActivity', $scope.newAnnouncement);
            console.log('newActivity-announcement')
          },
          function (response) {
            $scope.formSubmitted = true;
          });
     }
     else{
       if($scope.newAnnouncement.participants[0].id){
         var arrayOfId = [];
         for(var i=0;i<$scope.newAnnouncement.participants.length;i++){
           arrayOfId.push($scope.newAnnouncement.participants[i].id)
         }
         $scope.newAnnouncement.participants = arrayOfId;
       }
        $http({
          url: appSettings.link + 'announcement/'+$scope.newAnnouncement.id,
          method: "PUT",
          data: $scope.newAnnouncement

        })
          .then(function (response) {
              $uibModalInstance.close();
              $rootScope.$broadcast('announcement-changed')
            },
            function (response) {
              $scope.formSubmitted = true;
            });
      }


    }
  });

