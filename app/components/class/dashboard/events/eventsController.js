app.controller('eventsController',
  ['$scope',
    '$rootScope',
    '$uibModal',
    '$compile',
    'uiCalendarConfig',
    '$http',
    'appSettings',
    '$routeParams',
    '$timeout',

    function ($scope, $rootScope, $uibModal, $compile, uiCalendarConfig,$http ,appSettings,$routeParams, $timeout) {

      $rootScope.activeClassItem = 7;
      $rootScope.userData = {
        'role': $rootScope.user.data.role,
        "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
        'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
        'background': $rootScope.user.data.role + '-background',
        'color': $rootScope.user.data.role + '-color',
        'border': $rootScope.user.data.role + '-border',
        'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
      };

      $(document).ready(function () {
        $(document).on('mouseenter', '.controll-button', function () {
          $(this).find(".inside-menu").show();
        }).on('mouseleave', '.controll-button', function () {
          $(this).find(".inside-menu").hide();
        });
      });


      $scope.activeCalendarView = 'month';
      var role = $rootScope.user.data.role;

      //////////// CREATE NEW EVENT///////////////
      var $ctrl = this;

      $scope.requestDateFormat = 'YYYY/MM/DD';

      $ctrl.animationsEnabled = true;

      $ctrl.openModal = function (size, parentSelector) {
        $scope.clear();
        if(!$scope.editing) {
          $scope.event = undefined;
        }
        $scope.editing = false;
        var parentElem = parentSelector ?
          angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
          animation: $ctrl.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/events/eventsModal/eventsModal.html',
          controller: 'eventModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.event;
            }
          }
        });

      };

      $scope.data = {
        'items': [],
        'onGlobalButtonClick':  $ctrl.openModal
      };

      $rootScope.$broadcast('should-be-reloaded');

      ///////// HIDE CUSTOM BUTTON FUNCTION /////////////
      $scope.hideCustomButton = true;
      $rootScope.$on('class-data-was-received', function () {
        if(!$rootScope.user.classData.classInArchived){
          $scope.hideCustomButton = false;
        }
        if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
          $scope.hideCustomButton = true;
        }
      });


