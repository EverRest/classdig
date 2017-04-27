angular.module('classDigApp')
  .controller('addStudentsFromPhotoModalInstanceCtrl', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, $uibModal) {

    var $ctrl = this;
    $scope.loading = false;

    $scope.counter = 0;

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

    function plotRectangle(el, rect, userDrown) {
      console.log(el, rect, userDrown);
      if(userDrown) {
        var fixedW = rect.width;
        var fixedH = rect.height;
        var fixedX = rect.x;
        var fixedY = rect.y;
      } else {
        fixedW = rect.width + rect.width * 0.5;
        fixedH = rect.height + rect.height * 0.5;
        fixedX = rect.x - rect.width * 0.25;
        fixedY = rect.y - rect.height * 0.25;
      }

      var div = document.createElement('div');
      div.id = 'drawn-face-' + rect.id;
      div.style.position = 'absolute';
      div.style.border = '2px solid #4b93eb';
      div.style.borderRadius = '50%';
      div.style.width = fixedW + 'px';
      div.style.height = fixedH + 'px';
      div.style.left = el.offsetLeft + fixedX + 'px';
      div.style.top = el.offsetTop + fixedY + 'px';
      document.getElementById('UploadedPictureContainer').appendChild(div);
      return div;
    }

    function dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime, name:'test.jpg'});
    }

    function cutFaces(el, rect, userDrown) {
      console.log(el, rect, userDrown);
      if(userDrown) {
        var fixedW = rect.width;
        var fixedH = rect.height;
        var fixedX = rect.x;
        var fixedY = rect.y;
      } else {
        fixedW = rect.width + rect.width * 0.5;
        fixedH = rect.height + rect.height * 0.5;
        fixedX = rect.x - rect.width * 0.25;
        fixedY = rect.y - rect.height * 0.25;
      }
      var canvas = document.createElement('canvas');
      canvas.width = fixedW;
      canvas.height = fixedH;
      var context = canvas.getContext('2d');
      var xKoef = el.width/ el.naturalWidth;
      var yKoef = el.height/ el.naturalHeight;
      context.drawImage(el, fixedX/xKoef, fixedY/yKoef, fixedW/xKoef, fixedH/yKoef, 0, 0, fixedW, fixedH);

      var blob = dataURLtoBlob(canvas.toDataURL("image/jpeg"));
      var fileOfBlob = new File([blob], 'file_' + Math.random().toString(36).substring(7) +'.jpg');

      var student = {
        'id' : rect.id,
        'photo' : canvas.toDataURL("image/jpeg"),
        'blob' : fileOfBlob
      };

      $scope.faces.push(student);
    }

    function countRadius(sx, sy, ex, ey) {
      var xDiff = Math.pow((sx - ex), 2);
      var yDiff = Math.pow((sy - ey), 2);
      return Math.sqrt(xDiff + yDiff);

    }

    function createRect(sx, sy, ex, ey) {
      var radius = countRadius(sx, sy, ex, ey);
      var rect = {
        'id' : $scope.counter,
        'x' : sx - radius,
        'y' : sy - radius,
        'width' : 2 * radius,
        'height' : 2 * radius
      };
      console.log(rect);
      $scope.counter++;
      return rect;
    }

    function drawer() {

      var canvas = $('#canvas-over-img')[0];
      var image = $('#uploadedPicture')[0];
      canvas.width = image.width;
      canvas.height = image.height;
      var ctx = canvas.getContext('2d');
      var mouse = {x: 0, y: 0};
      var last_mouse = {x: 0, y: 0};

      canvas.addEventListener('mousemove', function(e) {
        var cOffset = $(canvas).offset();
        mouse.x = e.pageX - cOffset.left;
        mouse.y = e.pageY - cOffset.top;
      }, false);

      canvas.addEventListener('mousedown', function(e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;
        canvas.addEventListener('mousemove', onPaint, false);
      }, false);

      canvas.addEventListener('mouseup', function() {

        canvas.removeEventListener('mousemove', onPaint, false);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var customRect = createRect(last_mouse.x, last_mouse.y, mouse.x, mouse.y);
        cutFaces($scope.image, customRect, true);
        plotRectangle($scope.image, customRect, true);

      }, false);

      function onPaint() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var radius = countRadius(last_mouse.x, last_mouse.y, mouse.x, mouse.y);

        console.log("RADIUS", radius);

        ctx.beginPath();
        ctx.arc(last_mouse.x, last_mouse.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#4b93eb';
        ctx.stroke();
      }

    }


    $scope.uploaded = function () {
      $scope.loading = true;
      $scope.faces = [];
      $scope.count = 0;

      $scope.image = document.getElementById("uploadedPicture");

      $scope.image.onload = function () {
        $scope.$apply(function () {
          $scope.loading = false;
        });

        drawer();

        console.log("The image has loaded!");

        var tracker = new tracking.ObjectTracker("face");

        tracking.track($scope.image, tracker);
        tracker.on('track', function (event) {
          event.data.forEach(function (rect) {
            rect.id = $scope.counter;
            $scope.counter++;
            console.log("rect", rect);
            cutFaces($scope.image, rect);
            plotRectangle($scope.image, rect);
            $scope.count++;
          });
          $scope.facesParsed = true;
          $scope.$apply();
        });
      };
    };


    // modal controller

    $scope.addNewStudentWithPhoto = function (size, parentSelector) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/class/dashboard/students/addNewStudentModal/addNewStudentModal.html',
        controller: 'addNewStudentModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.studentToAdd;
          },
          fromPhoto: function () {
            return true;
          }
        }
      });
    };

    $scope.addNewStudent = function (studentToAdd) {
      console.log(studentToAdd);
      $scope.studentToAdd = studentToAdd;
      $scope.addNewStudentWithPhoto();
    };

    $scope.deleteStudent = function (element) {
      $( "#drawn-face-" + element.id).remove();
      var deletingIndex = $scope.faces.indexOf(element);
      $scope.faces.splice(deletingIndex, 1);
      if(!$scope.faces.length) {
        $rootScope.$broadcast('student-added-to-class');
        $uibModalInstance.close();
      }
    };

    $rootScope.$on('student-from-photo-added-successful', function (event, element) {
      $scope.deleteStudent(element);
    });

    $ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.ok = function () {
      $uibModalInstance.close();
    };
  });
