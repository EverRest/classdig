angular.module('classDigApp')
  .controller('assignmentController',
    ['$scope',
      '$rootScope',
      '$uibModal',
      '$log',
      '$document',
      '$http',
      'appSettings',
      '$routeParams',
      'Assignment',
      '$timeout',
      function ($scope, $rootScope, $uibModal, $log, $document, $http, appSettings,$routeParams, Assignment,$timeout) {
        var $ctrl = this;
        $rootScope.activeClassItem = 5;
        $scope.examExist = false;
        $scope.examNotExist = false;
        $scope.role= $rootScope.user.data.role;
        // $scope.showButton = ($scope.role !=='parent');
        $scope.assignment = new Assignment();
       // console.log($scope.showButtonSubmitByStudent);

        $scope.hideCustomButton = true;
        $rootScope.$on('class-data-was-received', function () {
          if(!$rootScope.user.classData.classInArchived){
            $scope.hideCustomButton = false;
          }
          if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
            $scope.hideCustomButton = true;
          }

          if($rootScope.user.classData.owner === $rootScope.user.data.id) {
            for (var i = 0; i < $scope.contextMenu.items.length; i++) {
              $scope.contextMenu.items[i].active = true;
            }
          }

        });

        $http({
          url: appSettings.link +'assignment?search=class_id:'+$routeParams.classId,
          method: "GET"
        })
          .then(function (response) {
              //$scope.listOfAssignment = response.data.data;
             // console.log(response.data);
              if(response.data.data.length !== 0) {
                $scope.examExist = true;
              }
              else{
                $scope.examNotExist = true;
                $('#user-loader').hide();
              }

            },
            function (response) {
              $scope.examNotExist = true;
            });

        $scope.changeDateFormat = function(date,time ){
          var month = moment(date, 'YYYY-MM-DD').format('D MMM');
          //var hour = moment(time, 'hh:mm:ss').format('HH:mm');
         // var hour = time;
          return month+' '+time
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

        $scope.userId = $rootScope.user.data.id;

        $scope.data = {
          'items': [],
          'onGlobalButtonClick': function () {
          }
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
              'click': $scope.editAssignment
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
              'click': $scope.deleteArrayOfAssignments,
              'context': $scope.selection.selectedItems
            }
          ]
        };

        $scope.$on('changeAssignment', function (event, data) {
          $log.log('New assignment:',data);
          $log.log('list000',$scope.assignment.items);
          $scope.assignment.items.unshift(data.data.data);
          $scope.examExist = true;
          $scope.examNotExist = false;


        });

        $scope.$on('updateAssignment', function (event, data) {
          $log.log('--lll---',$scope.assignment.items);
          for(var i=0;i<$scope.assignment.items.length;i++){
            if($scope.assignment.items[i].id===data.id){
              $scope.assignment.items[i]=data
            }
          }
          //$log.log('update assignment:',data);
          $scope.selection = {selectedItems: [], currentItem: []};
        });

        $scope.$on('submitAssignmentByStudent', function (event, data, index) {
          $log.log('submitAssignmentByStudent:',data);
          $scope.buttonSubmitByStudent='Submit assignment';
          $http({
            url: appSettings.link +'assignment?search=class_id:'+$routeParams.classId ,
            method: "GET"
          })
            .then(function (response) {
               // $scope.listOfAssignment = response.data.data;
             console.log(response.data.data.filter(function (obj) {return obj.id == data
             }));
              var array = response.data.data.filter(function (obj) {return obj.id == data
              });
              $scope.assignment.items[index] =array[0]
              },
              function (response) {
                $scope.AssignmentServerError = true;
              });
        });

        $scope.$on('DeleteAssignmentFromList',function (event,assignmentId) {
          for(var i=0;i<$scope.assignment.items.length;i++){
            if($scope.assignment.items[i].id===assignmentId){
              $scope.assignment.items.splice($scope.assignment.items[i],1)
            }
          }
        });

        $scope.openAreUSureModal = function (size) {
          var modalInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            templateUrl: 'components/class/dashboard/assignment/areUSureModal/areUSureModal.html',
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

        $scope.deleteArrayOfAssignments = function (selectedItems) {
          $log.log("deleteAssignment", selectedItems);
          $scope.modalContext = {
            'action': 'deleteFiles',
            'actionTitle': 'delete',
            'selection': $scope.selection.selectedItems,
            'current': $scope.selection.currentItem
          };
          $scope.openAreUSureModal('sm');
          $rootScope.$on('deleteFiles', function () {
            $log.log('selectedItems',selectedItems);
            for(var assignmentId = 0; assignmentId<selectedItems.length; assignmentId++){
              $scope.curenItemDeleteId = selectedItems[assignmentId];
              $log.log('selectedItems', selectedItems[assignmentId]);
              $http({
                method: 'DELETE',
                url: appSettings.link + 'assignment/'+selectedItems[assignmentId],
                headers: {'Content-Type': 'application/json'},
                data: {
                  "id": selectedItems[assignmentId]
                }
              })
                .success(function (response) {
                  $log.log("all good", response);
                  $rootScope.$broadcast('DeleteAssignmentFromList', $scope.curenItemDeleteId );

                })
                .error(function () {

                })

            }
          })
        };

        $scope.editAssignment = function (assignment) {
            var modalInstance = $uibModal.open({
              templateUrl: 'components/class/dashboard/assignment/assignmentModal/assignmentModal.html',
              controller: 'assignmentModalInstanceCtrl',
              controllerAs: '$ctrl',
              resolve: {
                items: function () {
                  return assignment;
                }
              }
            });
        };

$scope.filterSubmittedParticipants= function(array){
  function isSubmitted(value) {
    return value.submission == 1;
  }
  var new_array=[];
   new_array = array.filter(isSubmitted);

 var images_array = new_array.map(function(obj){
   var imgObj = {};
   imgObj.image = obj.user.image;
   return imgObj
 });
  return images_array
};

        $scope.getSubmitButtonValue = function(assignment){
          assignment.disableSubmitButton=false;
          var array = assignment.participants;
          var buttonValue = '';
          var timeFrame = new Date() - new Date((assignment.due_date+' '+assignment.due_time_24).replace(/-/g, "/"));
          // var timeFrame = new Date() -  moment(assignment.due_date+' '+assignment.due_time_24,"yyyy-mm-dd hh:mm:ss").toDate();
          for(var i = 0; i<array.length;i++){
            if(array[i].user.id==$rootScope.user.data.id){
              var studentAssignmentData = array[i];
              if(studentAssignmentData.submission ===1){
                if(studentAssignmentData.files.length===0){
                  buttonValue ='Your assignment has been submitted';
                  assignment.disableSubmitButton = true;
                }
                else{
                  if (timeFrame < 0) {
                    buttonValue = 'edit';
                  }
                  else {
                    buttonValue = 'Due date has passed';
                    assignment.disableSubmitButton = true;
                  }
                }
              }
              else {
                buttonValue='submit';
              }
            }

          }
          return buttonValue
        };

        $scope.submitAssignment = function (assignment, assignmentId, index,assign) {
          var timeFrame = new Date() - new Date((assign.due_date+' '+assign.due_time_24).replace(/-/g, "/"));

          if(assign.disableSubmitButton){
            return
          }

          var modalInstance = $uibModal.open({
            templateUrl: 'components/class/dashboard/assignment/assignmentModal/submitAssignmentModal.html',
            controller: 'submitAssignmentModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
             items: function () {
               return assignment;
              },
              assignmentId: function () {
                return assignmentId;
              },
              index: function () {
                return index;
              },
              assign: function () {
                return assign;
              }

            }
          });
        };

        $scope.markAssignment = function (student) {
          if(student.files.length===0){
            return
          }
          var modalInstance = $uibModal.open({
            templateUrl: 'components/class/dashboard/assignment/assignmentModal/markAssignment/markAssignment.html',
            controller: 'markAssignmentModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
              items: function () {
                return student;
              }

            }
          });
        };



        $ctrl.animationsEnabled = true;

        $ctrl.openModal = function (size, parentSelector) {
          var parentElem = parentSelector ?
            angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
          var modalInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'components/class/dashboard/assignment/assignmentModal/assignmentModal.html',
            controller: 'assignmentModalInstanceCtrl',
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


        $scope.selectionWasChanged = function (id) {

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


        $scope.checkHandSubmission = function(assignment){
          $scope.selection = {selectedItems: [], currentItem: []};
          var modalInstance = $uibModal.open({
            templateUrl: 'components/class/dashboard/assignment/assignmentModal/handSubmissionModal/handSubmissionModal.html',
            controller: 'handSubmissionModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
              items: function () {
                return assignment;
              }

            }
          });

        };

      }])
  .factory('Assignment', function($http, appSettings, $routeParams) {
    var Assignment = function() {
      this.items = [];
      this.busy = false;
      this.after = '';
    };

    Assignment.prototype.nextPage = function() {
      if (this.busy) return;

      this.busy = true;

      var url = appSettings.link +'assignment?search=class_id:'+$routeParams.classId +"&page="+this.after;
      $http.get(url)
        .success(function(data) {
          if(data.data.length ===0){
            return
          }
          var items = data.data;
          //console.log(data);
          for (var i = 0; i < items.length; i++) {
            this.items.push(items[i]);
          }
          this.after =data.meta.pagination.current_page+1;
          if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
            $('#user-loader').hide();
            return

          }
          this.busy = false;
          $('#user-loader').hide();
        }.bind(this));
    };

    return Assignment;
  });

