angular.module('classDigApp')
  .controller('assignmentModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.AssignmentServerError = false;
    $timeout(function () {
      $('.datetimepickerDate').datetimepicker({
        format: 'LL',
        minDate:new Date()
      }).on('dp.change', function (event) {
        $(this).change();
      }).on('dp.show', function(e) {
        $('.bootstrap-datetimepicker-widget .active')
          .addClass('bg-'+$scope.role)
          .css({'border': 'none', color: 'white'});
        $('.bootstrap-datetimepicker-widget .today').toggleClass('' + $scope.role);
      }).val($scope.monthDate);

      $('.datetimepickerTimeFrom').datetimepicker({
        format: 'LT'
      }).on('dp.change', function (event) {
        $(this).change();
      }).on('dp.show', function(e) {
        $('.bootstrap-datetimepicker-widget .btn-primary')
          .addClass('bg-'+$scope.role).css({'border': 'none'});
        $('.bootstrap-datetimepicker-widget .btn :not(.btn-primary)')
          .addClass('c-'+$scope.role);
      });

    });
    $scope.format = 'MMMM Do YYYY';
    if (items === undefined) {
      $scope.assignment = {};
      $scope.assignment.class_id = $routeParams.classId;
      $scope.assignment.due_date = new Date();
      $scope.assignment.due_time = new Date();
      $scope.assignment.priority = 2;
      $scope.assignment.color = "#a7687f";
      $scope.assignment.reminder = -1;
      $scope.assignment.attachments = [];
      $scope.assignment.partisipants = [];
      $scope.assignment.hand_submission = 1;
      $scope.hand_submission = true;

      $scope.ArrayOfUploadFiles = [];
      $scope.assignment.due_time = moment($scope.assignment.due_time).format('LT');
      this.modalConstant = {
        header: "Create new assignment",
        buttonSubmit: "CREATE ASSIGNMENT"
      };
      setTimeout(function(){$scope.monthDate = $scope.assignment.due_date;}, 5000);

    }
    else{
      $scope.assignment =angular.copy(items);
      $scope.assignment.due_time = moment($scope.assignment.due_time,'hh:mm:ss').format('LT');
      $scope.monthDate = $scope.assignment.due_date;

      $scope.ArrayOfUploadFiles = $scope.assignment.attachments.map(function(obj){
        var newUploadItem = {};
        newUploadItem.name = obj.filename;
        newUploadItem.id = obj.id;
        return newUploadItem;
      });
      $scope.hand_submission = !!($scope.assignment.hand_submission);
      $scope.assignment.attachments = _.pluck($scope.assignment.attachments, 'id');
      setTimeout(function(){$scope.functionCheckPriority($scope.assignment.priority)}, 300);

      this.modalConstant = {
        header: "Update assignment",
        buttonSubmit: "UPDATE ASSIGNMENT"
      };
    }


    $scope.options = [
      {'id': 0, 'option': 'Never', 'val': -1},
      {'id': 1, 'option': 'At time of exam', 'val': 0},
      {'id': 2, 'option': '5 minutes before', 'val': 5},
      {'id': 3, 'option': '10 minutes before', 'val': 10},
      {'id': 4, 'option': '15 minutes before', 'val': 15},
      {'id': 5, 'option': '30 minutes before', 'val': 30},
      {'id': 6, 'option': '1 hour before', 'val': 60},
      {'id': 7, 'option': '2 hours before', 'val': 2 * 60},
      {'id': 8, 'option': '1 day before', 'val': 24 * 60},
      {'id': 9, 'option': '2 days before', 'val': 2 * 24 * 60},
      {'id': 10, 'option': '1 week before', 'val': 7 * 24 * 60},
      {'id': 11, 'option': '2 weeks before', 'val': 2 * 7 * 24 * 60}
    ];

    setTimeout(function(){if($scope.hand_submission ===true ){
      angular.element('#myonoffswitch').attr('checked',true)
    } }, 300);

    if($scope.hand_submission ===true ){
      angular.element('#myonoffswitch').attr('checked',true)
    }

    $scope.functionCheckHandSubmission = function(){
      $scope.hand_submission = !$scope.hand_submission;
    };

    $scope.functionCheckPriority = function (val) {
      $scope.assignment.priority = val;
      angular.element('.priority-item').removeClass('priority-item-active');
      angular.element('.priority-item').removeClass($rootScope.userData.background);
      angular.element('#'+val).addClass('priority-item-active');
      angular.element('#'+val).addClass($rootScope.userData.background);
    };

    $scope.assignment.due_date = moment($scope.assignment.due_date).format('LL');
    $scope.monthDate = $scope.assignment.due_date;

    $scope.UploadFileHeight = -20;
    $scope.$watch('UploadFile', function () {
      if ($scope.UploadFile) {
        $scope.uploadFile($scope.UploadFile);
        $scope.UploadFileHeight += 10;
      }
    });

    $scope.$watch('assignment',function(){
      $scope.ExamServerError=false;
    });


////////// FUNCTION UPLOAD FILE TO SERVER //////////////////
    $scope.uploadFile = function (file) {
      file.upload = Upload.upload({
        url: appSettings.link + 'upload',
        data: {file: file}
      });

      file.upload.then(function (response) {
        file.result = response.data;
        var newUploadItem = {};
        newUploadItem.id = response.data.data.id;
        newUploadItem.name = file.name;
        $scope.ArrayOfUploadFiles[0]=newUploadItem;
        $scope.assignment.attachments[0]=newUploadItem.id;
      }, function (response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
          $scope.ExamServerError = true;
          setTimeout(function(){ $scope.ExamServerError = false; }, 5000);
        }
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        $scope.progressNumber = file.progress;
      });
    };
    $scope.arrayOfFilesToDelete = [];
