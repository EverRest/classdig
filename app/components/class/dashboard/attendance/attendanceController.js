'use strict'
app.controller('attendanceController',
  ['$scope',
    '$http',
    '$routeParams',
    'appSettings',
    'uiCalendarConfig',
    '$rootScope',
    '$log', '$timeout', function ($scope, $http, $routeParams, appSettings, uiCalendarConfig, $rootScope, $log, $timeout) {


    $scope.role = $rootScope.user.data.role;

    $scope.hideCustomButton = true;
    $rootScope.$on('class-data-was-received', function () {
      if(!$rootScope.user.classData.classInArchived){
        $scope.hideCustomButton = false;
      }
      if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
        $scope.hideCustomButton = true;
      }
      if (Array.isArray($rootScope.user.classData.members)) {
        $scope.arrayOfChildrenId = [];
        var pickedName = $rootScope.user.classData.members[0].first_name;
        $scope.pickedChildId = $rootScope.user.classData.members[0].id;
        for (var i = 0; i < $rootScope.user.classData.members.length; i++) {
          $scope.arrayOfChildrenId.push($rootScope.user.classData.members[i].first_name);
        }
        $timeout(function () {
          $scope.childName = pickedName;
          $scope.changeChildren($scope.childName);
        });
      }
    });

    $scope.students = [];
    $scope.pickedStudents = [];
    $scope.attendanceList = [];
    $rootScope.activeClassItem = 2;
    $scope.attendance = [];

    $scope.lateIcon = "images/usersList/timer-circle.svg";
    $scope.absentIcon = "images/usersList/cross-circle.svg";
    $scope.presentIcon = "images/usersList/checked-circle.svg";

    $scope.requestDateFormat = 'YYYY/MM/DD';


    $scope.attendanceViewIsActive = true;


    var classId = $routeParams.classId;
    var userId = $rootScope.user.data.id;

    $scope.selectedDate = null;

    $scope.datatime = new Date();

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

    $scope.role = $rootScope.user.data.role;


    $scope.changeChildren = function (name) {
      $scope.childName = name;
      $scope.countClass = 0;
      angular.element('.children').css('border-bottom', '2px solid white');
      angular.element('#' + name).css('border-bottom', '2px solid rgb(207, 81, 93)')
      for (var i = 0; i < $rootScope.user.classData.members.length; i++) {
        if ($rootScope.user.classData.members[i].first_name == $scope.childName) {
          var pickedName = $scope.childName;
          $scope.pickedChildId = $rootScope.user.classData.members[i].id;
          $scope.pickedChild = $rootScope.user.classData.members[i];
          $scope.$broadcast('picked-child-attendance', $scope.pickedChild);
        }
      }
    };


///////////////////////////////////////////////////////////////////////////////

    $scope.parseResponse = function (data) {
      $scope.presentStudents = [];
      $scope.lateStudents = [];
      $scope.absentStudents = [];
      $scope.listAttendance = [0, 0, 0];

      for (var i = 0; i < data.length; i++) {
        if (data[i].type == 1) {
          $scope.presentStudents.push(data[i]);
          $scope.listAttendance[0]++;
        } else if (data[i].type == 2) {
          $scope.absentStudents.push(data[i]);
          $scope.listAttendance[2]++
        } else if (data[i].type == 3) {
          $scope.lateStudents.push(data[i]);
          $scope.listAttendance[1]++
        }
      }
    };

    $scope.getTodayAttendance = function () {
      $http.get(appSettings.link + 'class/' + classId + '/attendance?date=' + $scope.selectedDate)
        .success(function (response) {
          $scope.students = response.data;
          $scope.parseResponse(response.data);
        })
        .error(function () {
          $log.info("Code: " + data.status_code + "; Message: " + data.message);
        })
    };

    ////////////////////////////////////////////////////////////////////////////
    $scope.$watch('datatime', function (date) {
      angular.element(document.getElementById("dropdown-controller")).removeClass('open');
      angular.element(document.querySelector('.dropdown-backdrop')).removeClass('dropdown-backdrop');
      $('#dLabel').attr('aria-expanded', false);

      $scope.selectedDate = moment(date).format($scope.requestDateFormat);
      $scope.slectedMonth = moment(date).format('MMMM');
      $scope.slectedDay = moment(date).format('dddd');


      if ($scope.selectedDate > moment(new Date()).format($scope.requestDateFormat)) {
        $scope.dateIsAhead = true;
      } else {
        $scope.dateIsAhead = false;
      }

      $scope.getTodayAttendance();
      $scope.pickedStudents.splice(0, $scope.pickedStudents.length);
    });

    $rootScope.$on('student-was-selected-in-attendance', function sendRequest(event, student) {

       var from = moment($scope.selectedDate).format("YYYY-MM") + "-01";
       var to = moment(from, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          $http.get(appSettings.link + 'class/' + classId + '/user/' + student.id + '/attendance/report?from=' + from + '&to=' + to)
            .success(function (response) {

              var array = [0, 0, 0];
              for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].type == 1) {
                  array[0]++;
                } else if (response.data[i].type == 2) {
                  array[2]++
                } else if (response.data[i].type == 3) {
                  array[1]++
                }
              }
              student.listAttendance = array;
              student.from = from;
              student.to = to;
            });
        $rootScope.$$listeners['student-was-selected-in-attendance'] = [sendRequest];
    });


    ///////////////////////////////////////////////////////////////////////////


    $scope.pushToAttendanceList = function () {
      for (var i = 0; i < $scope.pickedStudents.length; i++) {
        var studentObj = {
          user_id: $scope.pickedStudents[i].id,
          date: $scope.selectedDate,
          type: $scope.pickedStudents[i].type
        }
        if ($scope.attendanceList.length) {
          for (var j = 0; j < $scope.attendanceList.length; j++) {
            if ($scope.pickedStudents[i].id === $scope.attendanceList[j].user_id) {
              $scope.attendanceList.splice(j, 1);
            }
          }
        }
        $scope.attendanceList.push(studentObj);
      }
    };

    $scope.addStudentStatus = function (type) {
      switch (type) {
        case 'late':
          $scope.pickedStudents.forEach(function (obj) {
            obj.type = 3;
          })
          break;

        case 'absent':
          $scope.pickedStudents.forEach(function (obj) {
            obj.type = 2;
          })
          break;

        case 'present':
          $scope.pickedStudents.forEach(function (obj) {
            obj.type = 1;
          })
          break;
      }
      for (var i = 0; i < $scope.students.length; i++) {
        for (var j = 0; j < $scope.pickedStudents.length; j++) {
          if ($scope.students[i].id === $scope.pickedStudents[j].id) {
            $scope.students[i].type = $scope.pickedStudents[j].type
          }
        }
      }

      $scope.pushToAttendanceList();

      for (var i = 0; i < $scope.students.length; i++) {
        $scope.students[i].state = false;
      }
      $scope.pickedStudents.splice(0, $scope.pickedStudents.length);

      $http.post(appSettings.link + '/class/' + classId + '/attendance', {"users": $scope.attendanceList})
        .success(function () {
          $scope.getTodayAttendance();
        })
        .error(function () {
        })
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
          'img': 'images/usersList/button-late.svg',
          'imgHover': 'images/usersList/timer-circle.svg',
          'text': 'Late',
          'click': $scope.addStudentStatus,
          'params': 'late'
        },
        {
          'img': 'images/usersList/button-absent.svg',
          'imgHover': 'images/usersList/cross-circle.svg',
          'text': 'Absent',
          'click': $scope.addStudentStatus,
          'params': 'absent'
        },
        {
          'img': 'images/usersList/button-present.svg',
          'imgHover': 'images/usersList/checked-circle.svg',
          'text': 'Present',
          'click': $scope.addStudentStatus,
          'params': 'present'
        }
      ],
      'onGlobalButtonClick': null
    };


    /////////////// CALENDAR ////////////

    if($scope.role == 'parent'){
      $scope.parseDate = function (start, end) {
        if(!start || !end || start.id || end.id){
          if($scope.lastFromDate){
            $scope.fromDate = moment($scope.lastFromDate).format('YYYY/MM') + "/01";
            $scope.toDate = moment($scope.fromDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          } else {
            $scope.fromDate = moment(new Date()).format('YYYY/MM') + "/01";
            $scope.toDate = moment($scope.fromDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          }
        } else {
          var fromMonth = moment(start).format('MM');
          var fromDay = moment(start).format('DD');
          var toMonth = moment(end).format('MM');
          if (fromDay != 1 && (+toMonth - +fromMonth) != 1) {
            $scope.fromDate = moment(moment(start).format('YYYY') + "/" + (+fromMonth + 1) + "/01").format($scope.requestDateFormat);
            $scope.toDate = moment($scope.fromDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          } else {
            $scope.fromDate = moment(start).format($scope.requestDateFormat);
            $scope.toDate = moment($scope.fromDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          }
        }
        $scope.lastFromDate = $scope.fromDate;
        $scope.lastToDate = $scope.toDate;
        $scope.slectedMonth = moment($scope.fromDate, $scope.requestDateFormat).format('MMMM');
      };

      $scope.getChildAttendance = function (callback) {
        $http.get(appSettings.link + '/class/' + classId + '/user/' + $scope.pickedChild.id + '/attendance/report?from=' + $scope.fromDate + '&to=' + $scope.toDate)
          .success(function (response) {
            callback(response.data);
          })
      };

      $scope.prepareEvents = function (data, cb) {
        var events = [];
        $scope.attendanceData = data;
        $scope.currentStudent = {};
        $scope.currentStudent.first_name = $scope.pickedChild.first_name;
        $scope.currentStudent.last_name = $scope.pickedChild.last_name;
        $scope.currentStudent.photo = $scope.pickedChild.image;

        var array = [0, 0, 0];

        for (var i = 0; i < $scope.attendanceData.length; i++) {
          events.push({
            start: new Date($scope.attendanceData[i].date),
            allDay: true,
            type: $scope.attendanceData[i].type
          });
        }
        for (i = 0; i < events.length; i++) {
          if (events[i].type == 1) {
            array[0]++;
            events[i].className = 'present';
          } else if (events[i].type == 2) {
            array[2]++;
            events[i].className = 'absent';
          } else if (events[i].type == 3) {
            array[1]++;
            events[i].className = 'late';
          }
        }
        $scope.currentStudent.listAttendance = array;
        cb(events)
      };


      $scope.events = function (start, end, timezone, callback) {
        callback([]);
      };

      $scope.$on('picked-child-attendance',  function(){

        $scope.events2 = function (start, end, timezone, callback) {

          $scope.parseDate(start, end);

          $scope.getChildAttendance(function (data) {
            $scope.prepareEvents(data, function (events) {

              callback(events);
            })
          })

        };
        $scope.eventSources[1] = $scope.events2;
      });
    } else {

      $scope.parseDate = function (start, end) {
        var fromMonth = moment(start).format('MM');
        var fromDay = moment(start).format('DD');
        var toMonth = moment(end).format('MM');
        if (fromDay != 1 && (+toMonth - +fromMonth) != 1) {
          $scope.fromDate = moment(moment(start).format('YYYY') + "/" + (+fromMonth + 1) + "/01").format($scope.requestDateFormat);
          $scope.toDate = moment($scope.fromDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
        } else {
          $scope.fromDate = moment(start).format($scope.requestDateFormat);
          $scope.toDate = moment($scope.fromDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
        }
        $scope.slectedMonth = moment($scope.fromDate, $scope.requestDateFormat).format('MMMM');
      };

      $scope.getChildAttendance = function (callback) {
        $http.get(appSettings.link + '/class/' + classId + '/user/' + userId + '/attendance/report?from=' + $scope.fromDate + '&to=' + $scope.toDate)
          .success(function (response) {
            callback(response.data);
          })
      };

      $scope.prepareEvents = function (data, cb) {
        var events = [];
        $scope.attendanceData = data;
        $scope.currentStudent = {};
        $scope.currentStudent.first_name = $rootScope.user.data.details.data.first_name;
        $scope.currentStudent.last_name = $rootScope.user.data.details.data.last_name;
        $scope.currentStudent.photo = $rootScope.user.data.details.data.photo;

        var array = [0, 0, 0];

        for (var i = 0; i < $scope.attendanceData.length; i++) {
          events.push({
            start: new Date($scope.attendanceData[i].date),
            allDay: true,
            type: $scope.attendanceData[i].type
          });
        }
        for (i = 0; i < events.length; i++) {
          if (events[i].type == 1) {
            array[0]++;
            events[i].className = 'present';
          } else if (events[i].type == 2) {
            array[2]++;
            events[i].className = 'absent';
          } else if (events[i].type == 3) {
            array[1]++;
            events[i].className = 'late';
          }
        }
        $scope.currentStudent.listAttendance = array;
        cb(events)
      };


       $scope.events = function (start, end, timezone, callback) {

         $scope.parseDate(start, end);

         $scope.getChildAttendance(function (data) {
           $scope.prepareEvents(data, function (events) {
             callback(events);
           })
         })
       };
    }

      /* config object */
      $scope.uiConfig = {
        calendar: {
          height: 'auto',
          editable: false,
          header: {
            left: 'prev',// month,agendaWeek,agendaDay',
            center: 'title',
            right: 'next'
          },
          eventClick: $scope.alertOnEventClick,
          eventDrop: $scope.alertOnDrop,
          eventResize: $scope.alertOnResize,
          eventRender: $scope.eventRender
        }
      };

      /* event sources array*/
      $scope.eventSources = [$scope.events];
  }]);
