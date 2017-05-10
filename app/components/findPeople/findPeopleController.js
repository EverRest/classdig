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
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed,uiCalendarConfig) {
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

      /*$rootScope.$on("activateUser", function(){
          $scope.activateUser();
      });*/

      $scope.activateUser = function (user) {
        /*var id;
        if(user != undefined) {
          id = user.id;
        } else {
          cookie = document.cookie;
          var tmp = cookie.split('clicked_user=');
          id = + tmp[1];
        }*/

        if($scope.activeUserId === id){
          $scope.activeUserId = undefined;
        }
        else {
          $scope.activeUserId = user.id;
          $scope.activeUser = user;
          $scope.feedUrl = appSettings.link+'story/'+id;
        }
    };



    $scope.followUser = function (method,id,index) {

      $http({
        url: appSettings.link + 'follow/'+id,
        method: method,
        headers: {'Content-Type': 'application/json'}
      })
        .then(function (response) {
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

    }

  }]);


