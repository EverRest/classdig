angular.module('classDigApp')
    .controller('ModalDemoController', function ($scope, $rootScope, $uibModal, $log, $document, $http) {
        var $ctrl = this;

        $rootScope.userData = {
            'role': $rootScope.user.data.role,
            "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png',
            'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '.png',
            'background': $rootScope.user.data.role + '-background',
            'color': $rootScope.user.data.role + '-color',
            'border': $rootScope.user.data.role + '-border',
            'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_2x.png'
        };

        $ctrl.animationsEnabled = true;

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

            Date.prototype.addHours = function (h) {
                this.setHours(this.getHours() + h);
                return this;
            };
            Date.prototype.addMonth = function (m) {
                this.setUTCMonth(this.getUTCMonth() + m);
                return this;
            };
            Date.prototype.ChangeTime = function (d, m, r) {
                this.setUTCMonth(this.getDay() + d);
                this.setUTCMonth(this.getUTCMonth() + m);
                this.setUTCMonth(this.getYear() + r);
                return this;
            };


        };

        $ctrl.toggleAnimation = function () {
            $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
        };
    });

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('classDigApp')
    .controller('ModalInstanceCtrl', function ($uibModalInstance, $scope, $http, Upload, $timeout, $resource, ResoursUpload, $rootScope, $compile, appSettings, items) {

      $scope.format = 'MMMM D YYYY';

      $timeout(function () {
        $('.datetimepickerMonthTo, .datetimepickerMonthFrom').datetimepicker({
          format: 'LL'
        }).on('dp.change', function (event) {
          $(this).change();
        }).on('dp.show', function(e) {
          $('.bootstrap-datetimepicker-widget .active')
            .addClass('bg-'+$scope.role)
            .css({'border': 'none', color: 'white'});
          $('.bootstrap-datetimepicker-widget .today').toggleClass('' + $scope.role);
        });
      });





      $scope.functionHideCode = function (bool) {
            if ($scope.currentClass.code === null && !bool) {
                $http.get(appSettings.link + '/class/code')
                    .then(function (response) {
                        $scope.currentClass.code = response.data.code;
                    });

                $scope.clickcount = true;
            }
            else if ($scope.currentClass.code === null && bool) {
                $scope.clickcount = false;
                $timeout(function () {
                    $('#myonoffswitch').prop('checked', false);
                });

            }
            else {
                $scope.clickcount = !$scope.clickcount;
            }
        }
      $scope.generateSemesterNames = function (value, format) {

        var year = moment(value, format).format('YYYY');

        var semesterNames = [];
        var defaultSem = ['Winter ' + year, 'Spring ' + year, 'Summer ' + year, 'Autumn ' + year];
        for (var i = 0; i < defaultSem.length; i++) {
          var obj = defaultSem[i];
          semesterNames[i] = {'id': i, 'option': obj, 'val': obj};
        }
        return semesterNames;
      };

      if (items === undefined) {
            $scope.ArrayOfUploadFiles = [];
            $scope.httpParams = {};
            $scope.httpParams.method = "POST";
            $scope.httpParams.url = appSettings.link + 'class';
            $scope.currentClass = {};
            $scope.currentClass.reminder = -1;
            $scope.currentClass.time = [];
            $scope.currentClass.image = false;
            $scope.currentClass.semester = {};
            $scope.currentClass.color = "#a7687f";
            $scope.currentClass.code = null;
            $scope.currentClass.semester.syllabus = [];
            $scope.functionHideCode();
            this.modalConstant = {
                header: "Create Class",
                buttonSubmit: "CREATE CLASS"
            };
        }
        else {

          $scope.ArrayOfUploadFiles = _.map(items.semester.syllabus, function(obj){
            var newUploadItem = {};
            newUploadItem.name = obj.filename;
            newUploadItem.id = obj.id;
            return newUploadItem;
          });
          $scope.httpParams = {};
          $scope.currentClass = angular.copy(items);
          $scope.currentClass.color = $scope.currentClass.color.toLowerCase();
        $scope.httpParams.method = "PUT";
          $scope.httpParams.url = appSettings.link + 'class' + '/' + $scope.currentClass.id;
          $scope.currentClass.semester.syllabus = items.semester.syllabus.map(function(obj){
            var newUploadItem = obj.id;
            return newUploadItem;
          });
          $scope.currentClass.image = angular.copy(items.image);

          if($scope.currentClass.time.length || $scope.currentClass.reminder !== -1){
            $scope.showContinue = 1;
          }

          $scope.dateForUpdate = {
            from: $scope.currentClass.semester.from,
            to: $scope.currentClass.semester.to,
            name: $scope.currentClass.semester.name
          };

          this.modalConstant = {
            header: "Update class",
            buttonSubmit: "UPDATE CLASS"
          };
          $scope.functionHideCode(true);
          angular.element('#AddDateTime').css('display', 'block');
        }

        if(!$scope.dateForUpdate || $scope.dateForUpdate.from == "0000-00-00" || $scope.dateForUpdate.from == "Invalid date") {
          $scope.dateForUpdate = {
            from: moment(new Date()).format("YYYY-MM-DD"),
            to: moment(new Date()).add(2, 'month').format("YYYY-MM-DD"),
            name: ''
          };
        }

      $scope.semesterNames = $scope.generateSemesterNames($scope.dateForUpdate.from, 'YYYY-MM-DD');


        $scope.dateForUpdate.from = moment($scope.dateForUpdate.from).format('LL');
        $scope.dateForUpdate.to = moment($scope.dateForUpdate.to).format('LL');


        $scope.$watch('dateForUpdate.from', function (newVal, oldVal) {
            var  format = 'MMMM D, YYYY';
            var from = moment(newVal, format);

            $scope.semesterNames = $scope.generateSemesterNames(newVal, "MMMM D, YYYY");

          if(moment($scope.dateForUpdate.from, format).format('MM') == '01' || moment($scope.dateForUpdate.from, format).format('MM') == '02' || moment($scope.dateForUpdate.from, format).format('MM') == '12'){
            $scope.currentClass.semester.name = $scope.semesterNames[0].option;
          } else if(moment($scope.dateForUpdate.from, format).format('MM') == '03' || moment($scope.dateForUpdate.from, format).format('MM') == '04' || moment($scope.dateForUpdate.from, format).format('MM') == '05') {
            $scope.currentClass.semester.name = $scope.semesterNames[1].option;
          }else if(moment($scope.dateForUpdate.from, format).format('MM') == '06' || moment($scope.dateForUpdate.from, format).format('MM') == '07' || moment($scope.dateForUpdate.from, format).format('MM') == '08') {
            $scope.currentClass.semester.name = $scope.semesterNames[2].option;
          }else if(moment($scope.dateForUpdate.from, format).format('MM') == '09' || moment($scope.dateForUpdate.from, format).format('MM') == '10' || moment($scope.dateForUpdate.from, format).format('MM') == '11') {
            $scope.currentClass.semester.name = $scope.semesterNames[3].option;
          }
          $rootScope.$broadcast('semester-name-was-changed', $scope.semesterNames,  $scope.currentClass.semester.name);

          $scope.minimalDateForCalendar = moment($scope.dateForUpdate.from, format).add(2, 'month').format();
          $scope.maximumDateForCalendar = moment($scope.dateForUpdate.from, format).add(6, 'month').format();
          $scope.oldValue = moment($scope.dateForUpdate.to, format).format('LL');

          $timeout(function () {
            $('.datetimepickerMonthTo').datetimepicker('destroy');
            $('.datetimepickerMonthTo').datetimepicker({
              minDate: $scope.minimalDateForCalendar,
              maxDate:  $scope.maximumDateForCalendar,
              format: 'LL'
            });
          }).then(function () {
            if(new Date($scope.minimalDateForCalendar) > new Date($scope.oldValue) || new Date($scope.maximumDateForCalendar)< new Date($scope.oldValue)) {
              $scope.dateForUpdate.to = moment(from, format).add(2, 'month').format('LL');
            } else {
              $scope.dateForUpdate.to = $scope.oldValue;
            }
          });
        });

        $rootScope.$on('semester-was-changed', function (event, value) {
          var arrayOfStrings = value.split(' ');
          var  format = 'MMMM D, YYYY';

          if(arrayOfStrings[0] === 'Winter'){
            if(moment($scope.dateForUpdate.from, format).format('MM') !== '01' || moment($scope.dateForUpdate.from, format).format('MM') !== '02' || moment($scope.dateForUpdate.from, format).format('MM') !== '12') {
              $scope.dateForUpdate.from = "January 1, " + arrayOfStrings[1];
              // $scope.dateForUpdate.to = "March 01, " + arrayOfStrings[1];
            }
          } else if(arrayOfStrings[0] === 'Spring') {
            if(moment($scope.dateForUpdate.from, format).format('MM') !== '03' || moment($scope.dateForUpdate.from, format).format('MM') !== '04' || moment($scope.dateForUpdate.from, format).format('MM') !== '05'){
              $scope.dateForUpdate.from = "March 1, " + arrayOfStrings[1];
              // $scope.dateForUpdate.to = "May 01, " + arrayOfStrings[1];
            }
          } else if(arrayOfStrings[0] === 'Summer'){
            if(moment($scope.dateForUpdate.from, format).format('MM') !== '06' || moment($scope.dateForUpdate.from, format).format('MM') !== '07' || moment($scope.dateForUpdate.from, format).format('MM') !== '08') {
              $scope.dateForUpdate.from = "June 1, " + arrayOfStrings[1];
              // $scope.dateForUpdate.to = "August 01, " + arrayOfStrings[1];
            }
          } else if(arrayOfStrings[0] === 'Autumn'){
            if(moment($scope.dateForUpdate.from, format).format('MM') !== '09' || moment($scope.dateForUpdate.from, format).format('MM') !== '10' || moment($scope.dateForUpdate.from, format).format('MM') !== '11') {
              $scope.dateForUpdate.from = "September 1, " + arrayOfStrings[1];
              // $scope.dateForUpdate.to = "November 01, " + arrayOfStrings[1];
            }
          }
          $timeout(function () {
            $('.datetimepickerMonthTo').datetimepicker('destroy');
            $('.datetimepickerMonthTo').datetimepicker({
              minDate: $scope.minimalDateForCalendar,
              maxDate:  $scope.maximumDateForCalendar,
              format: 'LL'
            });
          })
        });

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

        $scope.$watch('picFile', function () {
            if ($scope.picFile) {
                $scope.uploadPic($scope.picFile);
            }
        });

////////// FUNCTION UPLOAD PICTURE TO SERVER //////////////////
        $scope.uploadPic = function (file) {
            file.upload = Upload.upload({
                url: appSettings.link + 'upload',
                data: {file: file}
            });
            file.upload.then(function (response) {
                file.result = response.data;
                $scope.uploadPictureId = response.data.data.id;
                $scope.currentClass.image_id = $scope.uploadPictureId;
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;

            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                $scope.progressNumber = file.progress;
            });
        };

        //$scope.ArrayOfUploadFiles = [];
        $scope.UploadFileHeight = -20;
        $scope.$watch('UploadFile', function () {
            if ($scope.UploadFile) {
                $scope.uploadFile($scope.UploadFile);
                $scope.UploadFileHeight += 10;
            }
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
                $scope.currentClass.semester.syllabus.push(newUploadItem.id);
                $scope.ArrayOfUploadFiles.push(newUploadItem);

            },  function (response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ': ' + response.data;

            },function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                $scope.progressNumber = file.progress;
            });
        };

