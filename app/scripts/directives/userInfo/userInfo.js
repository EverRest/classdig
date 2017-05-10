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
        $scope.$watch('selectedUser',function () {

          $scope.requesstInProgress = true;
          if($scope.selectedUser){
            getInfo($scope.selectedUser.id);
          }
          else if (!$scope.onStudentsPage) {
            getInfo($rootScope.user.data.id)
          }
        });
        function getInfo(id) {
            // console.log(appSettings.link + 'profile/indicator/');
            // console.log(appSettings.link + 'current-user/');
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
            $q.all([
                $http.get(appSettings.link + 'profile/indicator/' + id),
                $http.get(appSettings.link + 'current-user/' + id)
            ]).then(function (values) {
                  $scope.userStatistic.countFollows = $scope.userStatistic.countFollows - 1;
            },
                function (values) {

                });
        }

          $scope.changeCounterActions = function(id) {
              $q.all([
                  $http.get(appSettings.link + 'profile/indicator/' + id),
                  $http.get(appSettings.link + 'current-user/' + id)
              ]).then(function (values) {
                      $scope.userStatistic.countActivity = $scope.userStatistic.countActivity - 1;

                  },
                  function (values) {

                  });
          }


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
          ///////////////////////////////////////////////////////////////////////

          ///////////////////// FOLLOW LIST ////////////////////////////////////

          var listUsers;
          var followList = [];
          var followItem;

          $http({
              url: appSettings.link + 'users/school',
              method: "GET"
              // headers: {'Content-Type': 'application/json'}
          })
              .then(function (response) {
                  $scope.listUsers = response.data.data;
                  listUsers = $scope.listUsers;

                  for(i=0; i<listUsers.length; i++){
                      followItem = listUsers[i].is_follow;

                      if(followItem){
                          followList.push(listUsers[i].user);
                      }
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
                  url: appSettings.link + 'follow/'+user.id,
                  method: "DELETE"
                  // headers: {'Content-Type': 'application/json'}
              })
                  .then(function (response) {
                          changeCounterFollow(user.id);

                      },
                      function (response) {
                      });
          };
          //////////////////////////////////////////////////////////////////////////

          ///////////////////// FOLLOWERS LIST ////////////////////////////////////

          ////////////////////////////////////////////////////////////////////////



          $scope.showProfileUser = function (user) {
              var current = user;
              $scope.showUserMethod = function(user) {
                  document.cookie ='clicked_user=' + user['id'];

                  $rootScope.$emit("activateUser", {});
              };
              $scope.showUserMethod(current);

          };

      }]

    }
  }]);


