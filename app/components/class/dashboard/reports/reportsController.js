app.controller('reportsController',
  ['$scope',
    '$rootScope',
    '$timeout',
    '$routeParams',
    '$http',
    'appSettings',
    'behaviorPreParser',
    '$q',
    function ($scope, $rootScope, $timeout, $routeParams, $http, appSettings, behaviorPreParser, $q) {

      $rootScope.activeClassItem = 10;
      $scope.role = $rootScope.user.data.role;
      var classId = $routeParams.classId;

      $scope.initedAlready = false;

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

      $scope.configDiagramMarks = {
        chart: {
          type: 'discreteBarChart',
          height : 220,
          tooltip: {
            contentGenerator: function(d) {
              return d.data.id;
            },
            fixedTop : true,
            classes : 'toltip-for-nvd3'
          },
          duration: 500,
          margin : {
            top: 20,
            right: 40,
            bottom: 20,
            left: 40
          },
          xAxis: {
            axisLabel: '',
            margin : {
              top: 20
            }
          },
          yAxis: {
            axisLabel: ''
          },
          valueFormat: function(d){
            return d3.format(',.0f')(d);
          },
          x: function(d){return d.label;},
          y: function(d){return d.value + (1e-10);}
        }
      };

      $scope.configDiagram = {
        chart: {
          type: 'discreteBarChart',
          height : $('.class-menu-item-for-behavior').height() - $('.diagram-bottom-bar').height() - $scope.headerHeight,
          showValues: true,
          // height: 110,
          duration: 500,
          showXAxis : false,
          margin : {
            top: 5,
            right: 20,
            bottom: 10,
            left: 20
          },
          tooltip : {
            enabled : false
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

      $scope.configDoughnutBehavior = {
        'labels' : ["Positive", "Need work"],
        'data' : [25, 60],
        'colors' : ['#1ea66d', '#f93640'],
        options: {
          tooltips: {enabled: false},
          animation: {duration: 0},
          legend: {display: false},
          line: {borderWidth: 0},
          elements: {arc: {borderWidth: 0}}
        }
      };

      $rootScope.$on('class-data-was-received', function () {
        if (Array.isArray($rootScope.user.classData.members)) {
          $scope.arrayOfChildrenId = [];
          var pickedName = $rootScope.user.classData.members[0].first_name;
          $scope.pickedChildId = $rootScope.user.classData.members[0].id;
          for (var i = 0; i < $rootScope.user.classData.members.length; i++) {
            $scope.arrayOfChildrenId.push($rootScope.user.classData.members[i].first_name);
          }
          $timeout(function () {
            $scope.childName = pickedName;
            $scope.changeChildren($scope.childName);

          });
        }
        if(!$scope.initedAlready){
          $scope.init();
        }

      });

      $scope.changeChildren = function (name) {
        $scope.childName = name;
        $scope.countClass = 0;
        angular.element('.children').css('border-bottom', '2px solid white');
        angular.element('#' + name).css('border-bottom', '2px solid rgb(207, 81, 93)');
        for (var i = 0; i < $rootScope.user.classData.members.length; i++) {
          if ($rootScope.user.classData.members[i].first_name == $scope.childName) {
            var pickedName = $scope.childName;
            $scope.pickedChildId = $rootScope.user.classData.members[i].id;
            $scope.pickedChild = $rootScope.user.classData.members[i];
            $scope.$broadcast('picked-child-attendance', $scope.pickedChild);

          }
        }
        $scope.getAttendanceDataByStudent();
        $scope.getBehaviorDataByStudent();
        $scope.getMarksDataByStudent();
      };

      $scope.userInfo = {
        'iconAddFile': 'images/files-library/icon-addfile-' + $rootScope.user.data.role + '.svg',
        'iconCreateFolder': 'images/files-library/icon-createfolder-' + $rootScope.user.data.role + '.svg',
        'iconFolder': 'images/files-library/icon-folder-' + $rootScope.user.data.role + '.svg',
        'iconArrowBack': 'images/files-library/icon-arrow-back-' + $rootScope.user.data.role + '.svg',
        'color': $rootScope.user.data.role + '-color',
        'border': $rootScope.user.data.role + '-border',
        'background': $rootScope.user.data.role + '-background',
        "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png'
      };

      $scope.init = function () {
        $scope.initedAlready = true;

        $scope.changeReportsOption('Marks');

        $scope.getAttendanceData();

        $scope.getBehaviorAllData();

        $scope.getMarksData();

        $scope.getAttendanceDataByStudent();
        $scope.getBehaviorDataByStudent();
        $scope.getMarksDataByStudent();

        $timeout(function () {
          $scope.changeSortBy('Total');
          $scope.orderByValue = "Descending";
          $scope.attendanceFilterValue = "Present";
          $scope.behaviorFilterValue = "Positive";
        });
      };

      $scope.changeReportsOption = function (option) {
        angular.element('.option').css('border-bottom','2px solid white');
        angular.element('#'+option).css('border-bottom','2px solid');
        $scope.currentOption = option;
        $scope.loading = true;
        $timeout(function () {
          $scope.loading = false;
        });


        // if(option === 'Behavior') {
        //   $('.diagram-bottom-bar').ready(function () {
        //
        //     $scope.headerHeight = $('.diagram-title').height();
        //     $scope.bottomHeight = $('.diagram-bottom-bar').height();
        //     $scope.allBlockHeight = $('.class-menu-item-for-behavior').height();
        //
        //     $scope.configDiagram.chart.height =  $scope.allBlockHeight - $scope.bottomHeight - $scope.headerHeight;
        //     console.log($scope.configDiagram.chart.height);
        //   });
        // }
      };

      $scope.getAttendanceData = function () {
        $http.get(appSettings.link + 'class/' + classId + '/attendance/report')
          .success(function(response){
            $scope.parseAttendanceData(response.data);
          })
      };

      $scope.parseAttendanceData = function (array) {
        array.map(function (obj) {
          obj.attendanceChartInfo = [];
          obj.attendanceChartInfo[0] = obj.present || 0;
          obj.attendanceChartInfo[1] = obj.late || 0;
          obj.attendanceChartInfo[2] = obj.absent || 0;
        });
        $scope.attendanceList = array;
        $scope.attendanceListOrigin = array;
        $scope.attendanceParsed = true;
      };

      $scope.getBehaviorAllData = function () {
        $q.all([
          $http.get(appSettings.link + 'class/' + classId + '/behavior/report'),
          $http.get(appSettings.link + 'behavior/' +  $rootScope.user.classData.owner)
        ]).then(function (values) {

          $scope.behaviours = values[1].data.data;

          $scope.configChartBehavior =  behaviorPreParser.createConfigObj($scope.behaviours);
          $scope.behaviorObj = behaviorPreParser.generateTemplate($scope.behaviours);

          $scope.dataForDiagramPositive = behaviorPreParser.generateDataForDiagram($scope.behaviours, 1);
          $scope.dataForDiagramNegative = behaviorPreParser.generateDataForDiagram($scope.behaviours, 2);

          $scope.behaviorSpecificValues = $scope.configChartBehavior.positiveLabels;
          $scope.behaviorFilterSpecificValue = $scope.configChartBehavior.positiveLabels[0];

          $scope.parseBehaviorData(values[0].data.data);

        })
      };

      $scope.parseBehaviorData = function (array) {
        array.map(function (obj) {
          obj.behavior['1'] = Object.assign({}, $scope.behaviorObj['1'], obj.behavior['1']);
          obj.behavior['2'] = Object.assign({}, $scope.behaviorObj['2'], obj.behavior['2']);
          obj.behavior['1'].positive = [];
          obj.behavior['2'].negative = [];
        });
        array.map(function (obj) {
          for(var key in obj.behavior['1']){
            var neededItem = $scope.dataForDiagramPositive[0].values.find(function (obj) {
              return obj.label === key;
            });
            if(neededItem){ neededItem.value += obj.behavior['1'][key].count;}

            var ind = $scope.configChartBehavior.positiveLabels.indexOf(key);
            obj.behavior['1'].positive[ind] = obj.behavior['1'][key].count;
          }
          for(var key in obj.behavior['2']){
            neededItem = $scope.dataForDiagramNegative[0].values.find(function (obj) {
              return obj.label === key;
            });
            if(neededItem){ neededItem.value += obj.behavior['2'][key].count;}
            var ind = $scope.configChartBehavior.negativeLabels.indexOf(key);
            obj.behavior['2'].negative[ind] = obj.behavior['2'][key].count;
          }
        });
        $scope.behaviorList = array;
        $scope.behaviorListOrigin = array;
        $scope.behaviorParsed = true;

      };

      $http.get(appSettings.link  + 'category')
        .success(function (response) {
          $scope.sort = [];
          $scope.sortSubCategorys = {};
          response.data.forEach(function (obj) {
            $scope.sort.push(obj.name);
            $scope.sortSubCategorys[obj.name] = [];
          });

        });

      $scope.getMarksData = function () {
        $q.all([
          $http.get(appSettings.link + 'class/' + classId + '/grades'),
          $http.get(appSettings.link  + 'category')
        ])
          .then(function(values){
            $scope.sort = [];
            $scope.sortSubCategorys = {};
            values[1].data.data.forEach(function (obj) {
              $scope.sort.push(obj.name);
              $scope.sortSubCategorys[obj.name] = [];
            });

            $scope.parseMarksData(values[0].data.data);

          })
      };

      $scope.orderByValues = ["Descending", "Ascending"];

      $scope.parseMarksSpecific = function (category, listToParse) {
        var tmpObj = {};
        if(listToParse[category]) {
          if(listToParse[category].length >= 2 && $scope.sortSubCategorys[category].indexOf("All") === -1){
            $scope.sortSubCategorys[category].push("All")
          }
          listToParse[category].forEach(function (obj) {
            tmpObj[obj.name] = obj.mark;
            var index = $scope.sortSubCategorys[category].indexOf(obj.name);
            if(index === -1) { $scope.sortSubCategorys[category].push(obj.name) }
          })
        }
        return tmpObj;
      };

      $scope.parseMarksData = function (array) {
        $scope.marksList = [];
        $scope.marksListOrigin = [];
        var total = 0, counter = 0;

        for(var i = 0; i < array.length; i++){
          var obj = {
            'first_name' : array[i].user.first_name,
            'last_name' :array[i].user.last_name,
            'photo' : array[i].user.photo,
            'Total' : array[i].total,
            'items' : {}
          };
          $scope.sort.forEach(function (item) {
            obj[item] =  array[i]["total" + item];
            obj.items[item] = $scope.parseMarksSpecific(item, array[i].items)
          });

          total += array[i].total;
          if(array[i].total) counter++;

          $scope.marksList.push(obj);
          $scope.marksListOrigin.push(obj);
        }

        $scope.averageMark = 0;
        if(counter) $scope.averageMark = (total / counter).toFixed(2);

        $scope.applyFilters();
        $scope.marksParsed = true;

      };

      $scope.getAttendanceDataByStudent = function () {
        if($scope.role === 'student'){
           var id = $rootScope.user.data.id
        } else if ($scope.role === 'parent' && $scope.pickedChildId) {
          id = $scope.pickedChildId;
        }
        if(id) {
          $http.get(appSettings.link + 'attendance/report/user/' + id)
            .success(function(response){
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

      $scope.getBehaviorDataByStudent = function () {
        if($scope.role === 'student'){
          var id = $rootScope.user.data.id
        } else if ($scope.role === 'parent' && $scope.pickedChildId) {
          id = $scope.pickedChildId;
        }
        if(id) {
          $http.get(appSettings.link + 'report-behavior/user/' + id)
            .success(function(response){
              $scope.parseBehaviorDataByStudent(response.data);
            })
        }
      };

      $scope.parseBehaviorDataByStudent = function (array) {
        array.map(function (obj) {
          obj.general = [];
          obj.general[0] = +obj.positive;
          obj.general[1] = +obj.negative;
        });
        $scope.behaviorDataByStudent = array;
      };

      $scope.getMarksDataByStudent = function () {
        if($scope.role === 'student'){
          var id = $rootScope.user.data.id
        } else if ($scope.role === 'parent' && $scope.pickedChildId) {
          id = $scope.pickedChildId;
        }

        if(id) {
          $http.get(appSettings.link + 'class/report-marks/user/' + id)
            .success(function(response){
              $scope.parseMarksDataByStudent(response.data);
            })
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
            "label" : +array[i].averageMark,
            "id" : array[i].class,
            "value" :  +array[i].averageMark,
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

      $scope.changeSortBy = function (data) {
        $scope.sortBy = data;
        $scope.sortBySpecific = 'All';
      };

      $scope.changeSortBySpecific = function (data) {
        $scope.sortBySpecific = data;
      };

      $scope.changeOrderBy = function (data) {
        $scope.orderByValue = data;
      };

      $scope.changeOrderByAttendance = function (data) {
        $scope.attendanceFilterValue = data;
      };

      $scope.changeSortByBehavior = function (data) {
        $scope.behaviorFilterValue = data;

        if($scope.behaviorFilterValue === 'Positive') {
          $scope.behaviorSpecificValues = $scope.configChartBehavior.positiveLabels;
          $scope.behaviorFilterSpecificValue = $scope.configChartBehavior.positiveLabels[0];
        } else {
          $scope.behaviorSpecificValues = $scope.configChartBehavior.negativeLabels;
          $scope.behaviorFilterSpecificValue = $scope.configChartBehavior.negativeLabels[0];
        }
      };

      $scope.changeSortBySpecificBehavior = function (data) {
        $scope.behaviorFilterSpecificValue = data;
      };

      function sort() {
        if($scope.sortBySpecific === 'All') {
          if($scope.orderByValue === 'Ascending'){
            $scope.marksList.sort(function (obj1, obj2) {
              if(obj1[$scope.category] > obj2[$scope.category]) {
                return 1;
              } else {
                return -1
              }
            })
          } else {
            $scope.marksList.sort(function (obj1, obj2) {
              if(obj1[$scope.category] < obj2[$scope.category]) {
                return 1;
              } else {
                return -1
              }
            })
          }
        } else {
          if($scope.orderByValue === 'Ascending'){
            $scope.marksList.sort(function (obj1, obj2) {
              if(obj1.items[$scope.category][$scope.sub_category] > obj2.items[$scope.category][$scope.sub_category]) {
                return 1;
              } else {
                return -1
              }
            })
          } else {
            $scope.marksList.sort(function (obj1, obj2) {
              if(obj1.items[$scope.category][$scope.sub_category] < obj2.items[$scope.category][$scope.sub_category]) {
                return 1;
              } else {
                return -1
              }
            })
          }
        }
      }

      function filter() {
        if($scope.sortBySpecific === 'All') {
          $scope.marksList = $scope.marksList.filter(function (obj) {
            if(obj[$scope.category]) {
              if(obj[$scope.category] >= $scope.marksRangeSlider.minValue && obj[$scope.category] <= $scope.marksRangeSlider.maxValue){
                return obj;
              }
            } else {
              return obj;
            }

          })
        } else {
          $scope.marksList = $scope.marksList.filter(function (obj) {
            if(obj.items[$scope.category][$scope.sub_category] >= $scope.marksRangeSlider.minValue && obj.items[$scope.category][$scope.sub_category] <= $scope.marksRangeSlider.maxValue)
            return obj;
          })
        }
      }


      $scope.marksRangeSlider = {
        minValue: 0,
        maxValue: 100,
        options: {
          floor: 0,
          ceil: 100,
          step: 1,
          hideLimitLabels : true,
          translate: function (value) {
            if(value === 0
              || value === $scope.marksRangeSlider.minValue
              || value + 1 === $scope.marksRangeSlider.minValue
              || value - 1 === $scope.marksRangeSlider.minValue
              || value - $scope.marksRangeSlider.minValue < $scope.marksRangeSlider.maxValue - value){
              return 'MIN' + value
            } else if(value === 100
              || value === $scope.marksRangeSlider.maxValue
              || value + 1 === $scope.marksRangeSlider.maxValue
              || value - 1 ===  $scope.marksRangeSlider.maxValue
              || value - $scope.marksRangeSlider.minValue > $scope.marksRangeSlider.maxValue - value) {
              return 'MAX' + value
            }
          }
        }
      };
      $scope.attendanceRangeSlider = {
        minValue: 0,
        maxValue: 100,
        options: {
          floor: 0,
          ceil: 100,
          step: 1,
          hideLimitLabels : true,
          translate: function (value) {
            if(value === 0
              || value === $scope.marksRangeSlider.minValue
              || value + 1 === $scope.marksRangeSlider.minValue
              || value - 1 === $scope.marksRangeSlider.minValue
              || value - $scope.marksRangeSlider.minValue < $scope.marksRangeSlider.maxValue - value){
              return 'MIN' + value
            } else if(value === 100
              || value === $scope.marksRangeSlider.maxValue
              || value + 1 === $scope.marksRangeSlider.maxValue
              || value - 1 ===  $scope.marksRangeSlider.maxValue
              || value - $scope.marksRangeSlider.minValue > $scope.marksRangeSlider.maxValue - value) {
              return 'MAX' + value
            }
          }
        }
      };
      $scope.behaviorRangeSlider = {
        minValue: 0,
        maxValue: 100,
        options: {
          floor: 0,
          ceil: 100,
          step: 1,
          hideLimitLabels : true,
          translate: function (value) {
            if(value === 0
              || value === $scope.marksRangeSlider.minValue
              || value + 1 === $scope.marksRangeSlider.minValue
              || value - 1 === $scope.marksRangeSlider.minValue
              || value - $scope.marksRangeSlider.minValue < $scope.marksRangeSlider.maxValue - value){
              return 'MIN' + value
            } else if(value === 100
              || value === $scope.marksRangeSlider.maxValue
              || value + 1 === $scope.marksRangeSlider.maxValue
              || value - 1 ===  $scope.marksRangeSlider.maxValue
              || value - $scope.marksRangeSlider.minValue > $scope.marksRangeSlider.maxValue - value) {
              return 'MAX' + value
            }
          }
        }
      };


      $scope.applyFiltersAttendance = function () {
        $scope.attendanceList = $scope.attendanceListOrigin;
        $scope.attendanceList = $scope.attendanceList.filter(function (obj) {
          if(obj[$scope.attendanceFilterValue.toLowerCase()] >=  $scope.attendanceRangeSlider.minValue && obj[$scope.attendanceFilterValue.toLowerCase()] <=  $scope.attendanceRangeSlider.maxValue) {
            return obj;
          }
        });
        $scope.attendanceList.sort(function (obj1, obj2) {
          if(obj1[$scope.attendanceFilterValue.toLowerCase()] < obj2[$scope.attendanceFilterValue.toLowerCase()]) {
            return 1;
          } else {
            return -1
          }
        })
      };

      $scope.applyFiltersBehavior = function () {
        $scope.behaviorList = $scope.behaviorListOrigin;
        if($scope.behaviorFilterValue === 'Positive') {
          $scope.behaviorList  = $scope.behaviorList.filter(function (obj) {
            if(obj.behavior['1'][$scope.behaviorFilterSpecificValue].count >= $scope.behaviorRangeSlider.minValue && obj.behavior['1'][$scope.behaviorFilterSpecificValue].count <= $scope.behaviorRangeSlider.maxValue) {
              return obj;
            }
          });
          $scope.behaviorList.sort(function (obj1, obj2) {
            if(obj1.behavior['1'][$scope.behaviorFilterSpecificValue].count < obj2.behavior['1'][$scope.behaviorFilterSpecificValue].count) {
              return 1;
            } else {
              return -1
            }
          });

        } else {
          $scope.behaviorList  = $scope.behaviorList.filter(function (obj) {
            if(obj.behavior['2'][$scope.behaviorFilterSpecificValue].count >= $scope.behaviorRangeSlider.minValue && obj.behavior['2'][$scope.behaviorFilterSpecificValue].count <= $scope.behaviorRangeSlider.maxValue) {
              return obj;
            }
          });
          $scope.behaviorList.sort(function (obj1, obj2) {
            if(obj1.behavior['2'][$scope.behaviorFilterSpecificValue].count < obj2.behavior['2'][$scope.behaviorFilterSpecificValue].count) {
              return 1;
            } else {
              return -1
            }
          });
        }
      };

      $scope.resetFilterBehavior = function () {
        $scope.behaviorList = $scope.behaviorListOrigin;
        $scope.behaviorRangeSlider.minValue = 0;
        $scope.behaviorRangeSlider.maxValue = 100;
        $scope.behaviorFilterValue = "Positive";
        $scope.behaviorSpecificValues = $scope.configChartBehavior.positiveLabels;
        $scope.behaviorFilterSpecificValue = "Working hard";
      };

      $scope.resetFiltersAttendance = function () {
        $scope.attendanceList = $scope.attendanceListOrigin;
        $scope.attendanceRangeSlider.minValue = 0;
        $scope.attendanceRangeSlider.maxValue = 100;
        $scope.attendanceFilterValue = "Present";
      };

      $scope.applyFilters = function () {
        $scope.marksList = $scope.marksListOrigin;

        $scope.category = $scope.sortBy;
        $scope.sub_category = $scope.sortBySpecific;

        sort();
        filter();

      };
      $scope.resetFilters = function () {
        $scope.marksList = $scope.marksListOrigin;
        $scope.marksRangeSlider.minValue = 0;
        $scope.marksRangeSlider.maxValue = 100;
        $scope.sortBy = "Total";
        $scope.sortBySpecific = 'All';
        $scope.orderByValue = "Descending";
        $scope.applyFilters();

      };
  }])

  .directive('lebalesDir', function($rootScope) {
    return function(scope, element, attrs) {

      if (scope.$last){
            scope.headerHeight = $('.diagram-title').height();
            scope.bottomHeight = $('.diagram-bottom-bar').height();
            scope.allBlockHeight = $('.class-menu-item-for-behavior').height();
            scope.configDiagram.chart.height =  scope.allBlockHeight - scope.bottomHeight - scope.headerHeight;
      }
    };
  });
