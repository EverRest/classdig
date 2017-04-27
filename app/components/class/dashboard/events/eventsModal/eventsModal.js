angular.module('classDigApp')
  .controller('eventModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.ExamServerError = false;
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
      }).val($scope.startDate);


      $('.datetimepickerTimeFrom , .datetimepickerTimeTo').datetimepicker({
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
    $scope.startDate = moment().format('LL');
    if (items === undefined) {
      $scope.event = {};
      $scope.event.color = "#a7687f";
      $scope.event.reminder = -1;
      $scope.event.time_start = new Date();
      $scope.event.time_end = new Date();
      $scope.event.due_date = new Date();
      $scope.event.class_id = $routeParams.classId;
      $scope.event.user_id = $rootScope.user.data.id;
      $scope.event.attachments = [];

      $scope.ArrayOfUploadFiles = [];

      $scope.event.time_start = moment($scope.event.time_start).format('LT');
      $scope.event.time_end = moment($scope.event.time_end).format('LT');
      this.modalConstant = {
        header: "Add new event",
        buttonSubmit: "ADD EVENT"
      }
    }
    else{
      $scope.event = angular.copy(items);
      $scope.event.color = items.color;
      $scope.event.time_start = moment($scope.event.time_start,'hh:mm:ss').format('LT');
      $scope.event.time_end = moment($scope.event.time_end, 'hh:mm:ss').format('LT');


      $scope.ArrayOfUploadFiles = items.attachments.map(function(obj){
        var newUploadItem = {};
        newUploadItem.name = obj.filename;
        newUploadItem.id = obj.id;
        return newUploadItem;
      });

      // $scope.event.attachments = items.attachments.map(function(obj){
      //   newUploadItem = obj.id;
      //   console.log(newUploadItem);
      //   return newUploadItem;
      // });

      $scope.event.attachments = _.pluck(items.attachments, 'id');


      this.modalConstant = {
        header: "Update Event",
        buttonSubmit: "UPDATE EVENT"
      };

      $timeout(function () {
        $scope.event.due_date = moment($scope.event.due_date).format('LL');
        $scope.monthDate = $scope.event.due_date;
      });

    }
    $scope.options = [
      {'id': 0, 'option': 'Never', 'val': -1},
      {'id': 1, 'option': 'At time of event', 'val': 0},
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

    //$scope.event.time_start = moment($scope.event.time_start).format('LT');
    //$scope.event.time_end = moment($scope.event.time_end).format('LT');

    $scope.UploadFileHeight = -20;
    $scope.$watch('UploadFile', function () {
      if ($scope.UploadFile) {
        $scope.uploadFile($scope.UploadFile);
        $scope.UploadFileHeight += 10;
      }
    });

    $scope.$watch('event',function(){
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
        $scope.event.attachments[0]=newUploadItem.id;
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
      $scope.event.attachments = _.filter($scope.event.attachments, function(num){ return num != deleteFileId; });
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

    $scope.ok = function (valid) {
      if(valid){
        return
      }
      $scope.event.due_date = moment($scope.monthDate, $scope.format).format('YYYY-MM-DD');
      if(!$scope.event.note){
      $scope.event.note = 'no notes';
      }
       if(items === undefined) {
         $http({
           url: appSettings.link + 'event',
           method: "POST",
           data: $scope.event
         })
           .then(function (response) {
               $uibModalInstance.close();
               $rootScope.$broadcast('createEvent', response.data.data);
             },
             function (response) {
               $scope.ExamServerError = true;
             });
       } else{
        $scope.event.class_id = $routeParams.classId;
        $scope.event.user_id = $routeParams.studentId;

         if($scope.event.class_id==undefined){
           $scope.event.class_id=$scope.event.class.id;
           $scope.event.user_id = $scope.event.owner_id;
         }
         $http({
           url: appSettings.link + 'event/' + $scope.event.id,
           method: "PUT",
           data: $scope.event
         })
           .then(function (response) {
               $uibModalInstance.close();
               $rootScope.$broadcast('createEvent', response.data.data);
             },
             function (response) {
               $scope.ExamServerError = true;
             });
       }
    };
  });
