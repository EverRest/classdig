app.controller('FeedController', ['$scope',
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
  'socket',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed, socket) {

    var $ctrl = this;
    var role =$rootScope.user.data.role ;
    //$scope.picFile={};
    $scope.newFeed = {};

    $scope.parseFileType = function (file) {
      var arayOfImage = ['jpeg', 'svg', 'jpg', 'png'];
      var arayOfVideo = ['mp4','avi', '3gp'];
      var arayOfFiles = ['xls', 'doc', 'pdf', 'xml', 'ppt', 'txt', 'xsv'];

      var extention = file.split('.');
      extention = extention[extention.length-1];
      for(var i=0; i<arayOfImage.length; i++){
        if(extention ===arayOfImage[i]){
          $scope.newFeed.type_file=1;
          return
        }
      }

      for(var j=0; j<arayOfVideo.length; j++){
        if(extention ===arayOfVideo[j]){
          $scope.newFeed.type_file=2;
          return
        }
      }
      $scope.newFeed.type_file=3;
    };

    $scope.userAva = $rootScope.user.data.details.data.photo;
    $scope.userId = $rootScope.user.data.id;

    $rootScope.userData = {
      "iconAddLink": 'images/modal/icon-clip-' + $rootScope.user.data.role + '.svg',
      'iconAddPhoto': 'images/modal/icon-camera-' + $rootScope.user.data.role + '.svg',
      'placeholder': $rootScope.user.data.role+'-placeholder'
    };

    $scope.addPhotoText= 'Add photo';
    $scope.placeholder=$rootScope.user.data.role+'-placeholder';
    $ctrl.animationsEnabled = true;
    $scope.iconAddLink =  'images/modal/icon-clip-' + $rootScope.user.data.role + '.svg';



    $scope.$watch('newFeed.picFile', function (val) {
      if($scope.newFeed.picFile.$ngfName){
        $scope.newFeed.link=undefined;
        $scope.parseFileType($scope.newFeed.picFile.$ngfName);
        $scope.addPhotoText = ($scope.newFeed.picFile.$ngfName);
      }
      else
      if($scope.newFeed.picFile.name){
        $scope.newFeed.link=undefined;
        $scope.parseFileType($scope.newFeed.picFile.name);
        $scope.addPhotoText = ($scope.newFeed.picFile.name);
      }
    },true);

    $scope.$watch('newFeed.link', function (val) {
      if($scope.newFeed.link!==undefined){

        delete $scope.newFeed.file_id;
        delete $scope.newFeed.type_file;
        delete $scope.newFeed.picFile;
        $scope.addPhotoText= 'Attach photo';
      }
    });


////////// FUNCTION UPLOAD PICTURE TO SERVER //////////////////
    $scope.uploadPic = function (file,url) {
      file.upload = Upload.upload({
        url: appSettings.link + 'upload',
        data: {file: file}
      });

      file.upload.then(function (response) {
        file.result = response.data;
        $scope.newFeed.file_id = response.data.data.id;
        console.log('post feed from img');
        $http({
          url: appSettings.link + url,
          method: "POST",
          data: $scope.newFeed
        })
          .then(function (response) {
              $scope.listOfFeeds.unshift(response.data.data);
              $scope.feeds.items.unshift(response.data.data);
              $rootScope.$emit('addNewPost',response.data.data );
              $scope.newFeed = {};
              $scope.addPhotoText= 'Attach file';
            },
            function (response) {

            });

      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      });
    };

      $scope.a = function(){
          console.log($rootScope.activitiesContainer);
      };

    $scope.postFeedFunction = function () {
      if(!$scope.newFeed.content && !$scope.newFeed.link && !$scope.newFeed.picFile){
        return false
      }
      else if($scope.newFeed.picFile){
        if($scope.feedType==='class'){
          $scope.url= 'class-story';
          if($scope.newFeed.picFile){
            $scope.uploadPic($scope.newFeed.picFile,$scope.url);
          }
        }
        else{
          $scope.url= 'story';
          if($scope.newFeed.picFile){
            $scope.uploadPic($scope.newFeed.picFile,$scope.url);
          }
        }
      }
      else{
        if($scope.feedType==='class'){
          $scope.url= 'class-story';
        }
        else{
          $scope.url= 'story';
        }
        $http({
          url: appSettings.link + $scope.url,
          method: "POST",
          data: $scope.newFeed
        })
          .then(function (response) {
              $http({
                  url: appSettings.link + 'newactivity',
                  method: "POST",
                  data: {'user_id': $scope.user.user_id, 'type': 'story', 'data': $scope.newFeed}
              }).then(function (data) {
                  console.log(data);
              });

              socket.io.emit('newActivity', $scope.newFeed);

              console.log('newActivity-new Post');

              // socket.io.on('activities', function (data) {
              //     console.log(data);
              // });

              $scope.listOfFeeds.unshift(response.data.data);
              $rootScope.$emit('addNewPost',response.data.data );
              $scope.feeds.items.unshift(response.data.data);
              $scope.newFeed = {};
                 /* $scope.chldmeth = function() {
                      $rootScope.$emit("activitiesContainer", data);
                  };*/
                  //$scope.chldmeth('from feed');
            },
            function (response) {

            });
      }
    };

    $scope.listOfFeeds=[];

    function getListOfFeed(url) {
      $http({

        url: appSettings.link +'story?search='+ url+'&page=1',
        method: "GET"
      })
        .then(function (response) {
            $scope.listOfFeeds = response.data.data;
            // $('#user-loader').hide();
            if (response.data.data.length !== 0) {
              $scope.examExist = true;
            }
            else {
              $scope.examNotExist = true;
            }
          },
          function (response) {

          });
    }

    $rootScope.$on('communityFeed', function (event,data) {
     // getListOfFeed('category:'+data);
      $scope.feedUrl= appSettings.link +'story?search='+'category:'+data;
      $scope.createNewFeed = true;
      $scope.feedType='community';
      $scope.newFeed={};
      $scope.newFeed.category = data;
      $scope.feeds = new Feed();
      $scope.feeds.nextPage($scope.feedUrl)
    });

    $rootScope.$on('classFeed', function (event,data) {
     // getListOfFeed('class_id:'+data);
      $scope.feedUrl =  appSettings.link +'story?search='+ 'class_id:'+data;
      $scope.createNewFeed = true;
      $scope.feedType='class';
      $scope.newFeed={};
      $scope.newFeed.class_id = data;
      $scope.feeds = new Feed();
      $scope.feeds.nextPage($scope.feedUrl)
    });

    //...............
  }]);

