app.controller('behaviourController',
  ['$scope',
    '$rootScope',
    '$http',
    'appSettings',
    '$uibModal',
    '$routeParams',
    'uiCalendarConfig',
    'uiDatetimePickerConfig',
    '_',
    '$log',
    '$timeout',
    'behaviorPreParser',
    '$location',
    function ($scope, $rootScope, $http, appSettings, $uibModal, $routeParams, uiCalendarConfig, uiDatetimePickerConfig, _, $log, $timeout, behaviorPreParser, $location) {

      $rootScope.activeClassItem = 3;
      $scope.behaviourViewIsActive = true;

      $scope.requestDateFormat = 'YYYY/MM/DD';

      $scope.role = $rootScope.user.data.role;

      var classId = $routeParams.classId;
      var userId = $rootScope.user.data.id;

      var selectedDate;

      $scope._ = _;
      $scope.students = [];
      $scope.negativeIcon = "images/usersList/downfist.svg";
      $scope.positiveIcon = "images/usersList/upfist.svg";

      $scope.datatime = new Date();

      $scope.animationsEnabled = true;

      $scope.hideCustomButton = true;

      $rootScope.$on('class-data-was-received', function sendRequestInit() {
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

        $scope.getListAllBehavior();

        $rootScope.$$listeners['class-data-was-received'] = [sendRequestInit];
      });

      $rootScope.$on('new-category-created', function () {
        $scope.getListAllBehavior();
      });

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
            $scope.$broadcast('picked-child-behaviour', $scope.pickedChild);
          }
        }
      };

      ///// WORKING FINE--------------------------------------------------------------------------------

      // ====================== add bonus mark ==========================
      $scope.addBonus = function () {
        var studentsArray = [];
        for (var i = 0; i < $scope.students.length; i++) {
          if ($scope.students[i].state === true) {
            studentsArray.push($scope.students[i].id)
          }
        }
        $http({
          url: appSettings.link +'bonus-mark',
          method: "POST",
          data:{'students': studentsArray,
          'class_id': $routeParams.classId}
        })
          .then(function (response) {
            var modalInstance = $uibModal.open({
              templateUrl: 'components/class/dashboard/behaviour/addBonusSusses/addBonusSusses.html',
              controller: 'addBonusSussesController',
              controllerAs: '$ctrl',
              size: 'sm',
              resolve: {
                information: function () {
                  return 'Bonus mark has been added successfully.';
                }
              }
            }).closed.then(function () {
              for (var i = 0; i < $scope.students.length; i++) {
                $scope.students[i].state = false;
                $scope.pickedStudents=[]
              }
            });
            },
            function (response) {
              var modalInstance = $uibModal.open({
                templateUrl: 'components/class/dashboard/behaviour/addBonusSusses/addBonusSusses.html',
                controller: 'addBonusSussesController',
                controllerAs: '$ctrl',
                size: 'sm',
                resolve: {
                  information: function () {
                    return "Bonus mark hasn't been added.";
                  }
                }
              }).closed.then(function () {
                for (var i = 0; i < $scope.students.length; i++) {
                  $scope.students[i].state = false;
                  $scope.pickedStudents=[]
                }
              });
            });
      };
      // ====================== add positive behavior ===================
      $scope.addPositiveBehavior = function (type) {
        var openModal = false;
        $log.info("add Positive");

        for (var i = 0; i < $scope.students.length; i++) {
          if ($scope.students[i].state === true) {
            openModal = true;
          }
        }

        if (openModal) {
          var modalInstance = $uibModal.open({
            templateUrl: 'components/class/dashboard/behaviour/behaviourModal/behaviourModal.html',
            controller: 'behaviourModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
              positive: true,
              type: function () {
                return $scope.type;
              },
              selectedDate: function () {
                return selectedDate;
              },
              pickedStudents: function () {
                return $scope.pickedStudents
              },
              students: function () {
                return $scope.students
              },
              behaviours: function () {
                return $scope.behaviours;
              }
            }
          }).closed.then(function () {
            $log.log("close modal");
            $scope.getUsersBehavior();
            $scope.pickedStudents = [];
            $http.get(appSettings.link + '/class/' + classId + '/behavior?date=' + selectedDate)
              .success(function (response) {
                $scope.students = response.data;
                $scope.generalInfo = $scope.createGeneralInfoBehaviours(response.data);
                $log.log($scope.students);
              })
          });
        }
      };
      // ====================== add negative behavior ===================
      $scope.addNegativeBehavior = function (type) {
        var openModal = false;
        $log.info("add Negative");

        for (var i = 0; i < $scope.students.length; i++) {
          if ($scope.students[i].state === true) {
            openModal = true;
          }
        }
        if (openModal) {
          var modalInstance = $uibModal.open({
            templateUrl: 'components/class/dashboard/behaviour/behaviourModal/behaviourModal.html',
            controller: 'behaviourModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
              positive: false,
              type: function () {
                return $scope.type;
              },
              selectedDate: function () {
                return selectedDate;
              },
              pickedStudents: function () {
                return $scope.pickedStudents
              },
              students: function () {
                return $scope.students
              },
              behaviours: function () {
                return $scope.behaviours;
              }
            }
          }).closed.then(function () {
            $log.log("close modal");
            $scope.getUsersBehavior();
            $scope.pickedStudents = [];
            $http.get(appSettings.link + '/class/' + classId + '/behavior?date=' + selectedDate)
              .success(function (response) {
                $scope.students = response.data;
                $scope.generalInfo = $scope.createGeneralInfoBehaviours(response.data);
                $log.log($scope.students);
              })
          })
        }
      };
      // ====================== add messaging ===================
      $scope.addMessaging = function () {
        $log.info("add Messaging");
        $location.path('/message');
      };
      //==========================================================
      var click = function () {
        $log.info("click");
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
            'img': 'images/custom-button/button-message_3x.png',
            'imgHover': 'images/hover_img/message.png',
            'text': 'Messaging',
            'click': $scope.addMessaging,
            'params': 'message'
          },
          {
            'img': 'images/custom-button/button-bonus_3x.png',
            'imgHover': 'images/hover_img/bonus.png',
            'text': 'Add bonus',
            'click': $scope.addBonus,
            'params': 'bonus'
          },
          {
            'img': 'images/custom-button/button-negative_3x.png',
            'imgHover': 'images/hover_img/need-work.png',
            'text': 'Need work',
            'click': $scope.addNegativeBehavior,
            'params': 'negative'
          },
          {
            'img': 'images/custom-button/button-positive_3x.png',
            'imgHover': 'images/hover_img/positive.png',
            'text': 'Positive',
            'click': $scope.addPositiveBehavior,
            'params': 'positive'
          }
        ]
      };

      $rootScope.$on("student-was-selected-in-behaviour", function sendRequest() {
        $scope.getUsersBehavior();
          $scope.studentsInfoFiltered = $scope.studentsInfo.filter(function (obj) {
            for(var i = 0; i < $scope.pickedStudents.length; i++){
              if(obj.user_id === $scope.pickedStudents[i].id) return true
            }
            return false
          });
        $rootScope.$$listeners['student-was-selected-in-behaviour'] = [sendRequest];
      });

      $scope.getUsersBehavior = function () {
        $http.get(appSettings.link + '/class/' + classId + '/behavior/report?from=' + $scope.dateFrom + '&to=' + $scope.dateTo)
          .success(function (response) {
            $scope.studentsInfo = $scope.addMissingStudents(response.data);
            $scope.studentsInfo = $scope.updateListBehaviours($scope.studentsInfo);
            $scope.studentsInfo = $scope.addColorBehaviours($scope.studentsInfo);
          })
          .error(function () {
            $log.info("Code: " + data.status_code + "; Message: " + data.message);
          })
      };

      $scope.prepareDataBehavior = function (behavior) {
        if (behavior == 1) {
          return {
            data: [],
            labels: $scope.configChart.positiveLabels,
            key: 'positive'
          }
        }
        return {
          data: [],
          labels: $scope.configChart.negativeLabels,
          key: 'negative'
        }
      };

      $scope.addMissingStudents = function (data) {
        var template = behaviorPreParser.generateTemplate($scope.behaviours);
        for(var i = 0; i < $scope.students.length; i++){
          var student = data.find(function (obj) {
            return obj.user_id === $scope.students[i].id
          });
          if(student){
              student.behavior['1'] = Object.assign({}, template['1'], student.behavior['1']);
              student.behavior['2'] = Object.assign({}, template['2'], student.behavior['2']);
          } else {
            $scope.students[i].behavior = template;
            $scope.students[i].user_id = $scope.students[i].id;
            data.push($scope.students[i])
          }
        }
        return data
      };

      $scope.updateListBehaviours = function (data) {
        var boolKey = false;
        for (var i = 0; i < data.length; i++) { // users
          var beh = data[i]["behavior"];
          for (var b in beh) {
            var d = $scope.prepareDataBehavior(b);
            for (var keyB = 0; keyB < d.labels.length; keyB++) { // key data chart label
              boolKey = false;
              for (var key in beh[b]) { // behaviors
                if (key === d.labels[keyB]) {
                  d.data[keyB] = data[i]["behavior"][b][key]["count"];
                  boolKey = true;
                  break;
                }
              }
              if (!boolKey) d.data[keyB] = 0;
            }
            data[i]["behavior"][b][d.key] = d.data;
          }
        }
        return data;
      };

      $scope.addColorBehaviours = function (data) {
        for (var i = 0; i < data.length; i++) { // users
          var boolKey = false;

          for (var keyB = 0; keyB < $scope.configChart.positiveLabels.length; keyB++) { // key data chart label
            boolKey = false;
            for (var key in data[i]["behavior"][1]) { // behaviors
              if (key === $scope.configChart.positiveLabels[keyB]) {
                data[i]["behavior"][1][key]["color"] = $scope.configChart.positiveBackgroundColor[keyB];
                boolKey = true;
                break;
              }
            }
          }

          for (var keyB = 0; keyB < $scope.configChart.negativeLabels.length; keyB++) { // key data chart label
            boolKey = false;
            for (var key in data[i]["behavior"][2]) { // behaviors
              if (key === $scope.configChart.negativeLabels[keyB]) {
                data[i]["behavior"][2][key]["color"] = $scope.configChart.negativeBackgroundColor[keyB];
                boolKey = true;
                break;
              }
            }
          }
        }
        return data;
      };

      function findImg(desc) {
        var elem = $scope.behaviours.find(function (obj) {
          return obj.description === desc;
        });
        return elem.image
      }

      $scope.createGeneralInfoBehaviours = function (data) {
        var generalInfoTmp = {
          "positive": {},
          "negative": {}
        };
        for (var i = 0; i < data.length; i++){
          if(data[i].behavior_type === 1){
            if(data[i].behavior_description in generalInfoTmp.positive){
              var obj = {
                photo : data[i].photo
              };
              generalInfoTmp.positive[data[i].behavior_description].users.push(obj);
            }else {
              generalInfoTmp.positive[data[i].behavior_description] = { users : [] };
              obj = {
                photo : data[i].photo
              };
              generalInfoTmp.positive[data[i].behavior_description].users.push(obj);
            }
            generalInfoTmp.positive[data[i].behavior_description].image = findImg(data[i].behavior_description)

          } else if(data[i].behavior_type === 2){
            if(data[i].behavior_description in generalInfoTmp.negative){
              var obj = {
                photo : data[i].photo
              };
              generalInfoTmp.negative[data[i].behavior_description].users.push(obj);
            }else {
              generalInfoTmp.negative[data[i].behavior_description] = { users : [] };
              obj = {
                photo : data[i].photo
              };
              generalInfoTmp.negative[data[i].behavior_description].users.push(obj);
              generalInfoTmp.negative[data[i].behavior_description].image = findImg(data[i].behavior_description)
            }
          }
        }

        return generalInfoTmp;
      };

      //====== get list all behaviour =======
      $scope.getListAllBehavior = function () {
        $http.get(appSettings.link + 'behavior/' + $rootScope.user.classData.owner)
          .success(function (response) {
            $log.info("behaviors", response);
            $scope.behaviours = response.data;
            $scope.configChart =  behaviorPreParser.createConfigObj($scope.behaviours);

            $scope.$watch('datatime', function (date) {
              angular.element(document.getElementById("dropdown-controller")).removeClass('open');
              angular.element(document.querySelector('.dropdown-backdrop')).removeClass('dropdown-backdrop');
              $('#dLabel').attr('aria-expanded', false);

              $scope.pickedStudents = [];
              selectedDate = moment(date).format($scope.requestDateFormat);

              $scope.dateFrom = moment(selectedDate).format("YYYY/MM") + "/01";
              $scope.dateTo = moment($scope.dateFrom, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);

              $scope.slectedMonth = moment(date).format('MMMM');
              $scope.slectedDay = moment(date).format('dddd');

              if (selectedDate > moment(new Date()).format($scope.requestDateFormat)) {
                $scope.dateIsAhead = true;
              } else {
                $scope.dateIsAhead = false;
              }

              $http.get(appSettings.link + '/class/' + classId + '/behavior?date=' + selectedDate)
                .success(function (response) {
                  $scope.students = response.data;
                  $log.log("response on behaviour request", $scope.students);
                  $scope.generalInfo = $scope.createGeneralInfoBehaviours(response.data);
                  $scope.getUsersBehavior();
                })
            });




          })
          .error(function (data) {
            $log.info("Code: " + data.status_code + "; Message: " + data.message);
          });
      };

      ///// WORKING FINE=====================================================================================


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
          $http.get(appSettings.link + '/class/' + classId + '/user/' + $scope.pickedChild.id + '/behavior/report?from=' + $scope.fromDate + '&to=' + $scope.toDate)
            .success(function (response) {
              callback(response.data);
            })
        };

        $scope.prepareEvents = function (data, cb) {

          var events = [];
          $scope.behaviourData = data;
          $scope.currentStudent = {};
          $scope.currentStudent.first_name = $scope.pickedChild.first_name;
          $scope.currentStudent.last_name = $scope.pickedChild.last_name;
          $scope.currentStudent.photo = $scope.pickedChild.image;
          var behaviour = angular.copy(behaviorPreParser.generateTemplate($scope.behaviours));
          behaviour['1'].positive = [];
          behaviour['2'].negative = [];


          for (var i = 0; i < $scope.behaviourData.length; i++) {
            events.push({
              start: new Date($scope.behaviourData[i].date),
              allDay: true,
              type: $scope.behaviourData[i].type
            });
            if($scope.behaviourData[i].type === 1){
              behaviour['1'][$scope.behaviourData[i].description].count++;
              var ind = $scope.configChart.positiveLabels.indexOf($scope.behaviourData[i].description);
              if(!behaviour['1'].positive[ind]){
                behaviour['1'].positive[ind] = 1;
              } else {
                behaviour['1'].positive[ind]++;
              }
            } else if($scope.behaviourData[i].type === 2){
              behaviour['2'][$scope.behaviourData[i].description].count++;
              var ind = $scope.configChart.negativeLabels.indexOf($scope.behaviourData[i].description);
              if(!behaviour['2'].negative[ind]){
                behaviour['2'].negative[ind] = 1;
              } else {
                behaviour['2'].negative[ind]++;
              }
            }
          }
          for (i = 0; i < events.length; i++) {
            if (events[i].type == 1) {
              events[i].className = 'present';
            } else if (events[i].type == 2) {
              events[i].className = 'absent';
            }
          }
          $scope.currentStudent.behaviour = behaviour;
          $scope.requestInProgress = false;
          cb(events)
        };


        $scope.events = function (start, end, timezone, callback) {
          callback([]);
        };

        $scope.$on('picked-child-behaviour',  function(){

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

      }
      else {
        $scope.requestInProgress = true;
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
          $http.get(appSettings.link + '/class/' + classId + '/user/' + userId + '/behavior/report?from=' + $scope.fromDate + '&to=' + $scope.toDate)
            .success(function (response) {
              callback(response.data);
            })
        };

        $scope.prepareEvents = function (data, cb) {
          var events = [];
          $scope.behaviourData = data;
          $scope.currentStudent = {};
          $scope.currentStudent.first_name = $rootScope.user.data.details.data.first_name;
          $scope.currentStudent.last_name = $rootScope.user.data.details.data.last_name;
          $scope.currentStudent.photo = $rootScope.user.data.details.data.photo;
          var behaviour = angular.copy(behaviorPreParser.generateTemplate($scope.behaviours));
          behaviour['1'].positive = [];
          behaviour['2'].negative = [];

          for (var i = 0; i < $scope.behaviourData.length; i++) {
            events.push({
              start: new Date($scope.behaviourData[i].date),
              allDay: true,
              type: $scope.behaviourData[i].type
            });
            if($scope.behaviourData[i].type === 1){
              behaviour['1'][$scope.behaviourData[i].description].count++;
              var ind = $scope.configChart.positiveLabels.indexOf($scope.behaviourData[i].description);
              if(!behaviour['1'].positive[ind]){
                behaviour['1'].positive[ind] = 1;
              } else {
                behaviour['1'].positive[ind]++;
              }
            } else if($scope.behaviourData[i].type === 2){
              behaviour['2'][$scope.behaviourData[i].description].count++;
              var ind = $scope.configChart.negativeLabels.indexOf($scope.behaviourData[i].description);
              if(!behaviour['2'].negative[ind]){
                behaviour['2'].negative[ind] = 1;
              } else {
                behaviour['2'].negative[ind]++;
              }
            }
          }
          for (i = 0; i < events.length; i++) {
            if (events[i].type == 1) {
              events[i].className = 'present';
            } else if (events[i].type == 2) {
              events[i].className = 'absent';
            }
          }

          $scope.currentStudent.behaviour = behaviour;
          $scope.requestInProgress = false;
          cb(events)
        };

          $scope.events = function (start, end, timezone, callback) {

            $scope.parseDate(start, end);

            $scope.getChildAttendance(function (data) {

              if(!$scope.behaviours) {
                $scope.$watch('behaviours', function () {
                  $scope.prepareEvents(data, function (events) {
                    callback(events);
                  });
                });
              } else {
                $scope.prepareEvents(data, function (events) {
                  callback(events);
                });
              }
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
      }; //TODO GOOD

      /* event sources array*/
      $scope.eventSources = [$scope.events];//TODO GOOD

    }
  ])
;
