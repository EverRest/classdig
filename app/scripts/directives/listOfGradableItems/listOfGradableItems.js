angular.module('classDigApp')
  .directive('listOfGradableItems', [function () {
    return {
      scope: {
        classId: "="
      },
      templateUrl: 'scripts/directives/listOfGradableItems/listOfGradableItems.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', '$uibModal',
        function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q, $uibModal) {

          $rootScope.userData = {
            'role': $rootScope.user.data.role,
            "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
            'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
            'background': $rootScope.user.data.role + '-background',
            'color': $rootScope.user.data.role + '-color',
            'border': $rootScope.user.data.role + '-border',
            'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
          };

        $scope.$watch('classId',function () {
          getListOfGradableItems();
        });

          var $ctrl = this;

        function getListOfGradableItems(){
          $http({
            url: appSettings.link + 'gradable/item?search=class_id:' + $scope.classId,
            method: "GET"
          })
            .then(function (response) {
              $scope.listOfGradableItems = response.data.data;

                $('#user-loader').hide();
                if (response.data.data.length !== 0) {
                  $scope.examExist = true;
                }
                else {
                  $scope.examNotExist = true;
                }
                $scope.hideLoader = true;
              },
              function (response) {

                $scope.hideLoader = true;
              });
        }
        getListOfGradableItems();

        function getListOfCategory(){
          $http({
            url: appSettings.link + 'category',
            method: "GET"
          })
            .then(function (response) {
                $scope.optionsList= [];
                for (var i=0; i<response.data.data.length; i++){
                  $scope.optionsList[i]={};
                  $scope.optionsList[i].id = response.data.data[i].id;
                  $scope.optionsList[i].option = response.data.data[i].name;
                  $scope.optionsList[i].val = response.data.data[i].id;
                }

              },
              function (response) {

              });
        }
        getListOfCategory();

        $scope.editGradableItem = function (item, index) {
          var modalInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            templateUrl: 'components/class/dashboard/grades/createGradableItem/createGradableItem.html',
            controller: 'createGradableItemCtrl',
            controllerAs: '$ctrl',
            resolve: {
              items: function () {
                return item
              },
              category: function () {
                return $scope.optionsList;
              }
            }
          });
          getListOfGradableItems();
        };

        $scope.deleteGradableItem = function (item, index) {
          $scope.classToDelete = item;
            var modalInstance = $uibModal.open({
              animation: $ctrl.animationsEnabled,
              templateUrl: 'components/class/dashboard/events/areUSureModal/areUSureModal.html',
              controller: 'areUSureModalEventsCtrl',
              controllerAs: '$ctrl',
              size: 'sm',
              resolve: {
                items: function () {
                  return $scope.classToDelete;
                }
              }
            });

          $scope.deleteEvent = function (event,index) {
            $scope.eventToDelete = event;
            $scope.openAreUSureModal('sm');


          };

        };

          $rootScope.$on('delete-was-approved', function (e, data) {

            $http({
              method: 'delete',
              url: appSettings.link + 'gradable/item/' + data.id,
              headers: {'Content-Type': 'application/json'}
            })
              .success(function (response) {
                getListOfGradableItems();
                //$scope.listOfUpcomingEvents.splice(index,1);

              })
              .error(function () {

              });
          });

          $rootScope.$on('updateGradableItem', function () {
            getListOfGradableItems();
          })

      }]
    }
  }]);