////////// FUNCTION DELETE FILE FROM SERVER AND LIST OF UPLOAD FILES//////////////////
    $scope.DeleteFileFromSyllabus = function (e) {
      var deleteFileId = $(e.target).parent().attr('id');

      $scope.arrayOfFilesToDelete.push(+deleteFileId);
      $scope.assignment.attachments = _.filter($scope.assignment.attachments, function(num){ return num != deleteFileId; });
      $scope.ArrayOfUploadFiles = _.filter($scope.ArrayOfUploadFiles,function(obj) { return obj.id != deleteFileId; });
      $(e.target).parent().remove();

    };

    function deleteAttachments(array){
      for(var i=0;i<array.length;i++){
        $http({
          url: appSettings.link + 'upload/' + array[i],
          method: "DELETE"
        }).then(function (response) {
          },
          function (response) {
            $scope.ExamServerError = true;
          });
      }
    }

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
      $scope.assignment.hand_submission = +$scope.hand_submission;
      $scope.assignment.due_date = moment($scope.monthDate, $scope.format).format('YYYY-MM-DD');
      if(!$scope.assignment.note){
        $scope.assignment.note = 'no notes';
      }
      if(items === undefined) {
        $http({
          url: appSettings.link + 'assignment',
          method: "POST",
          data: $scope.assignment
        })
          .then(function (response) {
              $rootScope.$broadcast('changeAssignment', response);
              $uibModalInstance.close();
            },
            function (response) {
              $scope.AssignmentServerError = true;
              var obj = response.data.errors;
              var error_message = obj[Object.keys(obj)[0]];
              $('.exam-server-error').html(error_message)
            });
      }
      else{
        $scope.assignment.participants=[];
        $http({
          url: appSettings.link + 'assignment/' + $scope.assignment.id,
          method: "PUT",
          data: $scope.assignment
        })
          .then(function (response) {
              deleteAttachments($scope.arrayOfFilesToDelete);
            $log.log(response.data.data);
              $rootScope.$broadcast('updateAssignment', response.data.data);
              $uibModalInstance.close();

            },
            function (response) {
              $scope.AssignmentServerError = true;
              $('.exam-server-error').html(response)
            });
      }
    };
  });
