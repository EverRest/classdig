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
          console.log($scope.selectedUser);

          $scope.requesstInProgress = true;
          if($scope.selectedUser){
            getInfo($scope.selectedUser.id);
          }
          else if (!$scope.onStudentsPage) {
            getInfo($rootScope.user.data.id)
          }
        });
        function getInfo(id) {
            console.log(appSettings.link + 'profile/indicator/');
            console.log(appSettings.link + 'current-user/');
          $q.all([
            $http.get(appSettings.link + 'profile/indicator/' + id),
            $http.get(appSettings.link + 'current-user/' + id)
          ]).then(function (values) {
            $scope.requesstInProgress = false;
            console.log(values);
            $scope.userStatistic = values[0].data.data;
            $scope.userInformation = values[1].data.data;
            $scope.userData.profileBackground = 'profile-bg-'+$scope.userInformation.role;
            $scope.userData.color = $scope.userInformation.role+'-color';
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
      }]

        /*$scope.userFollowList=[
          {
              img: 'http://www.technocrazed.com/wp-content/uploads/2015/12/beautiful-wallpaper-download-11.jpg',
              name: 'Sultan',
              email: 'Sultan@test.com'
          },
          {
              img: 'http://www.technocrazed.com/wp-content/uploads/2015/12/beautiful-wallpaper-download-11.jpg',
              name: 'Petro',
              email: 'Petro@test.com'
          }
      ];*/
    }
  }]);


