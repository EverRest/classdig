angular.module('classDigApp')

  .controller('behaviourModalInstanceCtrl',
    function ($scope, $rootScope, $http, $log, $routeParams, $uibModalInstance, appSettings, positive, type, selectedDate, pickedStudents, students, behaviours, $uibModal) {
      var $ctrl = this;

      var classId = $routeParams.classId;
      $scope.indexBehaviour = 0;
      $scope.behaviors = behaviours;
      $scope.pickedStudents = pickedStudents;
      $scope.students = students;
      $scope.positive = positive;
      $scope.selectedDate = selectedDate;
      $scope.type = type;
      $scope.selectedStudentList = [];

      $scope.item = {
        'type' : $scope.positive ? 1 : 2,
        'name' : $scope.positive ? 'Positive' : 'Need work'
      };



       $scope.prepareButtons = function(array) {
         $scope.preButtons = [];
         $scope.buttons = [];

         $scope.preButtons = array.filter(function (obj) {
          if($scope.positive) {
            return obj.type === 1;
          } else {
            return obj.type === 2;
          }
        });

         array[4].image = 'images/behavior/bad_behaviour_13@2x.png';
         array[5].image = 'images/behavior/bad_behaviour_12@2x.png';
         array[6].image = 'images/behavior/bad_behaviour_11@2x.png';
         array[7].image = 'images/behavior/bad_behaviour_10@2x.png';
         console.log('elem',array[0],array[1], array[2],array[3]);
         var firstPart = $scope.preButtons.slice(0,4);
         var secondPart = $scope.preButtons.slice(4, $scope.preButtons.length);
         console.log(firstPart, secondPart);

         firstPart.forEach(function (obj) {
           $scope.buttons.push(obj);
         });

         console.log($scope.buttons);
        if($scope.preButtons.length <=6){
          $scope.buttons.push({
            'image' : $scope.positive ? 'images/classes/modal/modal-behaviour_3x.png' : 'images/behavior/plus_red@2x.png',
            'description' : "Add behavior",
            'id' : -1
          })
        } else {
          $scope.buttons.push({
            'image' : 'images/classes/modal/new-behavior-type-not-allowed.png',
            'description' : "Add behavior",
            'id' : -2
          })
        }
        secondPart.forEach(function (obj) {
          $scope.buttons.push(obj);
        })
      };

      $scope.prepareButtons( $scope.behaviors );

      $scope.insertToSelectedStudentList = function (index) {
        for (var i = 0; i < $scope.pickedStudents.length; i++) {

          var studentObj = {
            'user_id': $scope.pickedStudents[i].id,
            'date': selectedDate,
            'behavior_id': index
          };

          if ($scope.selectedStudentList.length) {
            for (var j = 0; j < $scope.selectedStudentList.length; j++) {
              if ($scope.pickedStudents[i].id === $scope.selectedStudentList[j].user_id) {
                $scope.selectedStudentList.splice(j, 1);
              }
            }
          }
          $log.log(studentObj);
          $scope.selectedStudentList[i] = studentObj;
        }
      };

      $scope.checkIconForStudent = function (type) {
        switch (type) {
          case 'positive':
            $scope.pickedStudents.forEach(function (obj) {
              obj.behavior_type = 1;
            });
            break;
          case 'negative':
            $scope.pickedStudents.forEach(function (obj) {
              obj.behavior_type = 2;
            });
            break;
        }
        for (var i = 0; i < $scope.students.length; i++) {
          for (var j = 0; j < $scope.pickedStudents.length; j++) {
            if ($scope.students[i].id === $scope.pickedStudents[j].id) {
              $scope.students[i].behavior_type = $scope.pickedStudents[j].behavior_type;
            }
          }
        }
      };

      $scope.$on('new-category-created', function () {

          $http.get(appSettings.link + 'behavior/' + $rootScope.user.classData.owner)
            .success(function (response) {
              $log.info("behaviors", response);
              $scope.behaviours = response.data;
              $scope.prepareButtons( response.data );
            });
      });

      $ctrl.cancel = function () {
        $uibModalInstance.close();
      };




            // ====== create a users Behaviour ======
      $ctrl.setBehaviour = function (behavior) {

        if(behavior.id === -1){

          var modalInstance = $uibModal.open({
            templateUrl: 'components/class/dashboard/behaviour/newBehaviorTypeModal/newBehaviorTypeModal.html',
            controller: 'newBehaviorTypeModal',
            controllerAs: '$ctrl',
            resolve: {
              items : $scope.item
            }
          });
          $log.log("Add behaviour");
          return;
        } else if (behavior.id === -2) {
          return
        }



        $scope.checkIconForStudent(type);
        $scope.insertToSelectedStudentList(behavior.id);

        $http.post(appSettings.link + 'class/' + classId + '/behavior', {'users': $scope.selectedStudentList})
          .success(function () {
            $log.log("POST SUCCES");
          })
          .error(function (data) {
            $log.log("Code: " + data.status_code + "; Message: " + data.message);
          });

        for (var i = 0; i < $scope.students.length; i++) {
          $scope.students[i].state = false;
        }
        $scope.pickedStudents.splice(0, $scope.pickedStudents.length);

        $uibModalInstance.close();
      };

    });
