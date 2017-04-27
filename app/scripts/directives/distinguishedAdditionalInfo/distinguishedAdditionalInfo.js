angular.module('classDigApp')
  .directive('distinguishedAdditionalInfo', [function () {
    return {
      scope: {
        userInformation: "="
      },
      templateUrl: 'scripts/directives/distinguishedAdditionalInfo/distinguishedAditionalInfo.html',
      controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q) {

        console.log('ADITIONAL DIST INFO', $scope.userInformation);


        $scope.configDiagramMarks = {
          chart: {
            type: 'discreteBarChart',
            height : 130,
            tooltip: {
              contentGenerator: function(d) {
                return d.data.id;
              },
              fixedTop : true,
              classes : 'toltip-for-nvd3'
            },
            duration: 500,
            margin : {
              top: 5,
              right: 20,
              bottom: 20,
              left: 20
            },
            xAxis: {
              axisLabel: ''
            },
            yAxis: {
              axisLabel: ''
              // ticks: 2
            },
            valueFormat: function(d){
              return d3.format(',.0f')(d);
            },
            x: function(d){return d.label;},
            y: function(d){return d.value + (1e-10);}
          }
        };
        $scope.configChartAttendance = {
          "attendanceLabels": ["Present", "Late", "Absent"],
          "attendanceBackgroundColor": ['#1ea66d', '#ffc600', '#f93640'],
          options: {
            tooltips: {enabled: false},
            animation: {duration: 0},
            legend: {display: false},
            line: {borderWidth: 0},
            elements: {arc: {borderWidth: 0}}
          }
        };

        function chunk(arr, size) {
          var newArr = [];
          for (var i=0; i<arr.length; i+=size) {
            newArr.push(arr.slice(i, i+size));
          }
          return newArr;
        }

        $scope.parseMarksDataByStudent = function (array) {
          var preParsedData = [{
            'values' : []
          }];

          for(var i = 0; i < array.length; i++ ){

            if(((array[i].color.length)>7)) {
              array[i].color =  '#'+array[i].color.slice(3);
            }

            var preParsedObj = {
              "label" : Math.floor(+array[i].averageMark),
              "id" : array[i].class,
              "value" :  Math.floor(+array[i].averageMark),
              "color" : array[i].color
            };

            preParsedData[0].values.push(preParsedObj);
          }

          $scope.dataForDiagramMarks = preParsedData;

          for(var i=0;i<$scope.dataForDiagramMarks[0].values.length;i++) {
            for(var j = 0; j < i; j ++){
              $scope.dataForDiagramMarks[0].values[i].label += " "
            }
          }

          $scope.chunkedData = chunk($scope.dataForDiagramMarks[0].values, 4);

        };


        $scope.getMarksDataByStudent = function () {
          var id = $scope.userInformation.id;

          if(id) {
            $http.get(appSettings.link + 'class/report-marks/user/' + id)
              .success(function(response){
                response.data.length ? $scope.marks = true : $scope.marks = false;
                $scope.parseMarksDataByStudent(response.data);
                console.log(response)
              })
          }
        };


        $scope.getAttendanceDataByStudent = function () {
          var id = $scope.userInformation.id;
          if(id) {
            $http.get(appSettings.link + 'attendance/report/user/' + id)
              .success(function(response){
                response.data.length ? $scope.attendance = true : $scope.attendance = false;
                $scope.parseAttendanceDataByStudent(response.data);
              })
          }
        };

        $scope.parseAttendanceDataByStudent = function (array) {
          array.map(function (obj) {
            obj.general = [];
            obj.general[0] = +obj.present;
            obj.general[1] = +obj.absent;
            obj.general[2] = +obj.late;
          });
          $scope.attendanceDataByStudent = array;

        };

        $scope.getMarksDataByStudent();
        $scope.getAttendanceDataByStudent();







      }]
    }
  }]);
