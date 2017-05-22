app.controller('findPeopleController', ['$scope',
  '$rootScope',
  '$http',
  '$resource',
  '$location',
  '$uibModal',
  'AuthenticationService',
  'ClassFactory',
  'appSettings',
  'classData',
  '$timeout',
  'DeletedClasses',
  'CurrentClasses',
  '$q',
  '_',
  'Upload',
  'Feed',
  'uiCalendarConfig',
  'socket',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed,uiCalendarConfig, socket) {
    var $ctrl = this;
    $ctrl.animationsEnabled = true;
    var role =$rootScope.user.data.role;
    $scope.userData ={
      'color':role+'-color',
      'border' : role+'-border',
      'background' : role+'-background',
      'userPhotoBorder': $rootScope.user.data.role + '-userPhotoBorder'
    };
    $http({
      url: appSettings.link + 'users/school',
      method: "GET"
      // headers: {'Content-Type': 'application/json'}
    })
      .then(function (response) {
        //console.log(appSettings.link + 'users/school');
          $scope.listOfTheSameSchoolPeople = response.data.data;
          $scope.list_title = 'PEOPLE IN THE SAME SCHOOL'
        },
        function (response) {
        });

      $rootScope.activeUserId;
      $rootScope.activeUser;
      $rootScope.feedUrl;
      $rootScope.activitiesBlock = true;
      //$rootScope.showActivitiesFindPeople=true;

      $scope.activateUser = function (user) {
          if($scope.activeUserId === user.id){
              $rootScope.activeUserId = undefined;
           }
        else {
              $rootScope.activeUserId = user.id;
              $rootScope.activeUser = user;
              $rootScope.feedUrl = appSettings.link+'story/'+ user.id;
              if (user.hasOwnProperty('id')) {
                  $rootScope.refreshFollowersList(user.id);
                  $rootScope.refreshFollowList(user.id);
              }
              if (user.hasOwnProperty('user_id')) {
                  $rootScope.refreshFollowersList(user.user_id);
                  $rootScope.refreshFollowList(user.user_id);
              }
            }
        };

      $rootScope.$on("activateUser", function(){
          $scope.activateUser();
      });

      $scope.followUser = function (method,user,index) {
      $http({
        url: appSettings.link + 'follow/'+ user.id,
        method: method,
        headers: {'Content-Type': 'application/json'}
      })
        .then(function (response) {
                $http({
                    url: appSettings.link + 'newactivity',
                    method: "POST",
                    data: {'user_id': $scope.user.user_id, 'type': 'story', 'data': user}
                }).then(function (data) {
                    console.log(data);
                });

                socket.io.emit('newActivity', user);
                console.log('new Activity - new follow');
            $scope.listOfTheSameSchoolPeople[index].is_follow=!$scope.listOfTheSameSchoolPeople[index].is_follow;
          },
          function (response) {

          });
    };

    $rootScope.$on('detailedSearch',function (ev,data) {
      $scope.listOfTheSameSchoolPeople=data;

      $scope.activeUserId=undefined;
      $scope.list_title='SEARCH RESULT';
    });

    $scope.openFindModal = function () {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'components/findPeople/findPeopleModal/findPeopleModal.html',
        controller: 'findPeopleModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: 'sm',
        resolve: {
          items: function () {
            return $rootScope.user.data.details.data;
          }
        }
      });
    };

    var href = window.location.href,
        res = href.split('/');
    if(res.length > 0) {
     if (res[4] == "findPeople") {
      angular.element(document).find(".class-menu-item-block-right-profile").addClass("profilepage");
     }
    } else {
      console.log('href error');
    }





  }]);


