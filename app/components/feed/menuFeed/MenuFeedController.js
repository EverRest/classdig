/**
 * Created by ros on 18.10.16.
 */
var app = angular.module("classDigApp");

app.controller("MenuFeedController",
  ['$scope',
    '$http',
    '$routeParams',
    '$rootScope',
    'classData',
    '$timeout',
    'CurrentClasses',
    'appSettings',function ($scope, $http, $routeParams, $rootScope, classData, $timeout,CurrentClasses, appSettings) {

    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
    };

    $scope.menuFeedHeight = ($('#menuClass').outerHeight()-2*$('.subject-menu-link').outerHeight() - 288)+'px';

     $scope.activeItem = $rootScope.activeFeedItem;

    var studentId = $routeParams.studentId;
    var role='';
    var roleActive = '-' + $rootScope.user.data.role;
    $scope.showListOfClasses = false;

    $scope.showListOfComunity = false;

    $scope.classesList = new CurrentClasses();

    $(document).ready(function () {

      $http({
        url: appSettings.link +'class?user_id='+$rootScope.user.data.id+ '&status=1' +"&page=",
        method: "GET"
      })
        .then(function (response) {
            //$scope.listOfFeeds = response.data.data;
            // $('#user-loader').hide();
            if (response.data.data.length !== 0) {
              //$scope.examExist = true;
              $scope.functionShowListOfClassses();
              $scope.functionShowListOfCommunity();
              $scope.displayClassFeedFunction(response.data.data[0]);
            }
            else {
              //$scope.examNotExist = true;
            }
          },
          function (response) {

          });

    });



    $scope.functionShowListOfClassses = function () {

      if($scope.showListOfClasses){
        this.ClassStory.arrow = "images/icon-arrow.svg"
      }
      else{
        this.ClassStory.arrow = "images/icon-arrow-down.svg"
      }
      $scope.showListOfClasses = !$scope.showListOfClasses;
    };

    $scope.functionShowListOfCommunity = function () {

      if($scope.showListOfComunity){
        this.CommunityStory.arrow = "images/icon-arrow.svg"
      }
      else{
        this.CommunityStory.arrow = "images/icon-arrow-down.svg"
      }
      $scope.showListOfComunity = !$scope.showListOfComunity;
    };

    $scope.displayClassFeedFunction = function (data) {
      $('.feedData').removeClass($rootScope.userData.color);
      $('#'+data.id).addClass($rootScope.userData.color);
      $rootScope.$broadcast('classFeed',data.id);

    };

    $scope.catClassName = function (name) {
      var cut_name;
        if(name. length > 12) {
          cut_name = name.substring(0, 13) + "...";
        } else {
          cut_name = name;
        }
        return cut_name;
    };


    $scope.displayCommunityFeedFunction = function (data) {
      $('.feedData').removeClass($rootScope.userData.color);
      $('#'+data.id).addClass($rootScope.userData.color);
      $rootScope.$broadcast('communityFeed',data.id);
      //console.log(data)
    };


    $scope.ClassStory = {
              "Id": 1,
              "icon": "images/menu_class/students/icon-students",
              "role": role,
              "exte": "_3x.png",
              "title": "Class Story",
              "arrow":"images/icon-arrow.svg"
              // "href": "#/feed/ClassStory"
            };

    $scope.CommunityStory = {
        "Id": 2,
        "icon": "images/menu_class/attendance/icon-attendance",
        "role": role,
        "exte": "_3x.png",
        "title": "Community Story",
        "arrow":"images/icon-arrow.svg"
        // "href": "#/feed/classStory/CommunityStory"
      };




    $scope.communityList = [
      {
      "id": 3,
      "title": "News"
    },
      {
        "id": 4,
        "title": "Buy & sell"
      },
      {
        "id": 5,
        "title": "Lost & found"
      },
      {
        "id": 6,
        "title": "Books exchange"
      },
      {
        "id": 7,
        "title": "Other"
      }
      ];

    $scope.classesList.nextPage();
    $scope.ListOfClasses =  $scope.classesList.items;

  }]);

