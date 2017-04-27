angular.module('classDigApp')
  .controller('addNewStudentModalInstanceCtrl', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, Upload, $routeParams, fromPhoto, $q) {

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

    var classId = $routeParams.classId;


    $scope.newStudent = {};
    $scope.newStudent.tags = {};
    $scope.newStudent.parents = [{}, {}];
    $scope.createStudentClicked = false;

    $scope.setEditedStudentInfo = function (studentInfo) {
      $scope.newStudent.email = studentInfo.email;
      $scope.newStudent['first_name'] = studentInfo.details.data['first_name'];
      $scope.newStudent['last_name'] = studentInfo.details.data['last_name'];
      $scope.newStudent['middle_name'] = studentInfo.details.data['middle_name'];
      $scope.newStudent.gender =  studentInfo.details.data.gender + 1;
      $scope.newStudent.id = studentInfo.id;
      $scope.newStudent.tags['concern'] = studentInfo.details.data['concern'] ? true : false;
      $scope.newStudent.tags['need_aid'] = studentInfo.details.data['need_aid'] ? true : false;
      $scope.newStudent.parents = studentInfo.parents.data;


      if($scope.newStudent.parents.length > 1) $scope.showContinue = true;
      $scope.studentImage = studentInfo.details.data.photo;
      if($scope.newStudent.parents[0]) $scope.parentOneImage = studentInfo.parents.data[0].photo;
      if($scope.newStudent.parents[1]) $scope.parentTwoImage = studentInfo.parents.data[1].photo;
    };


    if(items && !fromPhoto) {
      $scope.editing = true;
      $scope.studentImage = true;
      $scope.parentOneImage = true;
      $scope.parentTwoImage = true;
      $http.get(appSettings.link + 'current-user/' + items)
        .then(function (responce) {
            $scope.userInformation = responce.data.data;
            console.log($scope.userInformation);
            $scope.setEditedStudentInfo($scope.userInformation);

          },
          function (values) {
            console.log('error');
          });
    } else {
      $scope.newStudent.tags.need_aid = true;
      $scope.newStudent.tags.concern = true;
      $scope.newStudent.gender = 1;
      $scope.newStudent.parents[0].gender = 1;
      $scope.newStudent.parents[1].gender = 2;
    }




    $scope.uploadPic = function (file, context) {
      file.upload = Upload.upload({
        url: appSettings.link + 'upload',
        data: {file: file}
      });
      file.upload.then(function (response) {

        if(context === 0){
          $scope.newStudent['image_id'] = response.data.data.id;
        } else if(context === 1){
          $scope.newStudent.parents[0]['image_id'] = response.data.data.id;
        } else if(context === 2){
          $scope.newStudent.parents[1]['image_id'] = response.data.data.id;
        }

      }, function (error) {

      });
    };

    if(items && fromPhoto) {
      $scope.studentImage = items.photo;
      $scope.uploadPic(items.blob, 0);
    }

    $scope.uploaded = function (files, context) {
      $scope.uploadPic(files[0], context);
    };

    $scope.onOffTag = function (tagName) {
      $scope.newStudent.tags[tagName] = !$scope.newStudent.tags[tagName];
    };

    $scope.setGender = function (gender, context) {
      if(context === 0){
        $scope.newStudent.gender = gender;
      } else if(context === 1){
        $scope.newStudent.parents[0].gender = gender;
      } else if(context === 2){
        $scope.newStudent.parents[1].gender = gender;
      }
    };

    $scope.addNewStudent = function () {
      console.log([ $scope.newStudent ]);
      $http.post(appSettings.link + 'class/'+ classId +'/add/new/user', {'users' : [ $scope.newStudent ]})
        .success(function (response) {
          if(items && fromPhoto){
            $rootScope.$broadcast('student-from-photo-added-successful', items)
          } else {
            $rootScope.$broadcast('student-added-to-class');
          }
          $uibModalInstance.close();
        })
        .error(function () {

        })
    };


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    };
    $scope.ok = function () {
      if($scope.CreateStudentModal.$invalid) {
        return false;
      } else if (!$scope.CreateStudentModal.$invalid && !$scope.editing) {
        if(!$scope.showContinue && $scope.newStudent.parents.length === 2) {
          $scope.newStudent.parents.pop();
        }
        $scope.addNewStudent();
      } else if (!$scope.CreateStudentModal.$invalid && $scope.editing) {
        $rootScope.$broadcast('user-was-updated');
        $uibModalInstance.close();
      }
    };
  })
;

