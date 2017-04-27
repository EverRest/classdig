angular.module('classDigApp')
  .controller('examsController',
    ['$scope',
      '$rootScope',
      '$uibModal',
      '$log',
      '$document',
      '$http',
      'appSettings',
      '$routeParams',
      '$timeout',
      function ($scope, $rootScope, $uibModal, $log, $document, $http, appSettings,$routeParams,$timeout) {
        var $ctrl = this;
        $rootScope.activeClassItem = 6;
        $scope.examExist = false;
        $scope.examNotExist = false;
        $scope.role= $rootScope.user.data.role;
        $scope.showButton = ($scope.role !=='parent');
        $('#user-loader').show();
        function getListOfExams() {
          $http({

            url: appSettings.link + 'exams?search=class_id:' + $routeParams.classId,
            method: "GET"
          })
            .then(function (response) {
                $scope.listOfExams = response.data.data;
                $('#user-loader').hide();
                if (response.data.data.length !== 0) {
                  $scope.examExist = true;
                }
                else {
                  $scope.examNotExist = true;
                }
              },
              function (response) {

              });
        }
        getListOfExams();
        $scope.hideCustomButton = true;
        $rootScope.$on('class-data-was-received', function () {
          if(!$rootScope.user.classData.classInArchived){
            $scope.hideCustomButton = false;
          }
          if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
            $scope.hideCustomButton = true;
          }

          if($rootScope.user.classData.owner === $rootScope.user.data.id){
            for (var i = 0; i < $scope.contextMenu.items.length; i++){
              $scope.contextMenu.items[i].active = true;
            }
          }
        });

        $scope.changeDateFormat = function(date,time ){
          var month = moment(date, 'YYYY-MM-DD').format('D MMM');
          var hour = moment(time, 'hh:mm:ss').format('HH:mm');
          return month+' '+hour
        };


        $rootScope.userData = {
          'role': $rootScope.user.data.role,
          "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
          'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
          'background': $rootScope.user.data.role + '-background',
          'color': $rootScope.user.data.role + '-color',
          'border': $rootScope.user.data.role + '-border',
          'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
        };

        $scope.selection = {selectedItems: [], currentItem: []};

        $scope.data = {
          'items': [],
          'onGlobalButtonClick': function () {
          }
        };

        $scope.$on('createExam', function (event, data) {
          if($scope.listOfExams.length>0) {
            $scope.listOfExams.unshift(data);
          }
          else{
            $scope.listOfExams = [];
            $scope.listOfExams[0] = data;
            $scope.examExist = true;
            $scope.examNotExist = false;

          }
        });

        $scope.$on('updateExam', function (event, data) {
          $log.log('update exam:',data);
          $scope.listOfExams=data;
        });

        $scope.$on('DeleteExamFromList',function () {
          getListOfExams();
        });
        $scope.openAreUSureModal = function (size) {
          var modalInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            templateUrl: 'components/class/dashboard/exams/areUSureModal/areUSureModal.html',
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

        $scope.editExam = function (exam) {
            var modalInstance = $uibModal.open({
              templateUrl: 'components/class/dashboard/exams/examsModal/examsModal.html',
              controller: 'examModalInstanceCtrl',
              controllerAs: '$ctrl',
              resolve: {
                items: function () {
                  return exam;
                }
              }
            });
        };

        $scope.deleteArrayOfExams = function (selectedItems) {
          $log.log("deleteExam", selectedItems);
          $scope.modalContext = {
            'action': 'deleteFiles',
            'actionTitle': 'delete',
            'selection': $scope.selection.selectedItems,
            'current': $scope.selection.currentItem
          };
          $scope.openAreUSureModal('sm');
          $rootScope.$on('deleteFiles', function () {
            $log.log('selectedItems',selectedItems);
            for(var examId = 0; examId<selectedItems.length; examId++){
              $log.log('selectedItems', selectedItems[examId]);
            $http({
              method: 'DELETE',
              url: appSettings.link + 'exams/'+selectedItems[examId],
              headers: {'Content-Type': 'application/json'},
              data: {
                "id": selectedItems[examId]
              }
            })
              .success(function (response) {
                //$log.log("all good", response);
                $rootScope.$broadcast('DeleteExamFromList')

              })
              .error(function () {

              })

            }
          })
        };

        $ctrl.animationsEnabled = true;

        $ctrl.openModal = function (size, parentSelector) {
          var parentElem = parentSelector ?
            angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
          var modalInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'components/class/dashboard/exams/examsModal/examsModal.html',
            controller: 'examModalInstanceCtrl',
            controllerAs: '$ctrl',
            size: size,
            appendTo: parentElem,
            resolve: {
              items: function () {
                return $ctrl.items;
              }
            }
          });



        };

        $scope.contextMenu = {
          'items': [
            {
              'img': 'images/context_menu/icon-edit-' + $rootScope.user.data.role + '_3x.png',
              'imgDisabled' : 'images/context_menu/icon-edit-default_3x.png',
              'imgHover' : 'images/context_menu/icon-edit-hover_3x.png',
              'state' : false,
              'active': false,
              'text': 'Edit',
              'multiSelect': false,
              'click': $scope.editExam
            },

            {
              'img': 'images/context_menu/icon-delete-' + $rootScope.user.data.role + '_3x.png',
              'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
              'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
              'state' : false,
              'active': false,
              'text': 'Delete',
              'multiSelect': ['teacher', 'student'],
              'singleSelect': ['teacher', 'student'],
              'click': $scope.deleteArrayOfExams,
              'context': $scope.selection.selectedItems
            }
          ]
        };

        $scope.selectionWasChanged = function () {
          $timeout(function () {
              if($scope.selection.selectedItems.length === 1) {
                $scope.hideButton = true;
                for (var i = 0; i < $scope.contextMenu.items.length; i++){
                  $scope.contextMenu.items[i].state = true;
                  $scope.contextMenu.items[0].context =  $scope.selection.currentItem[0];
                }

              } else if($scope.selection.selectedItems.length === 0) {
                $scope.hideButton = false;
                for (var i = 0; i < $scope.contextMenu.items.length; i++){
                  $scope.contextMenu.items[i].state = false;
                }
              } else {
                $scope.hideButton = true;
                $scope.contextMenu.items[0].state = false;
                $scope.contextMenu.items[1].state = true;
              }
          })
        };
      }]);