////////// FUNCTION DELETE FILE FROM SERVER AND LIST OF UPLOAD FILES//////////////////
      $scope.arrayOfFilesToDelete = [];
      $scope.DeleteFileFromSyllabus = function (e) {
        var deleteFileId = $(e.target).parent().attr('id');

        $scope.arrayOfFilesToDelete.push(+deleteFileId);
        $scope.currentClass.semester.syllabus = _.filter($scope.currentClass.semester.syllabus, function (num) {
          return num != deleteFileId;
        });
        $scope.ArrayOfUploadFiles = _.filter($scope.ArrayOfUploadFiles,function(obj) { return obj.id != deleteFileId; });
        $(e.target).parent().remove();
      };

        function deleteSyllabus(array){
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


        $scope.ok = function () {
          $scope.invalidTimeMessage = false;

          for (var t=0; t<$scope.currentClass.time.length; t++){
            var from = moment($scope.currentClass.time[t].from, 'LT');
            var to = moment($scope.currentClass.time[t].to, 'LT');
            if(to.diff(from)<1800000){
              $scope.invalidTimeMessage = true;
              return false;
            }
          }

          if($scope.CreateClassModal.$invalid) {
            return false;
          } else {
            if ($scope.showContinue == 1) {
              $scope.currentClass.semester.from = moment($scope.dateForUpdate.from, $scope.format).format('YYYY-MM-DD');
              $scope.currentClass.semester.to = moment($scope.dateForUpdate.to, $scope.format).format('YYYY-MM-DD');
              // $scope.currentClass.semester.name = $scope.dateForUpdate.name;
              for (var i = 0; i < $scope.currentClass.time.length; i++) {
                var obj = $scope.currentClass.time[i];
                $scope.currentClass.time[i] = {day: obj.day, from: obj.from, to: obj.to};
              }
            }
            else {
              $scope.currentClass.time = [];
              $scope.currentClass.semester = {};
            }
            $http({
              url: $scope.httpParams.url,
              method: $scope.httpParams.method,
              data: $scope.currentClass
            })
              .then(function (response) {
                  $rootScope.$broadcast('ClassWasEdited', response, $scope.httpParams.method);
                  deleteSyllabus($scope.arrayOfFilesToDelete);
               // $log.log($scope.currentClass)
                  $uibModalInstance.close();
                },
                function (response) {
                  $scope.showErrorMessage = true;
                });
          }

        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
            $rootScope.$broadcast('ClassWasNotEdited');
        };

        $scope.joinClass = function(){

          $http({
            url: 'http://api.classdig.com/class/request',
            method: 'POST',
            data: $scope.classCode
          })
            .then(function (response) {

                $scope.codeWasSend = true;
                // $scope.currentClass.unshift(response.data.data);
                // $uibModalInstance.close();
              },
              function (error) {
                $scope.errorMessage = error.data.message;
                $scope.showErrorMessage = true;

              });
        }
    });

