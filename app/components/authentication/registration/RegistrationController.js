'use strict';

angular.module('classDigApp')

  .controller('RegistrationController', [
    '$scope',
    '$rootScope',
    'Upload',
    'registerUser',
    'appSettings',
    '$location',
    '$timeout',

    function ($scope, $rootScope, Upload, registerUser, appSettings, $location, $timeout) {

      $scope.registrationData = {};


      // var blob = dataURLtoBlob(canvas.toDataURL("image/jpeg"));
      // var fileOfBlob = new File([blob], 'file_' + Math.random().toString(36).substring(7) +'.jpg');

      function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime, name:'test.jpg'});
      }

      $scope.initForm = function () {
        if($rootScope.fbInfo) {

            $scope.viaFb = true;
            $scope.registrationData.first_name = $rootScope.fbInfo.first_name;
            $scope.registrationData.last_name = $rootScope.fbInfo.last_name;
            $scope.registrationData.email = $rootScope.fbInfo.email;
            $scope.registrationData.image = $rootScope.fbInfo.picture.data.url;

            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = $rootScope.fbInfo.picture.data.url;

            img.onload = function () {
              var canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              var context = canvas.getContext('2d');
              context.drawImage(img, 0, 0);

              $scope.blob = dataURLtoBlob(canvas.toDataURL("image/jpeg"));
            };
        }
      };

      // $scope.upload = function (file) {
      //   Upload.upload({
      //     url: '../images',
      //     data: {file: file, 'username': $scope.registrationData.username}
      //   }).then(function (resp) {
      //     console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      //   }, function (resp) {
      //     console.log('Error status: ' + resp.status);
      //   });
      // };

      $scope.changeRole = function (role) {
        if (role == "student") {
          // $scope.imageStudent = $scope.imageStudent === false ? true : false;
          if ($scope.imageStudent === false) {
            $scope.imageStudent = true;
            $scope.registrationData.role = 'student';
          }
          else {
            $scope.imageStudent = false;
            $scope.registrationData.role = '';
          }
          $scope.imageTeacher = false;
          $scope.imageParent = false;
        }
        else if (role == "teacher") {
          if ($scope.imageTeacher === false) {
            $scope.imageTeacher = true;
            $scope.registrationData.role = 'teacher';
          }
          else {
            $scope.imageTeacher = false;
            $scope.registrationData.role = '';
          }
          $scope.imageStudent = false;
          $scope.imageParent = false;
        }
        else {
          if ($scope.imageParent === false) {
            $scope.imageParent = true;
            $scope.registrationData.role = 'parent';
          }
          else {
            $scope.imageParent = false;
            $scope.registrationData.role = '';
          }
          $scope.imageStudent = false;
          $scope.imageTeacher = false;
        }

      };

      $scope.st = {
        startReg: false
      };

      $scope.registrationSuccess = false;
      $scope.regex = '^[a-zA-Z0-9.\-_$@*!]{3,30}$';


      // registration
      $scope.createAccount = function (registrationData) {
        if(!$rootScope.fbInfo) {
          if (this.registerForm.$valid) {
            $('#registration-button').hide();
            $('#registration-loader').show();

            // if ($scope.registrationData.image) {
            //   // $scope.upload($scope.file);
            //
            //   Upload.base64DataUrl($scope.registrationData.image)
            //     .then(function (urls) {
            //       $scope.registrationData.base64image = urls;
            //     });
            //   console.log("start upload");
            // }

            // set delay for spinner
            // setTimeout(function() {

            if (!$scope.startReg) {
              $scope.st.startReg = true;

              Upload.upload({
                url: appSettings.link + 'register',
                data: {
                  "email": registrationData.email,
                  "password": registrationData.password,
                  "name": registrationData.username,
                  "first_name": registrationData.first_name,
                  "last_name": registrationData.last_name,
                  "country": registrationData.country,
                  "city": registrationData.city,
                  "school_name": registrationData.school_name,
                  "gender": registrationData.gender,
                  "role": registrationData.role,
                  "image": registrationData.image
                }
              }).then(function (response) {
                  $scope.registrationSuccess = true;
                  $scope.st.startReg = false;
                }
                ,
                function (data) {
                  $scope.st.startReg = false;
                  console.error("Error", data);
                  if (data.data.errors.email) {
                    $scope.serverErrorEmail = data.data.errors.email[0];
                  }
                  if (data.data.errors.name) {
                    $scope.serverErrorUsername = data.data.errors.name[0];
                  }
                }
              )
            }

            $('#registration-loader').hide();
            $('#registration-button').show();

          }
        } else {

          if (this.registerForm.$valid) {
            $('#registration-button').hide();
            $('#registration-loader').show();

            if (!$scope.startReg) {
              $scope.st.startReg = true;

              Upload.upload({
                url: appSettings.link + 'auth/facebook',
                data: {
                  "code" : $rootScope.fbInfo.code,
                  "email": registrationData.email,
                  // "password": registrationData.password,
                  "name": registrationData.username,
                  "first_name": registrationData.first_name,
                  "last_name": registrationData.last_name,
                  "country": registrationData.country,
                  "city": registrationData.city,
                  "school_name": registrationData.school_name,
                  "gender": registrationData.gender,
                  "role": registrationData.role,
                  "image": angular.isObject(registrationData.image) ? registrationData.image : new File([$scope.blob], 'file_' + Math.random().toString(36).substring(7) +'.jpg')
                }
              }).then(function (response) {
                $rootScope.$broadcast('authorized-via-fb');
                  // $scope.registrationSuccess = true;
                  // $scope.st.startReg = false;
                  // console.log('1111111111111111111111111111111111111111111111111111');
                }, function (data) {

                }
              )
            }

            $('#registration-loader').hide();
            $('#registration-button').show();
          }

        }

      }

    }]);

