app.controller('distinguishedController',
  ['$scope',
    '$rootScope',
    '$uibModal',
    '$http',
    'appSettings',
    '$timeout',
    'classData',
    '$routeParams',
    function ($scope, $rootScope, $uibModal, $http, appSettings, $timeout, classData, $routeParams) {

      $rootScope.activeClassItem = 12;

      $scope.animationsEnabled = true;
      $scope.students = [];
      $scope.pickedStudents = [];

      var id = $routeParams.classId;
      var format = "YYYY-MM-DD";
      var role = $rootScope.user.data.role;

      $scope.semester = {};
      $scope.months = [];
      $scope.weeks = [];

      $scope.whatToDisplay = 0;

      $scope.currentState = {};
      $scope.currentState.name = $scope.semester.name;
      $scope.currentState.start = $scope.semester.start;
      $scope.currentState.end = $scope.semester.end;

      $scope.items = $scope.currentState;
      $scope.items.class = $scope.currentClass;

      $scope.distinguishedIcon = "images/distinguished/distinguished.svg";
      $scope.hideCustomButton = true;

      $scope.distingushedViewIsActive = true;


      $rootScope.$on('student-was-selected-in-distinguished-all', function (event, student) {
        $scope.selectedUser =  $scope.pickedStudents[0];
        $scope.studentInformation = $scope.pickedStudents[0];

      });


      $scope.request = function (class_id, start, end) {
        $http.get(appSettings.link + '/distinguished?class_id='+ class_id +'&week_start=' + start + '&week_end=' + end)
          .success(function (response) {
            $scope.students = response.data;
            $scope.items.students = $scope.students;
            if($scope.students){
              for(var i = 0; i < $scope.students.length; i++ ) {
                $scope.students[i].distinguished = true;
              }
            }
            $scope.currentState.start = start;
            $scope.currentState.end = end;
          });
      };

      $scope.iconArrow  = '../images/distinguished/icon-arrow-' + $rootScope.user.data.role + '_3x.png';

      ///MAIN!!!
      classData.getClassById(id, function (data) {

          $scope.currentClassObj = data;
          $scope.currentClass = $scope.currentClassObj.id;
          $scope.items.class = $scope.currentClass;

          $scope.semester.start = data.semester.from;
          $scope.semester.end = data.semester.to;

        if(!$scope.currentClassObj.classInArchived){
          $scope.hideCustomButton = false;
        }
        if($rootScope.role === 'student' && $scope.currentClassObj.owner !== $rootScope.user.data.id){
          $scope.hideCustomButton = true;
        }

          if($scope.semester.start != "0000-00-00" || $scope.semester.end != "0000-00-00"){
            $scope.request($scope.currentClass, $scope.semester.start, $scope.semester.end);
            //////////////////////////////////////////SEMESTER
            (function fillSemester() {
              if(moment($scope.semester.start, format).format('MM') == '01' || moment($scope.semester.start, format).format('MM') == '02' || moment($scope.semester.start, format).format('MM') == '12'){
                $scope.semester.name = "winter";
              } else if(moment($scope.semester.start, format).format('MM') == '03' || moment($scope.semester.start, format).format('MM') == '04' || moment($scope.semester.start, format).format('MM') == '05') {
                $scope.semester.name = "spring";
              }else if(moment($scope.semester.start, format).format('MM') == '06' || moment($scope.semester.start, format).format('MM') == '07' || moment($scope.semester.start, format).format('MM') == '08') {
                $scope.semester.name = "summer";
              }else if(moment($scope.semester.start, format).format('MM') == '09' || moment($scope.semester.start, format).format('MM') == '10' || moment($scope.semester.start, format).format('MM') == '11') {
                $scope.semester.name = "autumn";
              }
              $scope.semester.year = moment($scope.semester.start, format).format('YYYY');
            })();

            //////////////////////////////////////////MONTHS
            function getMonthes (from, to) {
              var start = moment(from, format).format('MM');
              var end = moment(to, format).format('MM');

              for(start; start <= end; start++){
                var startDate = moment(from, format).format('YYYY') + "-" + start + "-01";
                var endDate = moment(startDate, format).add(1, 'month').format(format);
                endDate = moment(endDate, format).add(-1, 'day').format(format);

                var month = {
                  name : moment(startDate, format).format("MMMM"),
                  year: moment(startDate, format).format("YYYY"),
                  start: startDate,
                  end: endDate
                };
                $scope.months.push(month);
              }
            }
            (function fillMonthsArray() {
              if(moment($scope.semester.start, format).format('YYYY') != moment($scope.semester.end, format).format('YYYY') ) {
                getMonthes($scope.semester.start, moment($scope.semester.start, format).format("YYYY") + '14-12');
                getMonthes( moment($scope.semester.end, format).format("YYYY") + '-01-01', $scope.semester.end);
              } else {
                getMonthes($scope.semester.start, $scope.semester.end);
              }
            })();

            //////////////////////////////////////////WEEKS
            (function fillWeeksArray() {
              var year = 1;
              var weekStart = moment($scope.semester.start, format).format(format);
              while( moment(weekStart, format).format("dddd") != "Monday") {
                weekStart = moment(weekStart, format).add(-1, 'day');
                moment(weekStart).format(format);
              }
              for(weekStart; weekStart <= moment($scope.semester.end, format); weekStart = moment(weekStart, format).add(1, 'week')){
                var weekEnd = moment(weekStart, format).add(1, 'week');
                weekEnd = moment(weekEnd, format).add(-1, 'day');

                var obj = {
                  subName : moment(weekStart, format).format(format) + "-" + moment(weekEnd, format).format(format),
                  name : "week",
                  year : year++,
                  start : moment(weekStart,format).format(format),
                  end : moment(weekEnd,format).format(format)
                }
                $scope.weeks.push(obj);
              }
            })();

          } else {
            $scope.whatToDisplay = 3;
          }
      });







      $scope.openModal = function (size, parentSelector) {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/distinguished/distinguishedModal/distinguishedModal.html',
          controller: 'distinguishedModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          //appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });
      };

      $scope.data = {
        'items': [],
        'hide' : ['student', 'parent']
      };

      //
      $rootScope.$on('need-to-be-reloaded', function(event, start, end, currentClass) {
        $scope.request(currentClass, start, end);
      });

      $scope.choseOption = function (context) {
        $scope.pickedStudents = [];
        for(var i = 0; i < $scope.contextMenu.items.length; i++){
          $scope.contextMenu.items[i].itemPicked = 3;
        }
        $scope.contextMenu.items[context].itemPicked = 2;
        $scope.whatToDisplay = context;
        if(context == 0) {
          $scope.currentState.name = 'semester';
          $scope.request($scope.currentClass, $scope.semester.start, $scope.semester.end);
        } else if(context == 1) {
          $scope.currentState.name = $scope.months[0].name;
          $scope.request($scope.currentClass, $scope.months[0].start, $scope.months[0].end);
        } else {
          $scope.currentState.name = $scope.weeks[0].year;
          $scope.request($scope.currentClass, $scope.weeks[0].start, $scope.weeks[0].end);
        }
      };

      $scope.contextMenu = {
        'items': [
          {
            'img': 'images/distinguished/icon-semester-' + role + '_3x.png',
            'imgHover': 'images/distinguished/icon-semester-hover_3x.png',
            'text': 'Semester',
            'distinguished' : true,
            'state' : true,
            'active': true,
            'click': $scope.choseOption,
            'itemPicked': 2,
            'context' : 0
          },
          {
            'img': 'images/distinguished/icon-month-' + role + '_3x.png',
            'imgHover': 'images/distinguished/icon-month-hover_3x.png',
            'text': 'Month',
            'distinguished' : true,
            'state' : true,
            'active' : true,
            'click': $scope.choseOption,
            'itemPicked': 3,
            'context' : 1
          },
          {
            'img': 'images/distinguished/icon-week-' + role + '_3x.png',
            'imgHover': 'images/distinguished/icon-week-hover_3x.png',
            'text': 'Week',
            'distinguished' : true,
            'state' : true,
            'active' : true,
            'click':$scope.choseOption,
            'itemPicked': 3,
            'context' : 2
          }
        ]
      };

      $('.slider').slick({
        arrows: false
      });

      $('.left').click(function(){
        $('.slider').slick('slickPrev');
      });

      $('.right').click(function(){
        $('.slider').slick('slickNext');
      });

      $scope.sendRequest = function (state) {
        if($scope.whatToDisplay == 1) {
          for(var i = 0; i < $scope.months.length; i++){
            if($scope.months[i].name == state) {
              $scope.request($scope.currentClass, $scope.months[i].start, $scope.months[i].end);
            }
          }
        } else if($scope.whatToDisplay == 2) {
          for(var i = 0; i < $scope.weeks.length; i++){
            if($scope.weeks[i].year == state) {
              $scope.request($scope.currentClass, $scope.weeks[i].start, $scope.weeks[i].end);
            }
          }
        }
      };

      $scope.next = function () {
        $timeout(function () {
          $scope.currentState.name = document.querySelector('.slick-current').firstElementChild.innerHTML;
          $scope.sendRequest($scope.currentState.name)
        });
      };

      $scope.prev = function () {
        $timeout(function () {
          $scope.currentState.name = document.querySelector('.slick-current').firstElementChild.innerHTML;
          $scope.sendRequest($scope.currentState.name)
        });
      };
    }]);
