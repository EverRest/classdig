angular.module('classDigApp')
  .directive('checkQuestion', ['$timeout', function ($timeout) {
    return {
      scope: {
        questionTitle: "=",
        questionQuestions:"=",
        questionMultiselect: "=",
        commonClass: "=",
        userAnswers:"=",
        pollItem: "=",
        timeEnd:'=',
        tittleId: '='
      },

      templateUrl: 'components/class/dashboard/polls/pollsModal/CreatePollsDirectives/checkQuestionBlock/checkQuestionBlock.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {

        $scope.classChecker=$scope.pollItem;
        $scope.border = $rootScope.userData.border;
        $scope.color = $rootScope.userData.color;
        $scope.background = $rootScope.userData.background;
        var indexInArray = $scope.userAnswers.length;

        $scope.progressNumberGenerator = function(number){
         // console.log(number/$scope.pollItem.poll.voted.length)
          var progressNumber;
          if ($scope.questionMultiselect ==1){
            progressNumber = Math.round((number/$scope.pollItem.poll.participants.length)*100);
          }
          else{
            if($scope.pollItem.poll.voted.length >0) {
              progressNumber = Math.round((number / $scope.pollItem.poll.voted.length) * 100);
            }
            else{
              progressNumber=Math.round((number / $scope.pollItem.poll.voted) * 100)
            }

          }
          return progressNumber
        };

        $scope.checkPollAnswer = function(id,answer){

          if($scope.CheckAnswers()){
            return false
          }
          else{
            var idSelector = '#'+id;
            if($scope.questionMultiselect == 1) {

              if (!$(idSelector).hasClass($scope.background)) {
                $(idSelector).addClass($scope.background);
                $scope.userAnswers[indexInArray] = {};
                $scope.userAnswers[indexInArray].answer_id = id;
                indexInArray++;
              }
              else {
                $(idSelector).removeClass($scope.background);
                var answerIndex = searchElementInArray(id, $scope.userAnswers);
                $scope.userAnswers.splice(answerIndex,1);
                indexInArray--;

              }
            }

            else {
              //var myClass = ReturnFirstWord($scope.questionTitle);
              var myClass = $scope.tittleId;
              $('.'+myClass).removeClass($scope.background);
              $(idSelector).addClass($scope.background);
              $scope.userAnswers[0] = {};
              $scope.userAnswers[0].answer_id= id;
            }

          }

        };
        function ReturnFirstWord(string){
          var array = string.split(" ");
          var newArray=[];

          newArray.push(array[0]);

          return newArray.toString().replace (/,/g, "");
        }


        function searchElementInArray (nameKey, array){
          for (var i=0; i < array.length; i++) {
            if (array[i].answer_id === nameKey) {
              return i;
            }
          }
        }

        $timeout(function () {
          $scope.CheckAnswers();
        });

        $scope.checkOwner = function(){
          var isPollOwner = false;
          if($scope.pollItem.poll.user_id === $rootScope.user.data.id){
            isPollOwner = true;
          }
          return isPollOwner
        };

        $scope.CheckAnswers = function(){
          var userVoted;
          for(var i=0;i< $scope.questionQuestions.length; i++){
            if($scope.questionQuestions[i].userVoted){
              $('#'+$scope.questionQuestions[i].id).addClass($scope.background);
              userVoted = true
            }
          }
          if($scope.pollItem.poll.user_id === $rootScope.user.data.id){
            userVoted = true;
          }

          if($scope.timeEnd<=0){
            userVoted = true;
          }

          return userVoted
        };


      }]
    }
  }]);
