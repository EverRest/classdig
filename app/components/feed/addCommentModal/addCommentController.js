angular.module('classDigApp')
  .controller('sendCommentController', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.sendComment = function () {

            $http({
              url: appSettings.link + 'comment',
              method: "POST",
              data: {'story_id': items.id, 'content': $scope.comment}
            })
              .then(function (response) {

                  $uibModalInstance.close();
                 $rootScope.$broadcast('commentAdded', response.data);
                items.comments_count++;
                items.is_comment=true;
                items.comments.data.push(response.data.data)

                },
                function (response) {
                  $scope.ExamServerError = true;
                });
        //  }
          //
          // else{
          //   $http({
          //     url: appSettings.link + 'exams/' + $scope.exam.id,
          //     method: "PUT",
          //     data: $scope.exam
          //   })
          //     .then(function (response) {
          //         deleteAttachments($scope.arrayOfFilesToDelete);
          //         $http({
          //           url: appSettings.link +'exams?search=class_id:'+$routeParams.classId,
          //           method: "GET"
          //         })
          //           .then(function (response) {
          //               $scope.listOfExams = response.data.data;
          //               $rootScope.$broadcast('updateExam', $scope.listOfExams);
          //               $uibModalInstance.close();
          //               //deleteAttachments($scope.arrayOfFilesToDelete);
          //             },
          //             function (response) {
          //               console.log('fail ');
          //               $scope.ExamServerError = true;
          //             });
          //         /////
          //
          //       },
          //       function (response) {
          //         $scope.ExamServerError = true;
          //       });
          // }
        };


      });