/////////////////////////GET LIST OF EVENTS//////////////////////////////////////
      var clickedDays = [];
    $scope.alertOnDayClick = function (date, jsEvent, view) {
      if(view.type === 'month'){
        $scope.eventsListByDateIsActive = true;
        $scope.eventListDay = moment(date).format($scope.requestDateFormat);
        $scope.eventsList = [];

        for(var i = 0; i < $scope.eventsListOriginal.length; i++){
          if(moment($scope.eventsListOriginal[i].due_date).format($scope.requestDateFormat) === $scope.eventListDay) {$scope.eventsList.push($scope.eventsListOriginal[i])}
        }

        for(var i = 0; i < clickedDays.length; i++){
          $(clickedDays[i]).css('background-color', '#FFFFFF');
          $(clickedDays[i]).css('opacity', '1');
        }

        if($rootScope.user.data.role == 'student') { $(this).css('background-color', "#357C69");}
        else if($rootScope.user.data.role == 'teacher') { $(this).css('background-color', "#4785D6");}
        else if($rootScope.user.data.role == 'parent') { $(this).css('background-color', "#A8434E");}
        $(this).css('opacity', '0.8');
        clickedDays.push(this);
        if(clickedDays.length > 2) clickedDays.shift();
      }
    };

    $scope.clear = function () {
      $scope.eventsListByDateIsActive = false;
      $scope.eventsList = $scope.eventsListOriginal;
      for(var i = 0; i < clickedDays.length; i++){
        $(clickedDays[i]).css('background-color', '#FFFFFF');
        $(clickedDays[i]).css('opacity', '1');
      }
    };

    // /* ===== Change View ===== */
    $scope.changeView = function(view,calendar) {
      $scope.activeCalendarView = view;
      if(!uiCalendarConfig.calendars.myCalendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
      } else {
        uiCalendarConfig.calendars.myCalendar.fullCalendar('changeView',view);
      }
    };

      $scope.parseEventsData = function (data) {

       data.map(function (obj) {
          obj.owner = false;
          obj.future = true;
          if(new Date(obj.due_date) < new Date()) {
            obj.future = false;
          }
          if(obj.owner_id === $rootScope.user.data.id) {
            obj.owner = true;
          }
        });

        var events = [];
        $scope.eventsListOriginal = data;
        $scope.eventsList = data;

        for(var i = 0; i < $scope.eventsList.length; i++ ){

          if((($scope.eventsList[i].color.length)>7)) {
            $scope.eventsList[i].color =  '#'+$scope.eventsList[i].color.slice(3);
          }

          $scope.eventsList[i].startEventDate = moment($scope.eventsList[i].due_date + " " + $scope.eventsList[i].time_start_24,"YYYY/MM/DD HH:mm:ss").toDate();
          $scope.eventsList[i].endEventDate = moment($scope.eventsList[i].due_date + " "+$scope.eventsList[i].time_end_24,"YYYY/MM/DD HH:mm:ss").toDate();

          events.push({
            start: $scope.eventsList[i].startEventDate,
            end: $scope.eventsList[i].endEventDate,
            allDay: false,
            title : $scope.eventsList[i].title,
            id: $scope.eventsList[i].id,
            color : $scope.eventsList[i].color,
            date: $scope.eventsList[i].due_date
          });
        }

        $scope.eventsList.map(function (obj) {
          obj.date_number = moment(obj.due_date, $scope.requestDateFormat).format("DD");
          obj.date_month = moment(obj.due_date, $scope.requestDateFormat).format("MMM");
        });

        if($scope.activeCalendarView === 'month') {
          events = _.uniq(events, function (obj) {
            return obj.date;
          });
        }
        $scope.requestInProgress = false;
        $scope.events = events;
        $scope.eventSources[0] = $scope.events;

      };

      $scope.viewChanged = function (view, element) {
        $scope.eventsListByDateIsActive = false;
        $scope.currentView = view;
        $scope.eventSources[0] = [];

        $scope.requestInProgress = true;

        var start = moment(view.start).format($scope.requestDateFormat);
        var end = moment(view.end).format($scope.requestDateFormat);

        if($scope.activeCalendarView === 'month'){
          var fromMonth = moment(start).format('MM');
          var fromDay = moment(start).format('DD');
          var toMonth = moment(end).format('MM');
          if (fromDay != 1 && (+toMonth - +fromMonth) != 1) {
            var startDate = moment(moment(start).format('YYYY') + "/" + (+fromMonth + 1) + "/01").format($scope.requestDateFormat);
            var endDate = moment(startDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          } else {
            startDate = moment(start).format($scope.requestDateFormat);
            endDate = moment(startDate, $scope.requestDateFormat).add(1, 'month').add(-1, 'day').format($scope.requestDateFormat);
          }
        } else if($scope.activeCalendarView === 'agendaWeek'){
          startDate = moment(view.start).format($scope.requestDateFormat);
          endDate = moment(startDate).add(1, 'week').format($scope.requestDateFormat)
        }
        $http.get( appSettings.link + 'event?class_id='+ $routeParams.classId +'&start_date='+ startDate + '&end_date=' + endDate)
          .success(function (response) {
            $scope.parseEventsData(response.data);
          });
      };

      $scope.markImportantItem = function (status, id, index,user) {
        if(user!==$rootScope.user.data.id){
          return
        }
        $http({
          url: appSettings.link + 'event/'+ id + '/mark',
          method: "POST",
          data:{
            'status':status,
            'id':id
          }
        })
          .then(function (response) {
              $scope.eventsList[$scope.eventsList.length-1-index].important=status;
            },
            function (response) {

            });
      };

      $scope.openAreUSureModal = function (size) {
        var modalInstance = $uibModal.open({
          animation: $ctrl.animationsEnabled,
          templateUrl: 'components/class/dashboard/events/areUSureModal/areUSureModal.html',
          controller: 'areUSureModalEventsCtrl',
          controllerAs: '$ctrl',
          size: size,
          resolve: {
            items: function () {
              return $scope.eventToDelete;
            }
          }
        });
      };

      $rootScope.$on('createEvent', function (e, data) {
        $scope.viewChanged($scope.currentView);
      });

      $rootScope.$on('delete-was-approved', function (e, data) {
        $http({
          method: 'delete',
          url: appSettings.link + '/event/' + data.id,
          headers: {'Content-Type': 'application/json'}
        })
          .success(function (response) {

            $scope.clear();
            $scope.viewChanged($scope.currentView);
          })

          .error(function () {

          });
      });

      $scope.editEvent = function (event) {
        $scope.editing = true;
        $scope.event = event;
        $ctrl.openModal();
      };

      $scope.deleteEvent = function (event) {
        $scope.eventToDelete = event;
        $scope.openAreUSureModal('sm');
      };

      $scope.eventRender = function( event, element, view){
        element.attr({'uib-tooltip-html': "\'<p>" + event.title + "</p>\'", 'tooltip-append-to-body': true}); $compile(element)($scope);
      };

    //==============================================================================
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
          dayClick : $scope.alertOnDayClick,
          eventDrop: $scope.alertOnDrop,
          eventResize: $scope.alertOnResize,
          eventRender: $scope.eventRender,
          viewRender: $scope.viewChanged
        }
      };
      $scope.events = [];
      $scope.eventSources = [$scope.events];

      $scope.choseOption = function (context) {
        for(var i = 0; i < $scope.contextMenu.items.length; i++){
          $scope.contextMenu.items[i].itemPicked = 3;
        }
        $scope.contextMenu.items[context].itemPicked = 2;

        if(context == 0){
          $scope.changeView('month', 'cdCalendar');
          $scope.activeCalendarView = 'month';
        }
        else if(context == 1){
          $scope.changeView('agendaWeek', 'cdCalendar');
          $scope.activeCalendarView = 'agendaWeek';
        }
      };

      $scope.contextMenu = {
        'items': [
          {
            'img': 'images/distinguished/icon-semester-' + role + '_3x.png',
            'imgHover': 'images/distinguished/icon-semester-hover_3x.png',
            'text': 'Month',
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
            'text': 'Week',
            'distinguished' : true,
            'state' : true,
            'active' : true,
            'click': $scope.choseOption,
            'itemPicked': 3,
            'context' : 1
          }
        ]
      };
  }]);
