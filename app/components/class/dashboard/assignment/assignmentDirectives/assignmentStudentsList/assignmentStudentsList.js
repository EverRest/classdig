angular.module('classDigApp')
  .directive('assignmentStudentsList', ['$timeout', function ($timeout) {
    return {
      scope: {
        submitTitle: "=",
       studentArray: "="
      },

      templateUrl: 'components/class/dashboard/assignment/pollsModal/assignmentDirectives/assignmentStudentsList/assignmentStudentsList.html',
      controller: ['$scope','$rootScope', function ($scope,$rootScope) {



      }]
    }
  }]);
