angular.module('classDigApp')
  .directive('feedList', ['Feed','$uibModal',function (Feed,$uibModal) {
    return {
      scope: {
        feedUrl:"="
      },
      templateUrl: 'scripts/directives/feedList/feedListTemplate.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q','Feed','$uibModal',
        function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q,Feed,$uibModal) {

        $ctrl=this;
          $(document).ready(function () {
            $(document).on('mouseenter', '.controll-button', function () {
              $(this).find(".inside-menu").show();
            }).on('mouseleave', '.controll-button', function () {
              $(this).find(".inside-menu").hide();
            });
            $(document).on('mouseenter', '.comment-info', function () {
              $(this).find(".del-comment-button").show();
            }).on('mouseleave', '.comment-info', function () {
              $(this).find(".del-comment-button").hide();
            });
          });

          $rootScope.$on('addNewPost', function (event,data) {
            $scope.feeds.items.unshift(data);
            if(data.link){
              var matches1 = (data.link).match(/^http:\/\/(?:www\.)?youtube.com\/watch\?(?=.*v=\w+)(?:\S+)?$/);
              var matches2 = (data.link).match(/^https:\/\/(?:www\.)?youtube.com\/watch\?(?=.*v=\w+)(?:\S+)?$/);
              if (matches1 || matches2) {
                var baseUrl = (data.link).split('=');
                data.link = baseUrl[baseUrl.length -1];
                data.youtube = true;
              }
            }
          });

        $scope.userData = {};
        $scope.userId = $rootScope.user.data.id;
        $scope.userData.color = $rootScope.user.data.role+'-color';
          $scope.$watch('feedUrl',function () {
            $scope.feeds = new Feed();
            $scope.feeds.nextPage($scope.feedUrl);
          });


          $scope.openModalAddComment = function (items) {
            var modalInstance = $uibModal.open({
              animation: $ctrl.animationsEnabled,
              templateUrl: 'components/feed/addCommentModal/addCommentModal.html',
              controller: 'sendCommentController',
              controllerAs: '$ctrl',
              size:'sm',
              resolve: {
                items: function () {
                  return items;
                }
              }
            });

          };

          $scope.showFeedLinkFunction = function(link){
            var re = new RegExp("^(http|https)://", "i");
            var match = re.test(link);
            if(match){
              return(link)
            }
            else{
              return 'http://'+link
            }
          };
          //-------------- Delete Comment--------------------//

          $scope.openAreUSureModalComment = function (size,feed) {
            var modalInstance = $uibModal.open({
              animation: $ctrl.animationsEnabled,
              templateUrl: 'components/feed/areUSureModalComment/areUSureModal.html',
              controller: 'areUSureModalCommentCtrl',
              controllerAs: '$ctrl',
              size: size,
              resolve: {
                items: function () {
                  return feed;
                }
              }
            });
          };

          $scope.deleteFeedComment = function (comment, commentsList, commentsCount) {
            $scope.commentsList = commentsList;
            $scope.commentsCount = commentsCount;
            $scope.openAreUSureModalComment('sm',comment);

          };

          $rootScope.$on('delete-comment-was-approved', function (e, data) {

            $http({
              method: 'DELETE',
              url: appSettings.link + 'comment/' + data.id,
              headers: {'Content-Type': 'application/json'},
              data:{'id':data.id}
            })
              .success(function (response) {
                $scope.commentsCount--;
                $scope.deleteElementFromArray($scope.commentsList,data);


              })

              .error(function () {

              });
          });

          //-------------- End Delete Comment--------------------//

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

          $scope.showCommentsFunction = function () {
            $scope.showComment=true;
          };
          $scope.hideCommentsFunction = function () {
            $scope.showComment=false;
          };

          //-------------- Like feed --------------------//

          $scope.addLikeFunction = function (feed) {
            if(feed.is_liked){
              feed.likes--;
              $http({
                url: appSettings.link +'like/'+feed.id,
                method: "DELETE",
                data: {"id":feed.id}
              })
                .then(function (response) {
                    // console.log(response);
                  },
                  function (response) {
                    //console.log('fail')
                  });

            }
            else{
              feed.likes++;

              $http({
                url: appSettings.link +'like',
                method: "POST",
                data: {"story_id":feed.id}
              })
                .then(function (response) {
                    // console.log(response);
                  },
                  function (response) {
                    // console.log('fail')
                  });
            }
            feed.is_liked=!feed.is_liked;
          };

          //-------------- End Like feed --------------------//


          //-------------- Delete feed --------------------//

          $scope.deleteElementFromArray = function (array,element) {
            var index = 0;
            for (var i=0; i<array.length; i++){
              if(array[i].id === element.id){
                index=i;
                array.splice(index,1);
                return
              }
            }
          };

          $scope.openAreUSureModal = function (size,feed) {
            var modalInstance = $uibModal.open({
              animation: $ctrl.animationsEnabled,
              templateUrl: 'components/feed/areUSureModal/areUSureModal.html',
              controller: 'areUSureModalEventsCtrl',
              controllerAs: '$ctrl',
              size: size,
              resolve: {
                items: function () {
                  return feed;
                }
              }
            });
          };

          $rootScope.$on('delete-was-approved', function (e, data) {

            $http({
              method: 'DELETE',
              url: appSettings.link + '/story/' + data.id,
              headers: {'Content-Type': 'application/json'}
            })
              .success(function (response) {
                //$scope.deleteElementFromArray($scope.listOfFeeds,data);
                $scope.deleteElementFromArray($scope.feeds.items,data);
                //console.log($scope.listOfFeeds);
                //$scope.clear();
                // $scope.viewChanged($scope.currentView);
              })
              .error(function () {

              });
          });

          $scope.deleteFeed = function (feed) {
            $scope.openAreUSureModal('sm',feed);
          };

          //-------------- End Delete feed--------------------//

      }

      ]

    }


  }

  ])

.factory('Feed', function($http, appSettings, $routeParams) {
  var Feed = function() {
    this.items = [];
    this.busy = false;
    this.after = '';
  };

  Feed.prototype.nextPage = function(storyUrl) {
    if (this.busy) return;
    this.busy = true;

    var url = storyUrl + this.after;
    $http.get(url)
      .success(function(data) {
        if(data.data.length === 0){
          return
        }
        var items = data.data;

        for (var i = 0; i < items.length; i++) {
          if(items[i].link){
            var matches1 = (items[i].link).match(/^http:\/\/(?:www\.)?youtube.com\/watch\?(?=.*v=\w+)(?:\S+)?$/);
            var matches2 = (items[i].link).match(/^https:\/\/(?:www\.)?youtube.com\/watch\?(?=.*v=\w+)(?:\S+)?$/);
            if (matches1 || matches2) {
              var baseUrl = (items[i].link).split('=');
              items[i].link = baseUrl[baseUrl.length -1];
              items[i].youtube = true;
            }

          }
          this.items.push(items[i]);
        }
        this.after =data.meta.pagination.current_page+1;
        if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
          $('#user-loader').hide();
          return
        }
        this.busy = false;
        $('#user-loader').hide();
      }.bind(this));
  };

  return Feed;
});
