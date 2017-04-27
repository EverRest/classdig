angular.module('classDigApp')
  .directive('arrayQuestions', ['$timeout', function ($timeout) {
    return {
      scope: {
        questionsArray: "=",
        formSubmitted: "=",
        questionId:"="
      },
      templateUrl: 'components/class/dashboard/polls/pollsModal/CreatePollsDirectives/arrayOfQuestions.html',
      controller: ['$scope','$rootScope','Upload','appSettings', function ($scope,$rootScope,Upload,appSettings) {

        $scope.color = $rootScope.userData.color;
        $scope.border = $rootScope.userData.border;
        $scope.background = $rootScope.userData.background;
        $scope.iconCamera = $rootScope.userData.iconCamera;

        if($scope.questionsArray.title){
          $scope.questionsArray.question = $scope.questionsArray.title

        }
        if($scope.questionsArray.image){
          $scope.picFile = $scope.questionsArray.image.link

        }
        $scope.addNewAnswerInputField = function(){
          if($scope.questionsArray.answers.length >= 4){
            angular.element('#'+$scope.questionId).css('display','none');
          }
          if($scope.questionsArray.answers.length >= 5){
            return;
          }
          $scope.questionsArray.answers.push({});

        };

        $scope.deleteChoice = function(index){

          $scope.questionsArray.answers.splice(index,1);

        };

        $scope.uploadPicture = function (file) {
          file.upload = Upload.upload({
            url: appSettings.link + 'upload',
            data: {file: file}
          });
          file.upload.then(function (response) {
            file.result = response.data;
            $scope.uploadPictureId = response.data.data.id;
            $scope.questionsArray.image = $scope.uploadPictureId;

          }, function (response) {
            if (response.status > 0)
              $scope.errorMsg = response.status + ': ' + response.data;

          }, function (evt) {
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            $scope.progressNumber = file.progress;
          });
        };

          $scope.$watch('picFile', function () {
            if ($scope.picFile) {
              $scope.uploadPicture($scope.picFile);
            }
          });

        $scope.$watch('questionsArray', function () {

        });

      }]
    }
  }]);
