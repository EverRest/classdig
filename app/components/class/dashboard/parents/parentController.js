app.controller('parentsController',
  ['$scope',
    '$rootScope',
    '$http',
    '$routeParams',
    'appSettings',
    'classData',
    '$timeout',
    '$uibModal',
    function ($scope, $rootScope, $http, $routeParams, appSettings, classData, $timeout, $uibModal) {
      $rootScope.activeClassItem = 13;
      this.classId = $routeParams.classId;
      var $ctrl = this;

      $scope.list = false;
      $scope.studentsViewIsActive = true;

      $scope.students = [];
      $scope.pickedStudents = [];
      $scope.sortBy =  "First Name";

      $scope.sort = ["First Name", "Last Name"];

      $rootScope.userData = {
        'role': $rootScope.user.data.role,
        "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
        'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
        'background': $rootScope.user.data.role + '-background',
        'color': $rootScope.user.data.role + '-color',
        'border': $rootScope.user.data.role + '-border',
        'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png',
        'arrow' : 'images/distinguished/icon-arrow-' + $rootScope.user.data.role + '_3x.png'
      };

      $scope.currentUser = {
        'role': $rootScope.user.data.role,
        "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
        'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
        'background': $rootScope.user.data.role + '-background',
        'color': $rootScope.user.data.role + '-color',
        'border': $rootScope.user.data.role + '-border',
        'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png',
        // 'arrow' : 'images/distinguished/icon-arrow-' + $rootScope.user.data.role + '_3x.png'
      };


      $scope.changeSortBy = function (data) {
        $scope.sortBy = data;
        if($scope.sortBy == "First Name") {
          $rootScope.$broadcast("sort-by-changed", 'first_name');
        } else if($scope.sortBy == "Last Name") {
          $rootScope.$broadcast("sort-by-changed", 'second_name');
        }
      };

      $scope.hideCustomButton = true;
      $rootScope.$on('class-data-was-received', function () {
        if(!$rootScope.user.classData.classInArchived){
          $scope.hideCustomButton = false;
        }
        if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
          $scope.hideCustomButton = true;
        }
      });
      $scope.getParents = function(){
        $http.get(appSettings.link + 'class/' + $routeParams.classId + '/list/parents')
          .success(function (response) {
            $scope.students = response.data;
          })
          .error(function (data) {
            //console.log("Code: " + data.status_code + "; Message: " + data.message);
          });
      };

      $scope.getParents();

      $rootScope.$on('parent-added-to-class', function () {
        $scope.getParents();
      });


////////////Students without parent //////////////////
      $http.get(appSettings.link + 'class/' + this.classId + '/list/users/withoutparents')
        .success(function (response) {
          $scope.studentsWithoutParents = response.data;
          if($scope.studentsWithoutParents.length>0){
            $scope.inviteParent=true;
          }
          else{

            $scope.inviteParent=false;
            $scope.requestToJoinParent = true
          }

        })
        .error(function (data) {
          //console.log("Code: " + data.status_code + "; Message: " + data.message);
        });

//////////////////////////////////////////////////
      $scope.addNewParent = function () {
       $uibModal.open({
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/parents/addNewParentModal/addNewParentModal.html',
          controller: 'addNewParentModalInstanceCtrl',
          resolve: {
            items: function () {
              return false;
            }
          }
        });
      };


      $scope.data = {
        'items': [],
        'onGlobalButtonClick': $scope.addNewParent
      };

      $scope.displayChanged = function (list) {
        $rootScope.$broadcast("display-mode-changed", list);
      };

      $rootScope.$on('student-was-selected-in-students', function (event, student) {
       // console.log(student);
      });

      $scope.openModalInviteClass = function (user,size, parentSelector) {
        angular.element('.modal-content').addClass('joinClass');
        var parentElem = parentSelector ?
          angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
         // animation: $ctrl.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/parents/inviteParent/inviteParent.html',
          controller: 'inviteParentModalInstanceCtrl',
         // controllerAs: '$ctrl',
          size: 'sm',
          appendTo: parentElem,
          resolve: {
            items: function () {
              return user;
            }
          }
        });
      };

      $scope.seeRequestToJoin = function(){
        $scope.inviteParent=false;
        $scope.requestToJoinParent = true;
      };

      $scope.seeParentsToInvite = function () {
        $scope.inviteParent=true;
        $scope.requestToJoinParent = false;
      };

//////////////////Join parent/////////////////////////////
      $scope.aceptReject = function (student, status) {
        var index = $scope.requestedParents.indexOf(student);
        $scope.requestedParents.splice(index, 1);


        $http.post(appSettings.link + 'class/' + $routeParams.classId + '/user/request', {'status' : status, 'user_id' : student.id})
          .success(function (response) {
            $scope.getParents();
            if(!$scope.requestedParents.length) {
              $scope.seeParentsToInvite();
            }
          })
          .error(function (data) {
           // console.log("Code: " + data.status_code + "; Message: " + data.message);
          });


      };

      $http.get(appSettings.link + 'class/' + $routeParams.classId + '/list/parents/request')
        .success(function (response) {
          $scope.requestedParents = response.data;
        })
        .error(function (data) {
         // console.log("Code: " + data.status_code + "; Message: " + data.message);
        });
///////////////////////////////////////////////////////

    }]);

