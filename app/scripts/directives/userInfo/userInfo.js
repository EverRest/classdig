angular.module('classDigApp')
  .directive('userInfo', [function () {
    return {
      scope: {
        selectedUser: "=",
        showAdditionalInfo:"=",
        showDistinguishedAdditionalInfo: "=",
        onStudentsPage: "="
      },
      templateUrl: 'scripts/directives/userInfo/userInfoTemplate.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', 'socket', 'activeUser', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q, socket, activeUser) {




        $scope.userData = {};
        $scope.userData.color = $rootScope.user.data.role+'-color';
        $scope.userData.profileBackground = 'profile-bg-'+$rootScope.user.data.role;
        $scope.userInformation = {};
          //console.log($rootScope.user.data);
          var role =$rootScope.user.data.role;
          $scope.userProfileData ={
              'color':role+'-color',
              'border' : role+'-border',
              'background' : role+'-background',
              'userPhotoBorder': $rootScope.user.data.role + '-userPhotoBorder'
          };
        $scope.$watch('selectedUser',function () {

          $scope.requesstInProgress = true;
          if($scope.selectedUser){
            getInfo($scope.selectedUser.id);
          }
          else if (!$scope.onStudentsPage) {
            getInfo($rootScope.user.data.id);

          }
        });

        function getInfo(id) {
          $q.all([
            $http.get(appSettings.link + 'profile/indicator/' + id),
            $http.get(appSettings.link + 'current-user/' + id),
            $http.get(appSettings.link + 'user/announcements/' + $rootScope.user.data.id)
          ]).then(function (values) {
            $scope.requesstInProgress = false;
            $scope.userStatistic = values[0].data.data;
            $scope.userStatistic.countActivity = $scope.userStatistic.countActivity + $scope.userStatistic.countFollows + $scope.userStatistic.countSubscribers + values[2].data.announcements.length;
            $scope.userInformation = values[1].data.data;
            $scope.userData.profileBackground = 'profile-bg-'+$scope.userInformation.role;
            $scope.userData.color = $scope.userInformation.role+'-color';
          },
            function (values) {

            });
        }

        function changeCounterFollow(id) {
            $q.all([
                $http.get(appSettings.link + 'profile/indicator/' + id),
                $http.get(appSettings.link + 'current-user/' + id)
            ]).then(function (values) {
                  $scope.userStatistic.countFollows = $scope.userStatistic.countFollows - 1;
            },
                function (values) {

                });
        };


          ///////////////////// SWITCH BETWEEN USER-INFO TABS ///////////////////
          $rootScope.activitiesBlock = true;
          $scope.showUserInfo=true;
          $rootScope.showActivitiesFindPeople=true;
          $scope.switchAddUserInfo = function () {
              $('.additional-user-data-item').removeClass("active");
              $('#add-user_info').addClass("active");
              $scope.showUserInfo=true;
              $scope.showUserFollowers = false;
              $scope.showUserFollow=false;
              $scope.childmethod = function() {
                  $rootScope.$emit("switchActivities", {});
              };
              $scope.childmethod();
              $scope.showActivities=true;
              $rootScope.activitiesBlock = true;
              $rootScope.showActivitiesFindPeople=true;
          };
          $scope.switchUserFollowers = function () {
              $('.additional-user-data-item').removeClass("active");
              $('#followers').addClass("active");
              $scope.showUserInfo=false;
              $scope.showUserFollowers = true;
              $scope.showUserFollow=false;
              $scope.showActivities=false;
              $rootScope.activitiesBlock = false;
          };
          $scope.switchUserFollow = function () {
              $('.additional-user-data-item').removeClass("active");
              $('#user-follow').addClass("active");
              $scope.showUserInfo=false;
              $scope.showUserFollowers = false;
              $scope.showUserFollow=true;
              $scope.showActivities=false;
              $rootScope.activitiesBlock = false;
          };

          $scope.show = function (user) {
              //$rootScope.clickedUser = user;

              $rootScope.activitiesBlock = true;
              user.id = user.user_id;
              $scope.chldmeth = function(user) {
                  console.log(user);
                  user.id = user.user_id;
                  $rootScope.$emit("activateUser");
              };

              $rootScope.activeUserId = user.user_id;
              $rootScope.activeUser = user;
              $rootScope.feedUrl = appSettings.link+'story/'+ user.user_id;
              $scope.chldmeth(user);

          };
          $rootScope.$on("show", function(){
              $scope.show(user);
          });

          ///////////////////// FOLLOW LIST ////////////////////////////////////

          var listUsers;
          var followList = [];
          $scope.followList = followList;
          var followItem;

          var listUsersFoolowers;

          var followersList = [];

          $scope.followersList = followersList;

          /*activeUser.setUsersList(732);
          console.log(activeUser.setUsersList());
          console.log(activeUser.setUsersList($rootScope.user.data.id));

          $scope.followersList = activeUser.getUsersArr();
         ;*/

          $http({
              url: appSettings.link + 'users/follows/' + $rootScope.user.data.id,
              method: "GET"
              //headers: {'Content-Type': 'application/json'}
          })
              .then(function (response) {
                  $scope.listUsers = response.data.follows;
                  listUsers = $scope.listUsers;

                      for(var i=0; i<listUsers.length; i++){
                          followList.push(listUsers[i]);
                      }
              },
              function (response) {
              });

          $rootScope.refreshFollowList = function (id) {
              $http({
                  url: appSettings.link + 'users/follows/' + id,
                  method: "GET"
                  // headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                          $scope.listUsers = response.data.follows;
                          listUsers = $scope.listUsers;

                          followList = [];
                          $scope.followList = [];

                          for(var i=0; i<listUsers.length; i++){
                              $scope.followList.push(listUsers[i]);
                          }
                      },
                      function (response) {
                      });
          }

          $scope.unfollow = function(user, index) {
              event.preventDefault();
              followItem == false;
              followList.splice(index, 1);

              var unfollowedUserID = user.user_id,
                  indexToDelete;

              followersList.forEach(function(el, index){
                  (el.user_id === unfollowedUserID) && (indexToDelete = index);
                  //
                  // if (el.user_id === unfollowedUserID) {
                  //     indexToDelete = index
                  // }
              });


              $http({
                  url: appSettings.link + 'follow/'+ user.user_id,
                  method: "DELETE"
                  // headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                         changeCounterFollow(user.user_id);
                          $scope.followersList[indexToDelete].is_follower = false;
                      },
                      function (response) {
                      });
          };

          ///////////////////// FOLLOWERS LIST ////////////////////////////////////
          $http({
              url: appSettings.link + 'users/followers/' + $rootScope.user.data.id,
              method: "GET"
              // headers: {'Content-Type': 'application/json'}
          })
              .then(function (response) {
                      $scope.listUsersFoolowers = response.data.followers;
                      listUsersFoolowers = $scope.listUsersFoolowers;

                      for(var i=0; i<listUsersFoolowers.length; i++){
                          followersList.push(listUsersFoolowers[i]);
                      }
                  },
                  function (response) {
                  });

          $rootScope.refreshFollowersList = function (id) {
              console.log('refres ***************** id -' + id);

              $http({
                  url: appSettings.link + 'users/followers/' + id,
                  method: "GET"
                  // headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                          $scope.listUsersFoolowers = response.data.followers;
                          listUsersFoolowers = $scope.listUsersFoolowers;

                          followersList = [];
                          $scope.followersList = [];

                          for(var i=0; i<listUsersFoolowers.length; i++){
                              $scope.followersList.push(listUsersFoolowers[i]);
                          }
                      },
                      function (response) {
                      });
          };

          $scope.followUser = function (method,user,index) {
              event.preventDefault();
              $scope.followList.push(user);
              $rootScope.$on('activities', function (data) {
                  data.unshift(user);
                  console.log(data);
                  console.log();
              });
              $http({
                  url: appSettings.link + 'follow/'+ user.user_id,
                  method: method,
                  headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                          $http({
                              url: appSettings.link + 'newactivity',
                              method: "POST",
                              data: {'user_id': user.user_id, 'type': 'story', 'data': user}
                          }).then(function (data) {
                              console.log(data);
                          });

                          socket.io.emit('newActivity', user);
                          console.log('new Activity - new follow');
                          $scope.followersList[index].is_follower=!$scope.followersList[index].is_follower;
                          $scope.userStatistic.countFollows = $scope.userStatistic.countFollows + 1;
                      },
                      function (response) {

                      });
          };

          ////////////////////////////////////////////////////////////////////////

          // On User-profile-block scroll activate User-profile-info-block's scroll
          var profileUserBlock = $(".class-menu-item-block-right-profile");
          var profileInfoBlock = $(".profile-center-container");

          profileUserBlock.on("scroll", function() {
             /* console.log(this.scrollTop);
              console.log(profileInfoBlock.scrollTop);*/
              profileInfoBlock.scrollTop = this.scrollTop;
          });

      }]
    }
  }]);







