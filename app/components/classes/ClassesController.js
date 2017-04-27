app.controller('ClassesController', ['$scope',
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
  'behaviorPreParser',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _, behaviorPreParser ) {

    $scope.configChart = {
      "attendanceLabels": ["Present", "Late", "Absent"],
      "attendanceBackgroundColor": ['#1ea66d', '#ffc600', '#f93640'],
      options: {
        tooltips: {enabled: false},
        animation: {duration: 0},
        legend: {display: false},
        line: {borderWidth: 0},
        elements: {arc: {borderWidth: 0}}
      }
    };
    $scope.configDiagram = {
      chart: {
        type: 'discreteBarChart',
        height : 110,
        showValues: true,
        duration: 500,
        showXAxis : false,
        margin : {
          top: 5,
          right: 20,
          bottom: 10,
          left: 20
        },
        tooltip : {
          enabled : false
        },
        xAxis: {
          axisLabel: ''
        },
        yAxis: {
          axisLabel: ''
          // ticks: 2
        },
        valueFormat: function(d){
          return d3.format(',.0f')(d);
        },
        x: function(d){return d.label;},
        y: function(d){return d.value + (1e-10);}
      }
    };
    $scope.userInfo = {
      'iconAddFile': 'images/files-library/icon-addfile-' + $rootScope.user.data.role + '.svg',
      'iconCreateFolder': 'images/files-library/icon-createfolder-' + $rootScope.user.data.role + '.svg',
      'iconFolder': 'images/files-library/icon-folder-' + $rootScope.user.data.role + '.svg',
      'iconArrowBack': 'images/files-library/icon-arrow-back-' + $rootScope.user.data.role + '.svg',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'background': $rootScope.user.data.role + '-background',
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png'
    };

    var $ctrl = this;
    var role = $scope.role = $rootScope.user.data.role ;

    $scope.showChildren = $rootScope.user.data.role ==='parent';
    $scope.selection = {selectedItems: [], currentItem: []};

    $scope.classesNotExist = false;
    $scope.achivedNotExist = false;
    $scope.activeContext = false;

    $scope.hideArchived = true;
    $scope.hideDeleted = true;

    $scope.classesItems = {};

    $scope.archivedClasses = {};
    $scope.currentClasses = [];
    $scope.deletedClasses = [];

    // $scope.sortArchived = function () {
    //   if(role === 'parent' && $scope.archivedClasses.length){
    //     for(var i = 0; i < $scope.archivedClassesConst.length; i++){
    //       $scope.archivedClasses[i].classes =  $scope.archivedClassesConst[i].classes.filter(function (obj) {
    //         if(obj.members.length){
    //           return obj
    //         }
    //       });
    //     }
    //   }
    //   console.log($scope.archivedClasses);
    // };

    $http.get(appSettings.link + 'shared-users')
      .success(function (responce) {
        $scope.sharedUsers = [];
        responce.data.forEach(function (obj) {
          $scope.sharedUsers.push(obj.user);
        });
      });

    $scope.accept = function () {
      $scope.accepting = true;
      $scope.modalInstance = $uibModal.open({
        templateUrl: 'components/class/dashboard/students/choseClass/choseClass.html',
        controller: 'ModalMessageInstanceCtrl',
        controllerAs: '$ctrl',
        scope: $scope,
        resolve: {
          items: function () {
            return $scope.sharedUsers;
          }
        }
      });


        $scope.$on('can-move-students', function (event, classID) {
          var idArr = [];
          $scope.sharedUsers.forEach(function (obj) {
            idArr.push(obj.id)
          });
          if($scope.accepting){
            $scope.accepting = false;
          $http.post(appSettings.link + 'class/share-students/accept', {'users': idArr, 'class_id': classID})
            .success(function (response) {
              $scope.sharedUsers = [];
              $uibModal.open({
                templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                controller: 'confirmationModalController',
                size: 'sm',
                resolve: {
                  items: function () {
                    return 'Students were successfully accepted.';
                  }
                }
              });
              var element = $scope.currentClasses.find(function (obj) {
                return obj.id === classID;
              });
              element.members += idArr.length;
            })
            .error(function () {
              $uibModal.open({
                templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                controller: 'confirmationModalController',
                size: 'sm',
                resolve: {
                  items: function () {
                    return 'Students are already in class.';
                  }
                }
              });
            });
          }
        });

    };

    $scope.reject = function(student) {
        $scope.modalContext = {
          'action' : 'rejectStudents',
          'actionTitle' : 'reject',
          'students' : [student],
          'fromStudents' : false
        };
        $scope.openAreUSureModal('sm');

        $rootScope.$on('rejectStudents', function rej() {
          $http({
            method: 'delete',
            url: appSettings.link + 'class/share-students/decline',
            headers: {'Content-Type': 'application/json'},
            data : {'users' : [student.id]}
          })
            .success(function (response) {
              var rejStud = $scope.sharedUsers.find(function (obj) {
                return obj.id === student.id;
              });
              if(rejStud) {
                var index = $scope.sharedUsers.indexOf(rejStud);
                $scope.sharedUsers.splice(index, 1);
              }
              $rootScope.$$listeners['rejectStudents'] = [rej];
              $rootScope.$$listeners['rejectStudents'].splice(0, 1);
            })
            .error(function () {

            })
        })
      };

///////////////////////////////////////////////////////////////////////////

    //HELPING
    // $scope.formChildrenArray = function () {
    //   if($scope.currentView === 'archived'){
    //     $scope.arrayOfChildrenId = $scope.arrayOfChildrenIdArchived;
    //   } else if($scope.currentView === 'current') {
    //     $scope.arrayOfChildrenId = $scope.arrayOfChildrenIdCurrent;
    //   } else if($scope.currentView === 'deleted'){
    //     $scope.arrayOfChildrenId = $scope.arrayOfChildrenIdDeleted;
    //   }
    //   if($scope.arrayOfChildrenId.indexOf($scope.childName) !== -1){
    //     $scope.childName = $scope.childName || $scope.arrayOfChildrenId[0];
    //   } else {
    //     $scope.childName = $scope.arrayOfChildrenId[0];
    //   }
    //   $scope.changeCountClass();
    // };

    // $scope.sortOnlyChildrenClasses = function () {
    //   $scope.arrayOfMembers = [];
    //   $scope.arrayOfChildrenId=[];
    //   $scope.arrayOfChildrenIdCurrent=[];
    //   $scope.arrayOfChildrenIdDeleted=[];
    //   $scope.arrayOfChildrenIdArchived=[];
    //
    //   $scope.arrayOfMembersCurrent = _.pluck($scope.currentClasses, 'members');
    //   $scope.arrayOfMembersDeleted = _.pluck($scope.deletedClasses, 'members');
    //   $scope.arrayOfMembersArchived = [];
    //   for(var key in $scope.archivedClasses) {
    //     $scope.arrayOfMembersArchived = $scope.arrayOfMembersArchived.concat(_.pluck($scope.archivedClasses[key], 'members'));
    //   }
    //   // for(var i = 0; i < $scope.archivedClasses.length; i++) {
    //   //   $scope.arrayOfMembersArchived = $scope.arrayOfMembersArchived.concat(_.pluck($scope.archivedClasses[i].classes, 'members'));
    //   // }
    //   console.log('arrayOfMembersArchived', $scope.arrayOfMembersArchived)
    //   console.log('arrayOfMembersCurrent', $scope.arrayOfMembersCurrent)
    //
    //   if(typeof ($scope.arrayOfMembersCurrent[0])==='object') {
    //     for (var i = 0; i < $scope.arrayOfMembersCurrent.length; i++) {
    //       var newClass = _.pluck($scope.arrayOfMembersCurrent[i], 'first_name');
    //       $scope.arrayOfChildrenIdCurrent = $scope.arrayOfChildrenIdCurrent.concat(newClass);
    //     }
    //     $scope.arrayOfChildrenIdCurrent = _.uniq($scope.arrayOfChildrenIdCurrent);
    //   }
    //
    //   if(typeof ($scope.arrayOfMembersDeleted[0])==='object') {
    //     for (var i = 0; i < $scope.arrayOfMembersDeleted.length; i++) {
    //       var newClass = _.pluck($scope.arrayOfMembersDeleted[i], 'first_name');
    //       $scope.arrayOfChildrenIdDeleted= $scope.arrayOfChildrenIdDeleted.concat(newClass);
    //     }
    //     $scope.arrayOfChildrenIdDeleted = _.uniq($scope.arrayOfChildrenIdDeleted);
    //   }
    //
    //   if(typeof ($scope.arrayOfMembersArchived[0])==='object') {
    //     for (var i = 0; i < $scope.arrayOfMembersArchived.length; i++) {
    //       var newClass = _.pluck($scope.arrayOfMembersArchived[i], 'first_name');
    //       $scope.arrayOfChildrenIdArchived = $scope.arrayOfChildrenIdArchived.concat(newClass);
    //     }
    //     $scope.arrayOfChildrenIdArchived = _.uniq($scope.arrayOfChildrenIdArchived);
    //   }
    //
    //   if(role === 'parent'){
    //     if(!$scope.arrayOfChildrenIdDeleted.length) {
    //       $scope.deletedClasses = [];
    //     }
    //     if(!$scope.arrayOfChildrenIdArchived.length) {
    //       $scope.archivedClasses = [];
    //     }
    //   }
    // };

    $scope.catClassesNames = function (classes) {
      for(var i = 0; i < classes.length; i++) {
        if(classes[i].name. length > 12) {
          classes[i].cated_name = classes[i].name.substring(0, 13) + "...";
        } else {
          classes[i].cated_name = classes[i].name;
        }
      }
    };

    $scope.clear = function () {
      $scope.selection = {selectedItems: [], currentItem: []};
      for (var i = 0; i < $scope.contextMenu.items.length; i++){
        $scope.contextMenu.items[i].state = false;
      }
    };

    // hides the class if there no parents kids in it
    // $scope.showChildrenClass = function(obj){
    //   var visible = false;
    //   for(var i=0;i<obj.members.length;i++){
    //     if(obj.members[i].first_name == $scope.childName){
    //       visible= true;
    //       break;
    //     }
    //   }
    //   return visible
    // };

    //helps to count students when parent flow is active
    $scope.changeCountClass = function () {
      $scope.countClass = 0;
      if($scope.currentView == 'current'){
        $scope.countClass = $scope.currentClasses.length;
        // for(var i = 0; i <  $scope.currentClasses.length; i++) {
        //   for(var j = 0; j < $scope.currentClasses[i].members.length; j++){
        //     if( $scope.currentClasses[i].members[j].first_name == $scope.childName){
        //       $scope.countClass++
        //     }
        //   }
        // }
      } else if($scope.currentView == 'deleted'){
        $scope.countClass = $scope.deletedClasses.length;
        // for(var i = 0; i <  $scope.deletedClasses.length; i++) {
        //   for(var j = 0; j < $scope.deletedClasses[i].members.length; j++){
        //     if( $scope.deletedClasses[i].members[j].first_name == $scope.childName){
        //       $scope.countClass++
        //     }
        //   }
        // }
      } else if($scope.currentView == 'archived'){
        for(var key in $scope.archivedClasses) {
          $scope.countClass +=$scope.archivedClasses[key].length;
        }
        // for(var i = 0; i < $scope.archivedClasses.length; i++){
        //   for(var j = 0; j < $scope.archivedClasses[i].classes.length; j++){
        //     for(var k = 0; k < $scope.archivedClasses[i].classes[j].members.length; k++){
        //       if($scope.archivedClasses[i].classes[j].members[k].first_name == $scope.childName){
        //         $scope.countClass++;
        //       }
        //     }
        //   }
        // }
      }
    }; // todo FIX

    //classes manipulation
    $scope.helpToUnarchive = function () {
      function findElement(obj) {
        return obj.id === $scope.selection.selectedItems[i];
      }
      for(var i = 0; i < $scope.selection.selectedItems.length; i++){
        for(var key in $scope.archivedClasses) {
          var neededItem = $scope.archivedClasses[key].find(findElement);
          if (neededItem) {
            var index = $scope.archivedClasses[key].indexOf(neededItem);
            $scope.archivedClasses[key].splice(index, 1);
            $scope.currentClasses.unshift(neededItem);
          }
        }
      }
      $scope.countClass = 0;
      for(var key in $scope.archivedClasses){
        $scope.countClass += $scope.archivedClasses[key].length
      }
      if($scope.countClass === 0){
        $scope.hideArchived = true;
        $scope.archivedClasses = {};
        $scope.changeView('current');
      }
    };
    $scope.helpToArchive = function () {
      function findElement(obj) {
        return obj.id === $scope.selection.selectedItems[i];
      }
      for(var i = 0; i < $scope.selection.selectedItems.length; i++){
        var neededItem = $scope.currentClasses.find(findElement);
        var index = $scope.currentClasses.indexOf(neededItem);
        // var neededSemester = $scope.archivedClasses.find(function (obj) {
        //   return  obj.name === neededItem.semester.name
        // });

        // console.log('--->', neededSemester);

        $scope.currentClasses.splice(index, 1);
        if(! $scope.archivedClasses)  $scope.archivedClasses = {};
        if(!$scope.archivedClasses[neededItem.semester.name]) $scope.archivedClasses[neededItem.semester.name] = [];
        $scope.archivedClasses[neededItem.semester.name].unshift(neededItem);

        // if(neededSemester){
        //   neededSemester.classes.push(neededItem);
        // } else {
        //   var unnamed = $scope.archivedClasses.find(function (obj) {
        //     return obj.name == 'unnamed semesters'
        //   });
        //   if(unnamed && neededItem){
        //     unnamed.classes.push(neededItem);
        //   } else {
        //     var obj = {};
        //     obj.classes = [];
        //     obj.name = neededItem.semester.name;
        //     if(obj.name === "") obj.name = 'unnamed semesters';
        //     obj.classes.push(neededItem);
        //     $scope.archivedClasses.push(obj);
        //   }
        // }
      }
      console.log("ARCHIVED CLASSES AFTER ARCHIVATION", $scope.archivedClasses);
      $scope.countClass -= $scope.selection.selectedItems.length;
      if(!$scope.currentClasses.length){
        $scope.countClass = 0;
        $scope.classesNotExist = true;
      }
    };
    //........

    //CONTEXT MENU CONTROLLS
    $scope.selectionWasChanged = function (currentClass) {
      if(!currentClass.reports) {
        $q.all([
          $http.get(appSettings.link + 'class/' + currentClass.id + '/reports'),
          $http.get(appSettings.link + 'behavior/' + currentClass.owner)
        ]).then(function (values) {
          currentClass.reports = {};

          if( values[0].data.data.grade.averageMark)  currentClass.reports.grade =  values[0].data.data.grade.averageMark.toFixed(2);
          currentClass.reports.attendance = [0, 0, 0];
          currentClass.reports.attendance[0] =  values[0].data.data.attendance.present;
          currentClass.reports.attendance[1] =  values[0].data.data.attendance.late;
          currentClass.reports.attendance[2] =  values[0].data.data.attendance.absent;
          if( values[0].data.data.behavior.length && values[1].data.data.length){

            currentClass.reports.positiveBehavior = behaviorPreParser.generateDataForDiagram(values[1].data.data, 1);
            currentClass.reports.negativeBehavior = behaviorPreParser.generateDataForDiagram(values[1].data.data, 2);

            for(var i = 0; i <  values[0].data.data.behavior.length; i++){
              if( values[0].data.data.behavior[i].name === "Positive") {
                var elem =  currentClass.reports.positiveBehavior[0].values.find(function (obj) {
                  return obj.label ===  values[0].data.data.behavior[i].description
                });
                elem.value =  values[0].data.data.behavior[i].total;
              } else {
                elem = currentClass.reports.negativeBehavior[0].values.find(function (obj) {
                  return obj.label ===  values[0].data.data.behavior[i].description
                });
                elem.value =  values[0].data.data.behavior[i].total;
              }
            }
          }

        });
      }

      $timeout(function () {
        if(role === 'teacher' || role === 'parent'){
          if($scope.selection.selectedItems.length === 1) {
            for (var i = 0; i < $scope.contextMenu.items.length; i++){
              $scope.contextMenu.items[i].state = true;
            }
          } else if($scope.selection.selectedItems.length === 0) {
            for (var i = 0; i < $scope.contextMenu.items.length; i++){
              $scope.contextMenu.items[i].state = false;
            }
          } else {
            $scope.contextMenu.items[0].state = false;
          }
        } else if(role === 'student'){
          var teacherClassInSelection = false;

          function findElement(obj) {
            return obj.id === $scope.selection.selectedItems[i];
          }
          if($scope.currentView === 'current'){
            for(var i = 0; i < $scope.selection.selectedItems.length; i++) {
              var neededItem = $scope.currentClasses.find(findElement);
              if(neededItem.owner !== AuthenticationService.getUserId()) {
                teacherClassInSelection = true;
              }
            }
          } else if($scope.currentView === 'deleted'){
            for(var i = 0; i < $scope.selection.selectedItems.length; i++) {
              var neededItem = $scope.deletedClasses.find(findElement);
              if(neededItem.owner !== AuthenticationService.getUserId()) {
                teacherClassInSelection = true;
              }
            }
          } else if($scope.currentView === 'archived') {
            for(var i = 0; i < $scope.selection.selectedItems.length; i++){
              for(var key in $scope.archivedClasses){
                neededItem = $scope.archivedClasses[key].find(findElement);
                if(neededItem.owner !== AuthenticationService.getUserId()) {
                  teacherClassInSelection = true;
                }
              }
            }
          }
          if($scope.selection.selectedItems.length === 1) {
            if(!teacherClassInSelection){
              for (var i = 0; i < $scope.contextMenu.items.length; i++){
                $scope.contextMenu.items[i].state = true;
              }
            } else {
              $scope.contextMenu.items[3].state = true;
            }
          } else if($scope.selection.selectedItems.length === 0) {
            for (var i = 0; i < $scope.contextMenu.items.length; i++){
              $scope.contextMenu.items[i].state = false;
            }
          } else {
            if(!teacherClassInSelection){
              for (var i = 0; i < $scope.contextMenu.items.length; i++){
                $scope.contextMenu.items[i].state = true;
              }
              $scope.contextMenu.items[0].state = false;
            } else {
              for (var i = 0; i < $scope.contextMenu.items.length; i++){
                $scope.contextMenu.items[i].state = false;
              }
              $scope.contextMenu.items[3].state = true;
            }
          }
        }
      })
    };
    //......................

    $scope.changeChildren = function(child){
      $scope.childName = child.first_name;
      $scope.childId = child.id;

      child.cur.clear();
      $scope.cur = child.cur;

      // $scope.del = child.del;
      // if($scope.arrayOfChildrenIdDeleted.indexOf($scope.childName) == -1){
      //   $scope.hideDeleted = true;
      // } else if(role !== '') $scope.hideDeleted = false;
      // if($scope.arrayOfChildrenIdArchived.indexOf($scope.childName) == -1){
      //   $scope.hideArchived = true
      // } else $scope.hideArchived = false;

      $timeout(function () {
        angular.element('.children').css('border-bottom','2px solid white');
        angular.element('#'+ $scope.childName ).css('border-bottom','2px solid rgb(207, 81, 93)');
      });
      $scope.requestUrlsConfig();
      $scope.loadClasses();



      // $scope.sortArchived();
      // $scope.changeCountClass();
    }; //TODO FIX

    // INIT AND REQUESTS, PREPEARING & PARSING DATA
    $scope.environmentConfig = function () {
      if(role === 'teacher' || role === 'student'){
        $scope.contextMenu.items[0].active = true;
        $scope.contextMenu.items[1].active = true;
        $scope.contextMenu.items[3].active = true;
        $scope.contextMenu.items[5].active = true;
        if(role ==='teacher'){
          $scope.roleColor = '#4785d6';
          $scope.data = {
            'items': [],
            'onGlobalButtonClick': $ctrl.openModal
          };
        } else if(role ==='student'){
          $scope.roleColor = '#429c87';
          angular.element('.modal-content').addClass('joinClass');
          $scope.data = {
            'items': [
              {
                'img': 'images/classes/icon-student-join-class.svg',
                'text': 'Join a class',
                'click': $ctrl.openModalJoinClass
              },
              {
                'img': 'images/classes/icon-student-create-class.svg',
                'text': 'Create new class',
                'click': $ctrl.openModal
              }
            ],
            'onGlobalButtonClick': ''
          };
        }
      } else  {
        $scope.contextMenu.items[3].active = false;
        $scope.roleColor = '#cf515d';
        $scope.data = {
          'items': [],
          'onGlobalButtonClick': $ctrl.openModalJoinClass
        };
      }
    };
    $scope.requestUrlsConfig = function () {
      if($rootScope.user.data.role === 'parent') {
        $scope.childrenArray = $rootScope.user.data.children.data;
        $scope.configCurrent = '?user_id=' + $scope.childId + '&status=1';
        $scope.configDeleted = '?user_id=' + $scope.childId + '&status=3';
        $scope.configArchived = '?user_id=' + $scope.childId;

      } else {
        $scope.configCurrent = '?status=1';
        $scope.configDeleted = '?status=3';
        $scope.configArchived = '';
      }
    };
    $scope.loadClasses = function () {
      $q.all([
        $http.get(appSettings.link + 'class' + $scope.configCurrent),
        $http.get(appSettings.link + 'class' + $scope.configDeleted),
        $http.get(appSettings.link + 'class/archived' + $scope.configArchived)
      ]).then(function (values) {

        $scope.currentClasses = values[0].data.data;
        $scope.deletedClasses = values[1].data.data;
        $scope.archivedClasses = values[2].data;
        if(!values[2].data.length) $scope.archivedClasses = {};


        console.log("RIGHT FROM REQUEST -->", $scope.archivedClasses);

        if(!$scope.currentClasses.length) $scope.classesNotExist = true;
        if($scope.deletedClasses.length) $scope.hideDeleted = false;
        if(Object.keys($scope.archivedClasses).length) $scope.hideArchived = false;
        // else {
        //   $scope.classesNotExist = false;
        // }

        $scope.catClassesNames($scope.currentClasses);
        $scope.catClassesNames($scope.deletedClasses);
        for(var key in $scope.archivedClasses) {
          $scope.catClassesNames($scope.archivedClasses[key]);
        };

        // $scope.sortClasses($scope.deletedClasses);
        // $scope.sortClasses($scope.currentClasses);

        // $scope.sortOnlyChildrenClasses();

        $scope.changeCountClass();

        if(role === 'parent'){  $scope.hideDeleted = true;  $scope.deletedClasses = [];}
        if(role === 'student'){
          for(var i = 0; i < $scope.deletedClasses.length; i++){
            if($scope.deletedClasses[i].owner !== AuthenticationService.getUserId()){
              var index = $scope.deletedClasses.indexOf($scope.deletedClasses[i]);
              $scope.deletedClasses.splice(index, 1);
            }
          }
        }
      });
    };

    $scope.paginationObjectsFabric = function () {
      if(role === 'parent') {
        $scope.childrenArray.forEach(function (obj) {
          obj.cur = new CurrentClasses(obj.id);
          obj.del = new DeletedClasses(obj.id);
        });

      } else {
        $scope.cur = new CurrentClasses();
        $scope.del = new DeletedClasses();
      }
    };

    $scope.init = function () {

      $scope.requestUrlsConfig();

      $scope.paginationObjectsFabric();

      if($rootScope.user.data.role === 'parent' && !$scope.childId) $scope.changeChildren($rootScope.user.data.children.data[0])
      else $scope.loadClasses();

      $scope.changeView('current');

      $scope.environmentConfig();
    }; //TODO FIX
    //............................................

    //NAVIGATION


    $scope.changeView = function (name) {
      // console.log(name);
      $scope.currentView = name;
      // if(role === 'parent'){
        // $scope.formChildrenArray();
        // $scope.changeChildren($scope.childName);
        // $scope.changeCountClass();
      // }
      $timeout(function () {
        angular.element('.classes-subheader-item').css('border-bottom','2px solid white');
        angular.element('.classes-subheader-item').css('color', $scope.roleColor);
        angular.element('#'+name).css('border-bottom','2px solid' + $scope.roleColor);
        angular.element('#'+name).css('color', $scope.roleColor);
      });


      for (var i = 0; i < $scope.contextMenu.items.length; i++){
        $scope.contextMenu.items[i].active = false;
      }
      if(name === 'current') {
        if(role === 'parent' && $scope.currentClasses.length) {
          // $scope.contextMenu.items[3].active = false;
          $scope.changeCountClass();
        } else if(role !== 'parent' && $scope.currentClasses.length){
          $scope.contextMenu.items[0].active = true;
          $scope.contextMenu.items[1].active = true;
          $scope.contextMenu.items[3].active = true;
          $scope.contextMenu.items[5].active = true;
          $scope.countClass = $scope.currentClasses.length
        }
      } else if(name === 'archived') {
        if(role === 'parent' && !_.isEmpty($scope.archivedClasses)) {
          // $scope.contextMenu.items[3].active = false;
          $scope.changeCountClass();
        } else if(role !== 'parent' && !_.isEmpty($scope.archivedClasses)){
          $scope.contextMenu.items[2].active = true;
          $scope.contextMenu.items[7].active = true;
          $scope.countClass = 0;
          for(var key in $scope.archivedClasses){
            $scope.countClass += $scope.archivedClasses[key].length
          }
        }
      } else {
        // if(!$scope.del){
        //   $scope.del = new DeletedClasses();
        // }
        if(role === 'parent' && $scope.deletedClasses.length) {
          // $scope.contextMenu.items[3].active = true;
          $scope.changeCountClass();
        } else if(role !== 'parent' && $scope.deletedClasses.length) {
          $scope.contextMenu.items[4].active = true;
          $scope.contextMenu.items[6].active = true;
          $scope.countClass = $scope.deletedClasses.length
        }
      }
      $scope.clear();
    }; //TODO FIX
    //..........

    //MANIPULATION WITH CLASSES
    $scope.deleteClass = function () {

      $scope.modalContext = {
        'action' : 'deleteClass',
        'actionTitle' : 'delete',
        'fromClasses' : true,
        'selection' : $scope.selection.selectedItems,
        'current' : $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('deleteClass', function () {
        $http({
          method: 'delete',
          url: appSettings.link + 'class',
          headers: {'Content-Type': 'application/json'},
          data : {"class_id": $scope.selection.selectedItems}
        })
          .success(function (response) {

            function findElement(obj) {
              return obj.id === $scope.selection.selectedItems[i];
            }
            for(var i = 0; i < $scope.selection.selectedItems.length; i++) {
              var neededItem = $scope.deletedClasses.find(findElement);
              var index = $scope.deletedClasses.indexOf(neededItem);
              $scope.deletedClasses.splice(index, 1);
            }
            $scope.countClass = $scope.deletedClasses.length;
            if(!$scope.deletedClasses.length) $scope.hideDeleted = true; $scope.changeView('current');
            $scope.clear();
          })
          .error(function () {

          })
      })
    };
    $scope.recoverClass = function () {

      $scope.modalContext = {
        'action' : 'recoverClass',
        'fromClasses' : true,
        'actionTitle' : 'recover',
        'selection' : $scope.selection.selectedItems,
        'current' : $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('recoverClass', function () {
        $http.post(appSettings.link + 'class/recovery', {"class_id": $scope.selection.selectedItems})
          .success(function (response) {
            function findElement(obj) {
              return obj.id === $scope.selection.selectedItems[i];
            }
            for(var i = 0; i < $scope.selection.selectedItems.length; i++) {
              var neededItem = $scope.deletedClasses.find(findElement);
              var index = $scope.deletedClasses.indexOf(neededItem);
              $scope.deletedClasses.splice(index, 1);
              $scope.currentClasses.unshift(neededItem);
            }
            $scope.countClass = $scope.deletedClasses.length;
            $scope.classesNotExist =false;
            if(!$scope.deletedClasses.length) $scope.hideDeleted = true; $scope.changeView('current');
            // $scope.sortClasses($scope.currentClasses);
            $scope.clear();
          })
          .error(function () {

          })
      });
    };
    $scope.archiveClass = function () {
      $scope.modalContext = {
        'action' : 'archiveClass',
        'fromClasses' : true,
        'actionTitle' : 'archive',
        'selection' : $scope.selection.selectedItems,
        'current' : $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('archiveClass', function () {
        $http.post(appSettings.link + '/class/archive', {"class_id": $scope.selection.selectedItems})
          .success(function (response) {
            $scope.helpToArchive($scope.archivedClasses);
            $scope.hideArchived = false;
            // $scope.requestForArchivedClasses();
            // $scope.requestForCurrentClasses();
            $scope.clear();
            if(!$scope.currentClasses.length){
              $scope.changeView('current')
            }
          })
          .error(function () {

          })
      });
    };
    $scope.unArchiveClass = function () {
      $scope.modalContext = {
        'action' : 'unArchiveClass',
        'actionTitle' : 'unarchive',
        'fromClasses' : true,
        'selection' : $scope.selection.selectedItems,
        'current' : $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('unArchiveClass', function () {
        $http.post(appSettings.link + '/class/unarchive', {"class_id": $scope.selection.selectedItems})
          .success(function (response) {
            $scope.helpToUnarchive();
            if(!Object.keys($scope.archivedClasses).length) $scope.hideArchived = true; $scope.changeView('current');
            $scope.clear();
          })
          .error(function () {

          })
      });
    };
    $scope.moveToTrashFromCurrent = function () {
      $scope.modalContext = {
        'action' : 'moveToTrashFromCurrent',
        'actionTitle' : 'delete',
        'fromClasses' : true,
        'selection' : $scope.selection.selectedItems,
        'current' : $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('moveToTrashFromCurrent', function () {
        $http.post(appSettings.link + '/class/delete', {"class_id": $scope.selection.selectedItems})
          .success(function (response) {

            function findElement(obj) {
              return obj.id === $scope.selection.selectedItems[i];
            }
            for(var i = 0; i < $scope.selection.selectedItems.length; i++) {
              var neededItem = $scope.currentClasses.find(findElement);
              var index = $scope.currentClasses.indexOf(neededItem);
              $scope.currentClasses.splice(index, 1);
              $scope.deletedClasses.unshift(neededItem);
            }
            $scope.changeCountClass();
            if(!$scope.currentClasses.length){
              $scope.countClass = 0;
              $scope.classesNotExist = true;
            }
            // $scope.sortClasses($scope.deletedClasses);
            $scope.clear();
            if(!$scope.currentClasses.length){
              $scope.changeView('current')
            }
            // if($scope.currentView === 'archived'){
            //   $scope.helpToUnarchive($scope.deletedClasses);
            // } else {
            //   $scope.helpToRemoveFunc($scope.deletedClasses);
            // }
            $scope.hideDeleted = false;
            $scope.clear();
          })
          .error(function () {

          })
      });
    };
    $scope.moveToTrashFromArchived = function () {
      $scope.modalContext = {
        'action' : 'moveToTrashFromArchived',
        'actionTitle' : 'delete',
        'fromClasses' : true,
        'selection' : $scope.selection.selectedItems,
        'current' : $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('moveToTrashFromArchived', function () {
        $http.post(appSettings.link + '/class/delete', {"class_id": $scope.selection.selectedItems})
          .success(function (response) {

            function findElement(obj) {
              return obj.id === $scope.selection.selectedItems[i];
            }
            for(var i = 0; i < $scope.selection.selectedItems.length; i++){
              for(var key in $scope.archivedClasses) {
                var neededItem = $scope.archivedClasses[key].find(findElement);
                if (neededItem) {
                  var index = $scope.archivedClasses[key].indexOf(neededItem);
                  $scope.archivedClasses[key].splice(index, 1);
                  $scope.deletedClasses.unshift(neededItem);
                }
              }
            }
            $scope.countClass = 0;
            for(var key in $scope.archivedClasses){
              $scope.countClass += $scope.archivedClasses[key].length
            }
            console.log($scope.archivedClasses);
            if($scope.countClass === 0){
              $scope.hideArchived = true;
              $scope.archivedClasses = {};
              $scope.changeView('current');
            }
            // $scope.sortClasses($scope.deletedClasses);
            $scope.hideDeleted = false;
            $scope.clear();
          })
          .error(function () {
          })
      });
    };

    $scope.export = function () {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/classes/classExport/classExport.html',
        controller: 'classExportCtrl',
        controllerAs: '$ctrl',
        resolve: {
          items: function () {
            return $scope.selection.selectedItems;
          }
        }
      });

    };


    //.........................

    //MODAL OPENING
    $scope.openAreUSureModal = function (size) {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
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
    $scope.editClass = function () {
      if ($scope.selection.currentItem.length === 1 && $scope.selection.currentItem[0].owner === $rootScope.user.data.id) {
        var modalInstance = $uibModal.open({
          templateUrl: 'scripts/directives/CreateClassModalWindow/CreateClassModal.html',
          controller: 'ModalInstanceCtrl',
          controllerAs: '$ctrl',
          resolve: {
            items: function () {
              return $scope.selection.currentItem[0];
            }
          }
        });
      }
    };
    $ctrl.openModal = function (size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'scripts/directives/CreateClassModalWindow/CreateClassModal.html',
        controller: 'ModalInstanceCtrl',
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
    $ctrl.openModalJoinClass = function (size, parentSelector) {
      angular.element('.modal-content').addClass('joinClass');
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/classes/joinClassByCode.html',
        controller: 'ModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: 'sm',
        appendTo: parentElem,
        resolve: {
          items: function () {
            return $ctrl.items;
          }
        }
      });
    };
    //............

    $scope.openClass = function (openedClass, studentId) {
      openedClass.classInArchived = false;
      if($scope.currentView === 'deleted') {
        return
      }else if ($scope.currentView === 'archived'){
        openedClass.classInArchived = true;
      }
      if ($rootScope.role == 'teacher') {
        studentId = 0;
      } else if ($rootScope.role === "parent" || $rootScope.role == 'student') {
        studentId = $rootScope.user.data.id;
      }
      classData.setPickedClass(openedClass);
      $location.path("/class/" + openedClass.id + "/user/" + studentId + "/students");
    };
    $scope.contextMenu = {
      'items': [
        {
          'img': 'images/context_menu/icon-edit-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-edit-default_3x.png',
          'imgHover' : 'images/context_menu/icon-edit-hover_3x.png',
          'state' : false,
          'text': 'Edit',
          'multiSelect': false,
          'click': $scope.editClass
        },
        {
          'img': 'images/context_menu/icon-archive-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-archive-default_3x.png',
          'imgHover' : 'images/context_menu/icon-archive-hover_3x.png',
          'state' : false,
          'text': 'Archive',
          'multiSelect': ['teacher', 'student', 'parents'],
          'singleSelect': ['teacher', 'student', 'parents'],
          'click': $scope.archiveClass
        },
        {
          'img': 'images/context_menu/icon-unarchive-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-unarchive-default_3x.png',
          'imgHover' : 'images/context_menu/icon-unarchive-hover_3x.png',
          'state' : false,
          'text': 'Unarchive',
          'multiSelect': ['teacher', 'student', 'parents'],
          'singleSelect': ['teacher', 'student', 'parents'],
          'click': $scope.unArchiveClass

        },
        {
          'img': 'images/context_menu/icon-share-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-share-default_3x.png',
          'imgHover' : 'images/context_menu/icon-share-hover_3x.png',
          'state' : false,
          'text': 'Export',
          'multiSelect': false,
          // 'singleSelect': ['teacher', 'student', 'parents'],
          'click': $scope.export
        },
        {
          'img': 'images/context_menu/icon-recover-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-recover-default_3x.png',
          'imgHover' : 'images/context_menu/icon-recover-hover_3x.png',
          'state' : false,
          'text': 'Recover',
          'multiSelect': ['teacher', 'student', 'parents'],
          'singleSelect': ['teacher', 'student', 'parents'],
          'click': $scope.recoverClass
        },
        {
          'img': 'images/context_menu/icon-delete-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
          'state' : false,
          'text': 'Delete',
          'multiSelect': ['teacher', 'student'],
          'singleSelect': ['teacher', 'student'],
          'click': $scope.moveToTrashFromCurrent
        },
        {
          'img': 'images/context_menu/icon-delete-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
          'state' : false,
          'text': 'Delete',
          'multiSelect': ['teacher', 'student'],
          'singleSelect': ['teacher', 'student'],
          'click': $scope.deleteClass
        },
        {
          'img': 'images/context_menu/icon-delete-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
          'state' : false,
          'text': 'Delete',
          'multiSelect': ['teacher', 'student'],
          'singleSelect': ['teacher', 'student'],
          'click': $scope.moveToTrashFromArchived
        }
      ]
    };

    //EVENT LISTENERS
    $rootScope.$on('ClassWasEdited', function setNewClass(event, response, param) {
      if(param === "POST") {
        if( !$scope.currentClasses ){
          $scope.currentClasses = [];
        }

        var classToAdd = $scope.currentClasses.find(function (obj) {
          return obj.id === response.data.data.id
        });
        if(!classToAdd){
          $scope.currentClasses.unshift(response.data.data);
        }
        $scope.countClass = $scope.currentClasses.length;
        $scope.classesNotExist = false;
      } else {
        for(var i = 0; i < $scope.currentClasses.length; i++) {
          if($scope.currentClasses[i].id == response.data.data.id) {
            $scope.currentClasses[i] = angular.copy(response.data.data);
          }
        }
        $scope.clear();
        var modalInstance = $uibModal.open({
          animation: $ctrl.animationsEnabled,
          templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
          controller: 'confirmationModalController',
          size: 'sm',
          resolve : {
            items : function () {
              return 'Class was  successfully updated.'
            }
          }
        });
      }
      $rootScope.$$listeners['ClassWasEdited'] = [setNewClass];
      if($rootScope.$$listeners['ClassWasEdited'].length === 2)  $rootScope.$$listeners['ClassWasEdited'].splice(0, 1);

      $scope.catClassesNames($scope.currentClasses);
      $scope.selection = {selectedItems: [], currentItem: []};
    });
    $rootScope.$on('ClassWasNotEdited', function (event) {
      $scope.selection = {selectedItems: [], currentItem: []};
    });

    $rootScope.$on('action-was-not-approved', function () {
      $scope.clear();
    });
    $rootScope.$on('class-was-exported', function () {
      $scope.clear();
    });

    $rootScope.$on('load-more-deleted', function (event, arr) {
      $scope.catClassesNames(arr);
      if($scope.deletedClasses.length){
        $scope.deletedClasses = arr;
      }
      if($scope.currentView == 'deleted' && role !== 'parent'){
        $scope.countClass = $scope.deletedClasses.length;
      } else if($scope.currentView == 'deleted' && role === 'parent') {
        $scope.changeCountClass();
      }
      // $scope.sortClasses($scope.deletedClasses);
    });
    $rootScope.$on('load-more-current', function (event, arr) {
      $scope.catClassesNames(arr);
      $scope.currentClasses = arr;
      if($scope.currentView == 'current' && role !== 'parent'){
        $scope.countClass = $scope.currentClasses.length;
      } else if($scope.currentView == 'current' && role === 'parent') {
        $scope.changeCountClass();
      }
    });
  }])

  .factory('CurrentClasses', function($http, appSettings, $routeParams, AuthenticationService, $rootScope) {
    var currentClass = function(childId) {
      this.items = [];
      this.busy = false;
      this.after = '';
      if(childId) this.child =  childId;
    };

    currentClass.prototype.clear = function () {
      this.items = [];
      this.busy = false;
      this.after = '';
    };

    currentClass.prototype.nextPage = function() {

      if (this.busy) return;

      this.busy = true;
      $('#classes-loader').show();

      if(this.child) {
        var configCurrent = '?user_id=' + this.child + '&status=1' +"&page="+this.after;
      } else {
        configCurrent = '?user_id=' + AuthenticationService.getUserId() + '&status=1' +"&page="+this.after;
      }


      var url = appSettings.link + 'class' + configCurrent;

      $http.get(url)
        .success(function(data) {
          if(data.data.length ===0){
            return
          }
          var items = data.data;
          for (var i = 0; i < items.length; i++) {

            this.items.push(items[i]);

          }
          $rootScope.$broadcast('load-more-current', this.items);

          // console.log(data.meta.pagination.total_pages, data.meta.pagination.current_page)
          this.after =data.meta.pagination.current_page+1;
          if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
            // $('#user-loader').hide();
            $('#classes-loader').hide();
            return
          }
          $('#classes-loader').hide();
          this.busy = false;
        }.bind(this));
    };
    return currentClass;
  })
  .factory('DeletedClasses', function($http, appSettings, $routeParams, AuthenticationService, $rootScope) {
    var deletedClass = function(childId) {
      this.items = [];
      this.busy = false;
      this.after = '';
      if(childId) this.child =  childId;
    };

    deletedClass.prototype.nextPage = function() {
      if (this.busy) return;

      this.busy = true;
      $('#classes-del-loader').show();

      if(this.child) {
        var configDeleted = '?user_id=' + this.child + '&status=3' +"&page="+this.after;
      } else {
        configDeleted = '?user_id=' + AuthenticationService.getUserId() + '&status=3' +"&page="+this.after;
      }


      var url = appSettings.link + 'class' + configDeleted;
      $http.get(url)
        .success(function(data) {
          if(data.data.length ===0){
            return
          }
          var items = data.data;

          for (var i = 0; i < items.length; i++) {

            this.items.push(items[i]);

          }
          $rootScope.$broadcast('load-more-deleted', this.items);

          this.after =data.meta.pagination.current_page+1;
          if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
            $('#classes-del-loader').hide();
            return
          }
          this.busy = false;
          $('#classes-del-loader').hide();
        }.bind(this));
    };

    return deletedClass;
  })
  .filter('colorParse', function() {
    return function(number) {
      if(((number.length)>7)) {
        return '#'+number.slice(3);
      } else {
        return number
      }
    }
  });
