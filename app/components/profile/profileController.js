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
  'socket',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed,uiCalendarConfig, $compile, socket) {


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
    $rootScope.activeUser;
      $rootScope.showActivities;
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

////////// SWITCH BETWEEN TABS /////////////////////////
    $scope.switchUpcoming = function () {
      $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
      $('.profile-subheader-item').css('color', '#797a7b');
      $('#Upcoming').css('border-bottom', '3px solid ' + $scope.colorB);
      $('#Upcoming').css('color', '#333c48');
      $scope.showUpcoming=true;
      $scope.showSchedule = false;
        $rootScope.showActivities=false;
      $scope.showUser=false;

    };

    $scope.switchSchedule = function () {
      $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
      $('.profile-subheader-item').css('color', '#797a7b');
      $('#Schedule').css('border-bottom', '3px solid ' + $scope.colorB);
      $('#Schedule').css('color', '#333c48');
      $scope.showUpcoming=false;
      //$scope.showSchedule = true;
        $rootScope.showActivities=false;
      getSchedule();
      $scope.showSchedule=true;
      $scope.showUser=false;
    };

      $scope.switchActivities = function () {
        $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
        $('.profile-subheader-item').css('color', '#797a7b');
        $('#Activities').css('border-bottom', '3px solid ' + $scope.colorB);
        $('#Activities').css('color', '#333c48');
        $scope.showUpcoming=false;
        $scope.showSchedule = false;
          $rootScope.showActivities=true;
        $scope.showUser=false;
      };
      $rootScope.$on("switchActivities", function(){
          $scope.switchActivities();
      });


      $rootScope.showUser = false;

      $scope.switchUser = function () {
          $('.profile-subheader-item').css('border-bottom', '3px solid #fff');
          $('.profile-subheader-item').css('color', '#797a7b');
          $scope.showUpcoming=false;
          $scope.showSchedule = false;
          $rootScope.showActivities=false;
          $scope.showUser = true;
      };
      $rootScope.$on("switchUser", function(){
          $scope.switchUser();
      });
    $scope.switchUpcoming();

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

   /////////// UPDATE USER PROFILE/////////////////

    $rootScope.$on('updateUserProfile', function (event, data) {
     $scope.updateUserProfile = $rootScope.user.data;
    });

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
    ////////////////////////////////////////
      $scope.getFinishTime = function(timeEnd){
          var timeDuration = 0;
          var a = moment(new Date());//now
          var b  = moment.utc(timeEnd).toDate();
          if(a.diff(b, 'weeks')>0){
              timeDuration = a.diff(b, 'weeks') + ' w. ';
          }
          else if(a.diff(b, 'days')>0){
              timeDuration = a.diff(b, 'days')+ ' d. '+(a.diff(b, 'hours'))%24+ ' h. ';

          }
          else if(a.diff(b, 'hours')>0){
              timeDuration=a.diff(b, 'hours')+ ' h. '+(a.diff(b, 'minutes'))%60+' min. ';
          }
          else if(a.diff(b, 'minutes')>0){
              timeDuration = a.diff(b, 'minutes')+' min. '
          }
          return timeDuration
      };

      $scope.activitiesAnnouncementsArr = [];
      $scope.activitiesPostArr = [];
      $scope.followsArr=[];
      $scope.followersArr=[];
      $scope.user = $rootScope.user.data.details.data;
      $scope.userId = $rootScope.user.data.id;
      $rootScope.activities = [];

      $scope.fillActivitiesAnnouncement = function() {
          $http({
              url: appSettings.link + 'user/announcements/' + $rootScope.user.data.id,
              method: "GET"
          })
              .then(function (response) {
                      $scope.announcementArr = response.data.announcements;
                      //console.log($rootScope.user.data);
                      for (var i = 0; i < $scope.announcementArr.length; i++) {
                          $scope.announcementArr[i].type = 'announcement';
                          $scope.activitiesAnnouncementsArr.push($scope.announcementArr[i]);
                          $rootScope.activities.push($scope.announcementArr[i]);
                      }
                      //console.log('activitiesAnnouncementsArr');
                      //console.log($scope.activitiesAnnouncementsArr);
                  },
                  function (response) {

                  });
      };

      $scope.fillActivitiesStory = function() {
          $http({
              url: appSettings.link + 'story/' +  $rootScope.user.data.id,
              method: "GET"
          })
              .then(function (response) {
                      $scope.storytArr = response.data.data;
                      $scope.feeds = new Feed();
                      $rootScope.$emit('addNewPost',response.data.data );
                      $scope.feeds.items.unshift(response.data.data);
                      for(var i=0; i< $scope.storytArr.length; i++){
                          $scope.storytArr[i].type = 'story';
                          $scope.activitiesPostArr.push($scope.storytArr[i]);
                          $rootScope.activities.push($scope.storytArr[i]);
                      }
                      /*console.log('activitiesPostArr');
                      console.log($scope.activitiesPostArr);*/
                  },
                  function (response) {

                  });
      };

      $scope.fillActivitiesFollows = function() {
          $http({
              url: appSettings.link + 'users/follows/' + $rootScope.user.data.id,
              method: "GET"
              // headers: {'Content-Type': 'application/json'}
          })
              .then(function (response) {
                      $scope.listUsers = response.data.follows;
                      for(var i=0; i<$scope.listUsers.length; i++){
                          $scope.listUsers[i].type = 'follows';
                          $scope.followsArr.push($scope.listUsers[i]);
                          $rootScope.activities.push($scope.listUsers[i]);
                      }
                      // console.log('followsArr');
                      // console.log($scope.followsArr);
                  },
                  function (response) {
                  });
      };

      $scope.fillActivitiesFollowers = function() {
          $http({
              url: appSettings.link + 'users/followers/' + $rootScope.user.data.id,
              method: "GET"
              // headers: {'Content-Type': 'application/json'}
          })
              .then(function (response) {
                      $scope.listUsersFoolowers = response.data.followers;

                      for (var i = 0; i <  $scope.listUsersFoolowers.length; i++) {
                          $scope.listUsersFoolowers[i].type ='followers';
                          $scope.followersArr.push($scope.listUsersFoolowers[i]);
                          $rootScope.activities.push($scope.listUsersFoolowers[i]);
                      }
                      // console.log('followersArr');
                      // console.log($scope.followersArr);
                  },
                  function (response) {
                  });
      };

      $scope.fillActivities = function (arr) {
          setTimeout(function () {
              for(var i=0; i<arr.length; i++){
                  if (arr[i].type !== 'announcement') {
                      if(!arr[i].hasOwnProperty('updated_at')) {
                          arr[i].updated_at = arr[i].created_at;
                          arr[i].updated_at = arr[i].updated_at.date;
                      } else {
                          arr[i].updated_at =  arr[i].updated_at.date;
                      }
                  }
              }

              arr.sort(function(a, b) {
                  var x = new Date(a.updated_at);
                  var y = new Date(b.updated_at);
                  return y.getTime() - x.getTime();
              });

              $rootScope.$emit('activities', arr);

              socket.io.emit('begin', arr);

          }, 2000);
      };

      $scope.fillActivitiesAnnouncement();
      $scope.fillActivitiesStory();
      $scope.fillActivitiesFollows();
      $scope.fillActivitiesFollowers();
      $scope.fillActivities($rootScope.activities);

      socket.io.on('act', function (data) {
          //console.log(data);
      });

      //---------------------- GET CLASS ID ----------------------------//
      $http({
          url: appSettings.link + 'user/classes',
          method: "GET"
          // headers: {'Content-Type': 'application/json'}
      })
          .then(function (response) {
                  var data = response.data.data;
                  $scope.classId = data[0].id;
              },
              function (response) {
              });
      //----------------------------------------------------------------//

      $scope.show = function (user) {
          $scope.chldmeth = function(user) {
              user.id = user.user_id;
              $rootScope.$emit("activateUser");
          };

          $rootScope.activeUserId = user.user_id;
          $rootScope.activeUser = user;
          $rootScope.feedUrl = appSettings.link+'story/'+ user.user_id;
          $scope.chldmeth(user);
      };

  }]);


