app.controller('studentsController',
  ['$scope',
    '$rootScope',
    '$http',
    '$routeParams',
    'appSettings',
    'classData',
    '$timeout',
    '$uibModal',
    function ($scope, $rootScope, $http, $routeParams, appSettings, classData, $timeout, $uibModal) {
      $rootScope.activeClassItem = 1;

      $scope.list = false;
      $scope.studentsViewIsActive = true;

      $scope.students = [];
      $scope.pickedStudents = [];

      $scope.sortBy =  "First Name";
      $scope.sort = ["First Name", "Last Name", " Highest Grade", "Lowest Grade"];

      var role = $rootScope.user.data.role;

      $scope.hideCustomButton = true;

      $rootScope.$on('class-data-was-received', function () {
        if(!$rootScope.user.classData.classInArchived){
          $scope.hideCustomButton = false;
        }
        if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
          $scope.hideCustomButton = true;
        }

        if(Array.isArray($rootScope.user.classData.members)){
          $scope.students = $rootScope.user.classData.members;
          $scope.asTeacher = true;
        } else {
          $scope.asTeacher = false;
        }
        if($rootScope.user.data.id !== $rootScope.user.classData.owner) {
          $scope.contextMenu.items.forEach(function (obj) {
            obj.active = false;
          })
        }
      });

      $scope.currentUser = {
        'role': $rootScope.user.data.role,
        "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
        'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
        'background': $rootScope.user.data.role + '-background',
        'color': $rootScope.user.data.role + '-color',
        'border': $rootScope.user.data.role + '-border',
        'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
      };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      $scope.init = function () {
        $scope.getStudents();
        $scope.getRequestStudents();
      };

      $rootScope.$on('student-added-to-class', function (e) {
        $scope.getStudents();
      });

      $scope.changeSortBy = function (data) {
        $scope.sortBy = data;
        if($scope.sortBy == "First Name") {
          $rootScope.$broadcast("sort-by-changed", 'first_name');

        } else if($scope.sortBy == "Last Name") {
          $rootScope.$broadcast("sort-by-changed", 'second_name');

        } else if($scope.sortBy == " Highest Grade") {
          $rootScope.$broadcast("sort-by-changed", 'total_mark', 1);

        } else if($scope.sortBy == "Lowest Grade") {
          $rootScope.$broadcast("sort-by-changed", 'total_mark', 0);

        }
      };

      $scope.getRequestStudents = function () {
        $http.get(appSettings.link + 'class/' + $routeParams.classId + '/list/users/request')
          .success(function (response) {
            $scope.requestedStudents = response.data;
          })
          .error(function (data) {
            //console.log("Code: " + data.status_code + "; Message: " + data.message);
          });
      };

      $scope.getStudents = function () {
        $http.get(appSettings.link + 'class/' + $routeParams.classId + '/list/users')
          .success(function (response) {
            if (response) {
              if($scope.asTeacher){
                $scope.students = $rootScope.user.classData.members;
              } else {
                $scope.students = response.data;
              }

            }
          })
          .error(function (data) {
            //console.log("Code: " + data.status_code + "; Message: " + data.message);
          });
      };

      $scope.aceptReject = function (student, status) {
        var index = $scope.requestedStudents.indexOf(student);
        $scope.requestedStudents.splice(index, 1);

        $http.post(appSettings.link + 'class/' + $routeParams.classId + '/user/request', {'status' : status, 'user_id' : student.id})
          .success(function (response) {

            $scope.getStudents();
          })
          .error(function (data) {
            //console.log("Code: " + data.status_code + "; Message: " + data.message);
          });

      };

      $scope.displayChanged = function (list) {
        $rootScope.$broadcast("display-mode-changed", list);
      };

      $rootScope.$on('student-was-selected-in-students-all', function (event, student) {
        if($scope.pickedStudents.length) {
          $scope.contextMenu.items.forEach(function (obj) {
            obj.state = true;
          });

          if($scope.pickedStudents.length !== 1) {
            $scope.contextMenu.items[0].state = false;
          }
        } else {
          $scope.contextMenu.items.forEach(function (obj) {
            obj.state = false;
          });
        }

        $scope.selectedUser =  $scope.pickedStudents[0];
        $scope.studentInformation = $scope.pickedStudents[0];

      });


      $scope.addExistingStudent = function (size, parentSelector) {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/students/addExistingStudentModal/addExistingStudentModal.html',
          controller: 'addExistingStudentsModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          //appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.students;
            }
          }
        });
      };

      $scope.addStudentsFromPhoto = function (size, parentSelector) {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/students/addStudentsFromPhotoModal/addStudentsFromPhotoModal.html',
          controller: 'addStudentsFromPhotoModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          //appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });
      };

      $scope.addNewStudent = function (size, parentSelector) {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/students/addNewStudentModal/addNewStudentModal.html',
          controller: 'addNewStudentModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          //appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.items;
            },
            fromPhoto: function () {
              return false;
            }
          }
        });
      };

      $(document).ready(function () {
        $(document).on('mouseenter', '.button-inside', function () {
          $(this).find(".img-hover").show();
        }).on('mouseleave', '.button-inside', function () {
          $(this).find(".img-hover").hide();
        });
      });

      $scope.data = {
        'items': [
          {
            'img': 'images/students/student-from-photo_3x.png',
            'imgHover': 'images/hover_img/student-from-photo.png',
            'text': 'Add student from photo',
            'click': $scope.addStudentsFromPhoto
          },
          {
            'img': 'images/students/existing-student_3x.png',
            'imgHover': 'images/hover_img/existing-student.png',
            'text': 'Add existing student',
            'click': $scope.addExistingStudent
          },
          {
            'img': 'images/students/new-student_3x.png',
            'imgHover': 'images/hover_img/new-student.png',
            'text': 'Add new student',
            'click': $scope.addNewStudent
          }
        ]
      };

      ///==============================================================================================================

      $scope.clear = function () {
        $scope.contextMenu.items.forEach(function (obj) {
          obj.state = false;
        });
        $scope.pickedStudents=[];
        $scope.students.forEach(function (obj) {
          obj.state = false;
        });
      };
      $scope.openAreUSureModal = function (size) {
        var modalInstance = $uibModal.open({
          // animation: $ctrl.animationsEnabled,
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

      $scope.editStudent = function () {

        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/students/addNewStudentModal/addNewStudentModal.html',
          controller: 'addNewStudentModalInstanceCtrl',
          controllerAs: '$ctrl',
          // size: size,
          //appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.pickedStudents[0].id;
            },
            fromPhoto: function () {
              return false;
            }
          }
        });

          // var modalInstance = $uibModal.open({
          //   animation: $scope.animationsEnabled,
          //   ariaLabelledBy: 'modal-title',
          //   ariaDescribedBy: 'modal-body',
          //   templateUrl: 'components/profile/editProfileModal/editProfileModal.html',
          //   controller: 'editProfileModalInstanceCtrl',
          //   controllerAs: '$ctrl',
          //   resolve: {
          //     items: function () {
          //       return $scope.pickedStudents[0].id;
          //     },
          //     fromPhoto: function () {
          //       return false;
          //     }
          //   }
          // });

        $rootScope.$on('user-was-updated', function (event) {
          $scope.getStudents();
          $scope.clear();
        });

      };

      $scope.shareStudent = function () {
        $scope.shareS = false;
        $uibModal.open({
          templateUrl: 'components/class/dashboard/students/shareStudentsModal/shareStudents.html',
          controller: 'shareStudentsController',
          size: 'sm',
          resolve: {
            items: function () {
              return false;
            }
          }
        });

        $rootScope.$on('share-students', function share(event, email) {

          var idArr = [];
          $scope.pickedStudents.forEach(function (obj) {
            idArr.push(obj.id)
          });

          if(!$scope.shareS){
            $scope.shareS = true;
            $http.post('http://api.classdig.com/class/share-students', {'users' : idArr, 'email' : email})
            //$http.post('http://loc.classdig.com/class/share-students', {'users' : idArr, 'email' : email})
              .success(function (responce) {
                $uibModal.open({
                  templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                  controller: 'confirmationModalController',
                  size: 'sm',
                  resolve : {
                    items : function () {
                      return 'Students were successfully shared.';
                    }
                  }
                });

                $scope.clear();
              })
              .error(function (error) {
                $uibModal.open({
                  templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                  controller: 'confirmationModalController',
                  size: 'sm',
                  resolve : {
                    items : function () {
                      return 'No such e-mail in our system.';
                    }
                  }
                });
                $scope.clear();
              });
          }


          $rootScope.$$listeners['share-students'] = [share];
          $rootScope.$$listeners['share-students'].splice(0, 1);
        })

      };

      $scope.moveStudent = function () {
        $scope.moveS = false;
        $scope.modalInstance = $uibModal.open({
          templateUrl: 'components/class/dashboard/students/choseClass/choseClass.html',
          controller: 'ModalMessageInstanceCtrl',
          controllerAs: '$ctrl',
          scope: $scope,
          resolve : {
            items: function () {
              return $scope.pickedStudents;
            }
          }
        });
        $scope.$on('can-move-students', function move(event, classID) {
          var idArr = [];
          $scope.pickedStudents.forEach(function (obj) {
            idArr.push(obj.id)
          });
          if(!$scope.moveS) {
            $scope.moveS = true;
            $http.post('http://api.classdig.com/class/move-students', {'users' : idArr, 'class_id' : classID})
            // $http.post('http://loc.classdig.com/class/move-students', {'users' : idArr, 'class_id' : classID})
              .success(function (response) {
                $uibModal.open({
                  templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                  controller: 'confirmationModalController',
                  size: 'sm',
                  resolve : {
                    items : function () {
                      return 'Students were successfully moved.';
                    }
                  }
                });
                idArr.forEach(function (id) {
                  var student = $scope.students.find(function (obj) {
                    return obj.id === id;
                  });
                  var index = $scope.students.indexOf(student);
                  $scope.students.splice(index, 1);
                });
                $scope.clear();
              })
              .error(function (error) {
                $uibModal.open({
                  templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                  controller: 'confirmationModalController',
                  size: 'sm',
                  resolve : {
                    items : function () {
                      return 'Students are already in picked class.';
                    }
                  }
                });
                $scope.clear();
              });
          }

          $rootScope.$$listeners['can-move-students'] = [move];
          $rootScope.$$listeners['can-move-students'].splice(0, 1);
        })
      };

      $scope.deleteStudent = function () {
        $scope.modalContext = {
          'action' : 'deleteStudent',
          'actionTitle' : 'delete',
          'students' : $scope.pickedStudents,
          'fromStudents' : true
        };
        $scope.openAreUSureModal('sm');

        $rootScope.$on('deleteStudent', function deleteStudent() {
          var idArr = [];
          $scope.pickedStudents.forEach(function (obj) {
            idArr.push(obj.id)
          });

          $http({
            method: 'delete',
            url: appSettings.link + 'class/remove-users',
            headers: {'Content-Type': 'application/json'},
            data : {"class_id": $routeParams.classId, 'users' : idArr}
          })
            .success(function (response) {

              var arr = $scope.students.filter(function (obj) {
                return obj.state === false || !obj.state;
              });
              $scope.students = arr;
              $scope.clear();
            })
            .error(function () {

            });
          $rootScope.$$listeners['deleteStudent'] = [deleteStudent];
          $rootScope.$$listeners['deleteStudent'].splice(0, 1);
        })
      };

      $rootScope.$on('action-was-not-approved', function () {
        $scope.clear();
      });

      $scope.contextMenu = {
        'items': [
          {
            'img': 'images/context_menu/icon-edit-' + role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-edit-default_3x.png',
            'imgHover' : 'images/context_menu/icon-edit-hover_3x.png',
            'state' : false,
            'active' : true,
            'text': 'Edit',
            'multiSelect': false,
            'click': $scope.editStudent
          },
          {
            'img': 'images/context_menu/icon-recover-' + role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-recover-default_3x.png',
            'imgHover' : 'images/context_menu/icon-recover-hover_3x.png',
            'state' : false,
            'active' : true,
            'text': 'Share',
            'multiSelect': ['teacher', 'student', 'parents'],
            'singleSelect': ['teacher', 'student', 'parents'],
            'click': $scope.shareStudent
          },
          {
            'img': 'images/context_menu/icon-share-' + role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-share-default_3x.png',
            'imgHover' : 'images/context_menu/icon-share-hover_3x.png',
            'state' : false,
            'active' : true,
            'text': 'Move',
            'multiSelect': ['teacher', 'student', 'parents'],
            'singleSelect': ['teacher', 'student', 'parents'],
            'click': $scope.moveStudent

          },
          {
            'img': 'images/context_menu/icon-delete-' + role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
            'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
            'state' : false,
            'active' : true,
            'text': 'Delete',
            'multiSelect': ['teacher', 'student'],
            'singleSelect': ['teacher', 'student'],
            'click': $scope.deleteStudent
          }
        ]
      };




    }])
    .filter('filterBySearch', function() {
      return function(studentsArr, searchBy) {
        if(searchBy && searchBy.length){
          return studentsArr.filter(function (obj) {
            if(obj['first_name'].toLowerCase().indexOf(searchBy) !== -1 || obj['last_name'].toLowerCase().indexOf(searchBy) !== -1){
              return obj;
            }
          });
        } else {
          return studentsArr;
        }
      }
    });
