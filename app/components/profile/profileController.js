app.controller('ProfileController', ['$scope',
  '$rootScope',
  '$http',
  '$resource',
  '$location',
  '$uibModal',
  'AuthenticationService',
  'ClassFactory',
  'appSettings',
  'classData',
  '$timeout',
  'DeletedClasses',
  'CurrentClasses',
  '$q',
  '_',
  'Upload',
  'Feed',
  'uiCalendarConfig',
  '$compile',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed,uiCalendarConfig, $compile) {
    var $ctrl = this;
    $scope.eventSources=[];
    $scope.showProfile = true;
    $ctrl.animationsEnabled = true;
    var role =$rootScope.user.data.role;
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border'
    };

    $scope.userProfile = $rootScope.user.data;

    $scope.showUpcoming=true;

    $scope.seeRequestToFollow = function(){
      $scope.showProfile = false;
    };

    $scope.seeProfile = function(){
      $scope.showProfile = true;
    };

    $scope.feedUrl = appSettings.link+'story/'+$rootScope.user.data.id;
    $(document).ready(function () {
      $('.fc-toolbar').hide();
      //$('.fc-day-header').addClass('profileCalendarDayHeader');
      //$('.fc-widget-content').addClass('profileCalendarDayHeader');
      $('.fc-scroller').attr('id','profileCalendar');
      $(document).on('mouseenter', '.controll-button', function () {
        $(this).find(".inside-menu").show();
      }).on('mouseleave', '.controll-button', function () {
        $(this).find(".inside-menu").hide();
      });
    });

    if($rootScope.userData.role === 'teacher') $scope.colorB = '#4b93eb';
    if($rootScope.userData.role === 'parent')  $scope.colorB = '#cf515d';
    if($rootScope.userData.role === 'student')  $scope.colorB = '#3d8e78';

    // console.log($('.fc-row .fc-widget-header > table > thead > tr > .fc-axis').innerHTML);
    // console.log($('.fc-row .fc-widget-header > table > thead > tr > .fc-axis').innerText);
    // console.log($('.fc-row .fc-widget-header > table > thead > tr > .fc-axis')[0].innerHTML);
    // console.log($('.fc-row .fc-widget-header > table > thead > tr > .fc-axis').eq(0).innerHTML);



////////// SWITCH BETWEEN TABS /////////////////////////
    $scope.switchUpcoming = function () {
      $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
      $('.profile-subheader-item').css('color', '#797a7b');
      $('#Upcoming').css('border-bottom', '3px solid ' + $scope.colorB);
      $('#Upcoming').css('color', '#333c48');
      $scope.showUpcoming=true;
      $scope.showSchedule = false;
      $scope.showActivities=false;
    };

    $scope.switchSchedule = function () {
      $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
      $('.profile-subheader-item').css('color', '#797a7b');
      $('#Schedule').css('border-bottom', '3px solid ' + $scope.colorB);
      $('#Schedule').css('color', '#333c48');
      $scope.showUpcoming=false;
      //$scope.showSchedule = true;
      $scope.showActivities=false;
      getSchedule();
      $scope.showSchedule=true;
    };

      $scope.switchActivities = function () {
        $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
        $('.profile-subheader-item').css('color', '#797a7b');
        $('#Activities').css('border-bottom', '3px solid ' + $scope.colorB);
        $('#Activities').css('color', '#333c48');
        $scope.showUpcoming=false;
        $scope.showSchedule = false;
        $scope.showActivities=true;
      };
      $rootScope.$on("switchActivities", function(){
          $scope.switchActivities();
      });

    $scope.switchUpcoming();
    //////////////////////////////////////

/////////////// ACTIONS WITH EVENT-ITEMS////////////////////////
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

    $scope.deleteEvent = function (event,index) {
      $scope.eventToDelete = event;
      $scope.openAreUSureModal('sm');

      $rootScope.$on('delete-was-approved', function (e, data) {
        $http({
          method: 'delete',
          url: appSettings.link + '/event/' + data.id,
          headers: {'Content-Type': 'application/json'}
        })
          .success(function (response) {

            $scope.listOfUpcomingEvents.splice(index,1);

          })
          .error(function () {

          });
      });

    };

    $scope.editEvent = function(event,index){

      event.class_id= event.class.id;
        var modalInstance = $uibModal.open({
          animation: $ctrl.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/events/eventsModal/eventsModal.html',
          controller: 'eventModalInstanceCtrl',
          controllerAs: '$ctrl',
          resolve: {
            items: function () {
              return event;
            }
          }
        });
      $rootScope.$on('createEvent', function (e, data) {
        $scope.listOfUpcomingEvents[index]=data;
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
            $scope.listOfUpcomingEvents[index].important=status;
          },
          function (response) {

          });
    };

    $scope.functionGetEventTime = function (data) {
      return moment(data).format('DD')
    };
    $scope.functionGetEventTimeMonth = function (data) {
      return moment(data).format('MMM')
    };

     $scope.userInformation = $rootScope.user.data;

    ///////////////////////////////////


   /////////// UPDATE USER PROFILE/////////////////

    $rootScope.$on('updateUserProfile', function (event,data) {
     $scope.updateUserProfile = $rootScope.user.data;
    });

     ////////////////////////////////////////

    ////////////EDIT PROFILE/////////////////////

    $scope.editProfile= function (size, parentSelector) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/profile/editProfileModal/editProfileModal.html',
        controller: 'editProfileModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: size,
        //appendTo: parentElem,
        resolve: {
          items: function () {
            return $rootScope.user.data.details.data;
          }
        }
      });
    };
    ////////////////////////////////////


    //////////// GET LIST OF FOLLOWERS(PRIVATE ACCOUNT)//////////////

    getFollowersData();
    function getFollowersData() {
      $http({
        url: appSettings.link + 'follow/potential-followers',
        method: "GET",
        headers: {'Content-Type': 'application/json'}
      })
        .then(function (response) {
          $scope.requestedUsers = response.data.data;
          },
          function (response) {
          });
    }

     //////////////////////////////


    /////////////ACCEPT/REJECT FOLLOWER////////////////

    $scope.approveReject = function (user, status) {
      var index = $scope.requestedUsers.indexOf(user);
      $scope.requestedUsers.splice(index, 1);

      $http.post(appSettings.link + 'follow/approve/'+user.user.id,
        {'status' : status, 'user_id' : user.user.id})
        .success(function (response) {

        })
        .error(function (data) {
          //console.log("Code: " + data.status_code + "; Message: " + data.message);
        });

      $scope.showProfile= false;

    };

    /////////////////////////////////////////////////

    ////////////// GET UPCOMING LIST/////////////////////
    $scope.requestUpcomingInProgress=true;
    $scope.showUpcoming=false;
    getUpcoming();
    $scope.showUpcoming=true;
    function getUpcoming() {
      var startUpcomingDate = moment().format("YYYY-MM-DD");
      var endUpcomingDate = moment(startUpcomingDate).add(1, 'month').format("YYYY-MM-DD");
      $http({
        url: appSettings.link + 'event/upcoming?start_date='+ startUpcomingDate + '&end_date=' + endUpcomingDate,
        method: "GET"
        // headers: {'Content-Type': 'application/json'}
      })
        .then(function (response) {
            $scope.requestUpcomingInProgress = false;
            $scope.listOfUpcomingEvents = [];
            for(var i = 0; i < response.data.data.length; i++ ){
              if(response.data.data[i].parent_type !=='lesson') {
                $scope.listOfUpcomingEvents.push(response.data.data[i])
              }
            }

          },
          function (response) {

          });
    }
    ////////////////////////////////////////////////////////

    $scope.parseEventsData = function (data) {

      // data.map(function (obj) {
      //   obj.owner = false;
      //   obj.future = true;
      //   if(new Date(obj.due_date) < new Date()) {
      //     console.log(obj.title);
      //     obj.future = false;
      //   }
      //   if(obj.owner_id === $rootScope.user.data.id) {
      //     obj.owner = true;
      //   }
      // });

      var events = [];
      $scope.eventsListOriginal = data;
      $scope.eventsList = data;

      for(var i = 0; i < $scope.eventsList.length; i++ ){

        if((($scope.eventsList[i].color.length)>7)) {
          $scope.eventsList[i].color =  '#'+$scope.eventsList[i].color.slice(3);
        }
        $scope.eventsList[i].startEventDate = moment($scope.eventsList[i].due_date + " " + $scope.eventsList[i].time_start_24,"yyyy-MM-DD HH:mm:ss").toDate();
        $scope.eventsList[i].endEventDate = moment($scope.eventsList[i].due_date + " "+$scope.eventsList[i].time_end_24,"yyyy-MM-DD HH:mm:ss").toDate();
        events.push({
          // start: new Date($scope.eventsList[i].due_date + " " +$scope.eventsList[i].time_start_24),
          // end: new Date($scope.eventsList[i].due_date + " " +$scope.eventsList[i].time_end_24),
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
        obj.date_number = moment(obj.due_date, "YYYY-MM-DD").format("DD");
        obj.date_month = moment(obj.due_date, "YYYY-MM-DD").format("MMM");
      });

      // if($scope.activeCalendarView === 'month') {
      //   events = _.uniq(events, function (obj) {
      //     return obj.date;
      //   });
      // }

      $scope.events = events;
      $scope.eventSources[0] = $scope.events;
      // uiCalendarConfig.calendars['cdCalendar'].fullCalendar('render');
      uiCalendarConfig.calendars['cdCalendar'].fullCalendar('changeView','agendaWeek');
      $scope.requestInProgress = false;

    };

    ///////////////////////
    function getSchedule() {
      if($scope.listOfScheduleEvents){
        return
      }
      $scope.requestInProgress = true;
      var startScheduleDate = moment().format("YYYY-MM-DD");
      var endScheduleDate = moment(startScheduleDate).add(1, 'week').format("YYYY-MM-DD");
      startScheduleDate = moment(startScheduleDate).subtract(1, 'week').format("YYYY-MM-DD");
      $http({
        url: appSettings.link + 'event/upcoming?start_date='+ startScheduleDate + '&end_date=' + endScheduleDate,
        method: "GET"
      })
        .then(function (response) {
            $scope.requestInProgress = false;
            $scope.listOfUpcomingEvents1 = [];
            for(var i = 0; i < response.data.data.length; i++ ){
              if(response.data.data[i].parent_type ==='lesson') {
                $scope.listOfUpcomingEvents1.push(response.data.data[i])
              }
            }

           $scope.listOfScheduleEvents=$scope.listOfUpcomingEvents1;
            $scope.parseEventsData($scope.listOfScheduleEvents);
            $('.fc-scroller').attr('id','profileCalendar');
            $('.fc-day-header').addClass('profileCalendarDayHeader');
            $('.fc-widget-content').addClass('profileCalendarDayHeader');
            $('.fc-toolbar').hide();

          },
          function (response) {

          });
    }
    ///////////////////////////////
    $scope.eventRender = function( event, element, view){
      element.attr({'uib-tooltip-html': "\'<p>" + event.title + "</p>\'", 'tooltip-append-to-body': true});
      $compile(element)($scope);
    };

    $scope.uiConfig = {
      calendar: {
        minTime: '07:00',
        maxTime:'24:00',
        firstDay:0,
        height: 'auto',
        titleFormat:'MMM',
        editable: false,
        header: {
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        eventClick: $scope.alertOnEventClick,
        dayClick : $scope.alertOnDayClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender,
        viewRender: $scope.viewChanged,
        timeFormat:'HH:mm'
      }
    };
    $scope.events = [];
    $scope.eventSources = [$scope.events];

  }]);

