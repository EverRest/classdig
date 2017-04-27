angular.module('classDigApp')
  .directive('selectUsers', [function () {
    return {
      // scope: {
      // },
      templateUrl: 'scripts/directives/selectUsers/selectUsersTemplate.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$uibModal', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $uibModal) {
        $scope.users = new Users();
        $scope.userRole = "users";
        $scope.selectedUsers = {};
        $scope.showMembersHeader = true;
        $scope.memberRole = 'students';
        $scope.selectAllParents = false;
        $scope.selectAllStudents = false;

        var id = $routeParams.classId;
        $scope.currentClassObj = classData.getClassById(id, function (data) {
          $scope.currentClassObj = data;
          $scope.currentClass = data.id;
          $scope.role = $rootScope.user.data.role;

          $timeout(function () {
            if(!$scope.openedFromStudents) {
              $scope.users.nextPage($scope.currentClass, $scope.userRole);
              $scope.classToSortBy = $scope.currentClass;
            }
          });




          $log.log("users", $scope.users);

        });


        $rootScope.$on('userRoleChanged', function(data,el){
          $scope.users.nextPage($routeParams.classId, el );
          $scope.memberRole = el;
          if($scope.memberRole==='users'){
            $scope.memberRole='students'
          }

          if($scope.userRole == 'users'){
            $scope.checkedSelectAll = $scope.selectAllStudents;
            //$('#select-all').attr('checked', $scope.selectAllStudents)
          }

          if($scope.userRole == 'parents'){
            $scope.checkedSelectAll = $scope.selectAllParents;
            //$('#select-all').attr('checked', $scope.selectAllParents);
          }

        });

//////////////////////SELECT USERS FOR HAND SUBMISSION ////////////////////////////////////
        if($scope.checkHandSubmission){
           $scope.users.nextPage($scope.classToSortBy,'users');
          function filterNotSubmittedStudentItems(obj) {
            for (var i =0; i<$scope.notSubmittedStudent.length; i++){
              if (obj.id ===$scope.notSubmittedStudent[i].id){
                return true
              }
            }
          }
          $timeout(function() {
            $scope.users.items = $scope.users.items.filter(filterNotSubmittedStudentItems);

          },1000);
        }

        ////////////////////////////////////////////////////////////////

        $scope.selectAll = function (role) {
          var model;
          if(role === 'users'){
            model = $scope.allSelected
          }
          if (role === 'parents'){
            model = $scope.allSelectedParent
          }
          if(model) {
            for(var i = 0; i < $scope.users.items.length; i++){
              if($scope.users.items[i].type === role){
                $scope.selectedUsers[$scope.users.items[i].id] = $scope.users.items[i];
              }

            }

          } else {
            if ($scope.openedFromStudents) {
              var pickedClassStudents = $scope.users.items.filter(function (obj) {
                return obj.class === $scope.classToSortBy;
              });
              for(var j = 0; j < pickedClassStudents.length; j++){
                if(pickedClassStudents[j].type === role){
                  delete $scope.selectedUsers[pickedClassStudents[j].id];
                }
              }
            } else {
              for(var j = 0; j < $scope.users.items.length; j++){
                if($scope.users.items[j].type === role){
                  delete $scope.selectedUsers[$scope.users.items[j].id];
                }
              }
            }

          }
        };

///////////////////////////
        $rootScope.$on('arrayOfSelectedUsers', function(event, value) {

          if(value) {
            $scope.showMembersHeader = false;
            $scope.ArrayOfVottersDissabled ='ready';
            $scope.userRole = 'parent';
            $scope.classToSortBy = 1;
            $scope.users.items = value.participants;

            for(var i = 0; i < $scope.users.items.length; i++){
              $scope.users.items[i].type= 'parent';
              $scope.users.items[i].class= 1;

            }
          }


          if(value.voted.length){
            $scope.selectedUsers =value.voted;
            $scope.selectedUsers=$scope.selectedUsers.reduce(function(result, item) {
              result[item.id] = item; //a, b, c
              return result;
            }, {});

          }
          else {
            $scope.selectedUsers={}
          }

        });
        /////////////////////////////////


        $rootScope.$on('arrayOfSeenBy', function(event, value) {
          if(value) {
            $scope.showMembersHeader = false;
            $scope.ArrayOfVottersDissabled ='ready';
            $scope.userRole = 'parent';
            $scope.classToSortBy = 1;
            $scope.users.items = value.seen_by;
            // console.log($scope.users.items);

            for(var i = 0; i < $scope.users.items.length; i++){
              $scope.users.items[i].type= 'parent';
              $scope.users.items[i].class= 1;
            }
          }
            $scope.selectedUsers={};
          // console.log( $scope.selectedUsers)

        });

        $rootScope.$on('arrayOfStudentWithoutParents', function(event, value) {
          if(value) {
            $scope.showMembersHeader = false;
            $scope.ArrayOfVottersDissabled ='ready';
            $scope.classToSortBy = 1;
            $scope.users.items = value;
            // console.log($scope.users.items);

            for(var i = 0; i < $scope.users.items.length; i++){
              $scope.users.items[i].type= 'parent';
              $scope.users.items[i].class= 1;
            }
          }
          $scope.selectedUsers={};
          // console.log( $scope.selectedUsers)

        });

        //////////////////////////////

        $scope.selectUser = function (user) {
          if($scope.ArrayOfVottersDissabled ==='ready'){
            return
          }
          if ($scope.selectedUsers[user.id]) {
            delete $scope.selectedUsers[user.id];
            // $rootScope.$broadcast('not-all-selected');
            $scope.allSelected = false;
          }
          else {
            if ($scope.singleRecipient) {
              $scope.selectedUsers = {};
            }
            $scope.selectedUsers[user.id] = user;
            $scope.areAllSelected();
          }
        };
        //////////////////////////////////////////////////////////////////////////////////////
        $rootScope.$on('invite-members-for-groups', function sendRequest(event, pickedClass, userRole, currentClassUsers) {
          $scope.classToSortBy = pickedClass.id;
          $scope.openedFromStudents = true;
          $scope.users.nextPage($scope.classToSortBy, userRole, currentClassUsers);
          $scope.areAllSelected();

          $rootScope.$$listeners['invite-members-for-groups'] = [sendRequest];
        });

        $scope.confirmAction = function (length) {
          if(length){
            var modalInstance = $uibModal.open({
              // animation: $ctrl.animationsEnabled,
              templateUrl: 'components/groups/confirmationModalGroups/confirmationModalGroups.html',
              controller: 'confirmationModalCroupsController',
              size: 'sm',
              resolve : {
                items : function () {
                  return $scope.invite;
                }
              }
            });
          }
        };


        $rootScope.$on('invite-students-to-group', function (event, groupId) {

          var arrayOfId = [];
          for(var key in $scope.selectedUsers) {
            arrayOfId.push(+key);
          }
          if(arrayOfId.length > 1) { $scope.invite = 'invite2'} else { $scope.invite = 'invite1' };


          $http.post(appSettings.link + 'group/invite', {"group_id": groupId, "users": arrayOfId})
            .success(function (response) {
              // $rootScope.$broadcast('student-added-to-class');
              $scope.confirmAction(arrayOfId.length);
              $log.log("STUDENTS ADDED SUCCESSFUL");
              for (var member in $scope.selectedUsers) delete $scope.selectedUsers[member];
            })
            .error(function (data) {
              $log.log("Code: " + data.status_code + "; Message: " + data.message);
            });

        });
        ////////////////////////////////////////////////////////////////////////////////////////

        $scope.areAllSelected = function () {

          var pickedClassStudents = $scope.users.items.filter(function (obj) {
            return obj.class === $scope.classToSortBy;
          });

          var idArray = [];
          for(var key in $scope.selectedUsers) {
            idArray.push(+key);
          }
          for(var i = 0; i < pickedClassStudents.length; i++){
            var element = idArray.indexOf(pickedClassStudents[i].id);
            // console.log(element);

            if(element === -1) {
              var notAll = true;
              $scope.allSelected = false;
            } else if(!notAll) {
              $scope.allSelected = true;
            }
            // console.log("1", pickedClassStudents);
            // console.log("2", idArray)
          }
        };

        $rootScope.$on('modal-opened-in-srudents', function(event, currentClassUsers){
          $scope.currentClassUsers = currentClassUsers;
          $scope.openedFromStudents = true;
        });

        $rootScope.$on('picked-another-class', function(event, pickedClass, currentClassUsers){
          $scope.classToSortBy = pickedClass.id;
          $scope.users.nextPage($scope.classToSortBy, $scope.userRole, currentClassUsers);
          $scope.areAllSelected();
        });

        $rootScope.$on('add-students-to-class', function(event){
          var arrayOfId = [];
          for(var key in $scope.selectedUsers) {
            arrayOfId.push(+key);
          }

          $http.post(appSettings.link + 'class/'+ $scope.currentClass +'/add/users', {'users': arrayOfId})
            .success(function (response) {
              $rootScope.$broadcast('student-added-to-class');
              $log.log("STUDENTS ADDED SUCCESSFUL");
            })
            .error(function (data) {
              $log.log("Code: " + data.status_code + "; Message: " + data.message);
            });
        });

        $rootScope.$on('u-can-render', function startRender() {
          $scope.areAllSelected();
          $rootScope.$$listeners['u-can-render'] = [startRender];
        });

        ////////////////////////////////////////////////////////////////////////////////////////

        // $rootScope.$on('add-distinguished-in-modal', function(event, data) {
        //     for(var i = 0; i < data.length; i++){
        //       $scope.selectUser(data[i]);
        //     }
        // });
        $rootScope.$on('add-to-distinguished-list', function distinguishStudents(event, start, end, currentClass) {

          $scope.arrayOfId = [];
          for(var key in $scope.selectedUsers) {
            $scope.arrayOfId.push(+key);
          }

          $http.post(appSettings.link + '/distinguished', {'user_ids': $scope.arrayOfId, 'class_id' : currentClass, 'week_start' : start, 'week_end' : end})
            .success(function (response) {
              $rootScope.$broadcast('need-to-be-reloaded', start, end, currentClass);
              $log.log("POST SUCCES");
            })
            .error(function (data) {
              $log.log("Code: " + data.status_code + "; Message: " + data.message);
            });
          $rootScope.$$listeners['add-to-distinguished-list'] = [];
        });
      }]
    }
  }]);
