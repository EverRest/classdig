angular.module('classDigApp')
  .controller('settingsController',
    ['$scope',
      '$rootScope',
      'appSettings',
      '$log',
      'Chat',
      '$uibModal',
      'Users',
      '$timeout',
      'AllClasses',
      '$routeParams',
      '$location',
      'chatTitle',
      'moment',
      'Upload',
      'ChatGroups',
      '$http',
      function ($scope, $rootScope, appSettings, $log, Chat, $uibModal, Users, $timeout,
                AllClasses, $routeParams, $location, chatTitle, moment, Upload, ChatGroups,
                $http) {

          $scope.role = $rootScope.user.data.role;
          $scope.selectedEN = true;

          $rootScope.$watch('notificationsEnabled', function () {
            $timeout(function () {
              $("#myonoffswitch").prop("checked", $rootScope.notificationsEnabled);
            });
          });

          $rootScope.$watch('protectedEnable', function () {
            $timeout(function () {
              $("#myonoffswitch1").prop("checked", $rootScope.protectedEnable);
            });
          });

        $(document).ready(function () {
          $(document).on('mouseenter', '.controll-button', function () {
            $(this).find(".inside-menu").show();
          }).on('mouseleave', '.controll-button', function () {
            $(this).find(".inside-menu").hide();
          });
        });

        $http.get(appSettings.link + 'behavior/' + $rootScope.user.data.id)
          .success(function (response) {
            response.data[4].image = 'images/behavior/bad_behaviour_13@2x.png';
            response.data[5].image = 'images/behavior/bad_behaviour_12@2x.png';
            response.data[6].image = 'images/behavior/bad_behaviour_11@2x.png';
            response.data[7].image = 'images/behavior/bad_behaviour_10@2x.png';
            $scope.behaviours = response.data;
            console.log(response.data)
          });

        $scope.$on('new-category-created', function () {
          $http.get(appSettings.link + 'behavior/' + $rootScope.user.data.id)
            .success(function (response) {
              $scope.behaviours = response.data;
            });
        });

        $http.get(appSettings.link + 'user/classes')
          .success(function (response) {
            $scope.listOfClasses = response.data;
            $scope.users = response.data;
          });

        $http.get(appSettings.link + 'gradable/item')
          .success(function (response) {
            $scope.gradableItems = response.data;
          });


///////////////// GRADABLE ITEMS ///////////////////////////
        $scope.showListOfClasses = true;
        $scope.showListOfGradableItems = false;
        $scope.$watch('classIdForGradableItems', function () {
          $scope.selectedClassId = $scope.classIdForGradableItems;
          if($scope.classIdForGradableItems) {
            $scope.showListOfClasses = false;
            $scope.showListOfGradableItems = true;
          }
          else{
            $scope.showListOfClasses = true;
            $scope.showListOfGradableItems = false;
          }
        });

        $scope.iconArrowBack = 'images/files-library/icon-arrow-back-' + $rootScope.user.data.role + '.svg';
////////////////////////////////////////////////////


        $scope.backToListOfClasses = function () {
          $scope.classIdForGradableItems = undefined;
        };

          $scope.selectLanguage = function(language) {
            if(language === 'EN') {
              $scope.selectedEN = true;
              $scope.selectedAR = false;
            } else if(language === 'AR') {
              $scope.selectedEN = false;
              $scope.selectedAR = true;
            }
          };

          $scope.notificationsEnable = function () {
            $rootScope.notificationsEnabled = !$rootScope.notificationsEnabled;
            $http.put(appSettings.link + '/user-settings', {"notifications": $rootScope.notificationsEnabled});
          };

          $scope.protectedEnable = function () {
            $rootScope.protectedEnable = !$rootScope.protectedEnable;
            $http.put(appSettings.link + '/user-settings', {"protected_follow": $rootScope.protectedEnable});
          };

        $scope.openAreUSureModal = function (size) {
          var modalInstance = $uibModal.open({
            templateUrl: 'components/classes/areUSureModal/areUSureModal.html',
            controller: 'areUSureModalCtrl',
            controllerAs: '$ctrl',
            size: size,
            resolve: {
              items: function () {
                return $scope.modalContext;
              }
            }
          });
        };

          $scope.editBehavior = function (behavior) {

            var modalInstance = $uibModal.open({
              templateUrl: 'components/class/dashboard/behaviour/newBehaviorTypeModal/newBehaviorTypeModal.html',
              controller: 'newBehaviorTypeModal',
              controllerAs: '$ctrl',
              resolve: {
                items : behavior
              }
            });
          };

          $scope.deleteBehavior = function (behavior) {
              $scope.modalContext = {
                'action' : 'deleteBehavior',
                'actionTitle' : 'delete',
                'behavior' : behavior
              };
              $scope.openAreUSureModal('sm');

              $rootScope.$on('deleteBehavior', function deleteBehavior() {

                $http({
                  method: 'delete',
                  url: appSettings.link + 'behavior/' + behavior.id,
                  headers: {'Content-Type': 'application/json'}
                })
                  .success(function (response) {
                    var delbeh = $scope.behaviours.find(function (obj) {
                      return obj.id === behavior.id
                    });
                    var ind = $scope.behaviours.indexOf(delbeh);
                    $scope.behaviours.splice(ind, 1);
                  })
                  .error(function () {
                  });
                $rootScope.$$listeners['deleteBehavior'] = [deleteBehavior];
                $rootScope.$$listeners['deleteBehavior'].splice(0, 1);
              });

          };





  }]);
