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
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q) {

        $scope.userData = {};
        $scope.userData.color = $rootScope.user.data.role+'-color';
        $scope.userData.profileBackground = 'profile-bg-'+$rootScope.user.data.role;
        $scope.userInformation = {};
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
            console.log('slect');
          }
          else if (!$scope.onStudentsPage) {
            getInfo($rootScope.user.data.id)
              console.log($);
          }
        });
        function getInfo(id) {
          $q.all([
            $http.get(appSettings.link + 'profile/indicator/' + id),
            $http.get(appSettings.link + 'current-user/' + id)
          ]).then(function (values) {
            $scope.requesstInProgress = false;
            $scope.userStatistic = values[0].data.data;
            $scope.userInformation = values[1].data.data;
            $scope.userData.profileBackground = 'profile-bg-'+$scope.userInformation.role;
            $scope.userData.color = $scope.userInformation.role+'-color';
          },
            function (values) {

            });
        }

        function changeCounterFollow(id) {
            console.log('changeCounterFollow');
            console.log(id);
            $q.all([
                $http.get(appSettings.link + 'profile/indicator/' + id),
                $http.get(appSettings.link + 'current-user/' + id)
            ]).then(function (values) {
                  $scope.userStatistic.countFollows = $scope.userStatistic.countFollows - 1;
            },
                function (values) {

                });
        }

         /* $scope.changeCounterActions = function(id) {
              $q.all([
                  $http.get(appSettings.link + 'profile/indicator/' + id),
                  $http.get(appSettings.link + 'current-user/' + id)
              ]).then(function (values) {
                      $scope.userStatistic.countActivity = $scope.userStatistic.countActivity - 1;

                  },
                  function (values) {

                  });
          }*/

          ///////////////////// SWITCH BETWEEN USER-INFO TABS ///////////////////
          $scope.showUserInfo=true;
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
          };
          $scope.switchUserFollowers = function () {
              $('.additional-user-data-item').removeClass("active");
              $('#followers').addClass("active");
              $scope.showUserInfo=false;
              $scope.showUserFollowers = true;
              $scope.showUserFollow=false;
          };
          $scope.switchUserFollow = function () {
              $('.additional-user-data-item').removeClass("active");
              $('#user-follow').addClass("active");
              $scope.showUserInfo=false;
              $scope.showUserFollowers = false;
              $scope.showUserFollow=true;
          };
          $scope.showProfileUser = function (user) {
              event.preventDefault();
              $scope.childmeth = function(user) {
                  $rootScope.$emit("switchUser", user);
              };
              $scope.childmeth(user);
              $rootScope.showUser=true;
              $scope.activeUserId = user.id;
              $rootScope.activeUser = user;
              $scope.feedUrl = appSettings.link+'story/'+ user.id;
          }

          $scope.show = function (user) {
              $scope.chldmeth = function(user) {
                  $rootScope.$emit("activateUser", user);
              };
              $rootScope.activeUserId = user.user_id;
              $rootScope.activeUser = user;
              $rootScope.feedUrl = appSettings.link+'story/'+ user.user_id;
              $scope.chldmeth(user);
          };
          $rootScope.$on("show", function(){
              $scope.show();
          });



          ///////////////////////////////////////////////////////////////////////

          ///////////////////// FOLLOW LIST ////////////////////////////////////

          var listUsers;
          var followList = [];
          var followItem;

          $http({
              url: appSettings.link + 'users/follows/' + $rootScope.user.data.id,
              method: "GET"
              // headers: {'Content-Type': 'application/json'}
          })
              .then(function (response) {
                  $scope.listUsers = response.data.follows;
                  listUsers = $scope.listUsers;

                      for(var i=0; i<listUsers.length; i++){
                          followList.push(listUsers[i]);
                          $scope.followList = followList;
                          window.localStorage.followList = JSON.stringify($scope.followList);
                      }
              },
              function (response) {
              });

          $scope.unfollow = function(user, index) {
              event.preventDefault();
              followList.splice(index, 1);
              followItem == false;
              $http({
                  url: appSettings.link + 'follow/'+ user.user_id,
                  method: "DELETE"
                  // headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                         changeCounterFollow(user.user_id);

                      },
                      function (response) {
                      });
          };
          //////////////////////////////////////////////////////////////////////////

          ///////////////////// FOLLOWERS LIST ////////////////////////////////////

          var listUsersFoolowers;
          var followersList = [];
          var followersItem;


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
                          $scope.followersList = followersList;
                          //window.localStorage.followersList = JSON.stringify($scope.followersList);
                      }
                  },
                  function (response) {
                  });



          $scope.followUser = function (method,user,index) {
              event.preventDefault();

              $http({
                  url: appSettings.link + 'follow/'+ user.user_id,
                  method: method,
                  headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                          /*$scope.listOfTheSameSchoolPeople[index].is_follow=!$scope.listOfTheSameSchoolPeople[index].is_follow;*/
                          //$scope.followList[index].is_follow=!$scope.followList[index].is_follow;
                          $scope.followersList[index].is_follower=!$scope.followersList[index].is_follower;
                          $scope.userStatistic.countFollows = $scope.userStatistic.countFollows + 1;
                      },
                      function (response) {

                      });
          };

          ////////////////////////////////////////////////////////////////////////


      }]
    }
  }]);


