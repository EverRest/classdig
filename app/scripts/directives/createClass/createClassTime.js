angular.module('classDigApp')
    .directive('createClassTime', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                time: '='
            },
            templateUrl: 'scripts/directives/createClass/createClassTime.html',
            controller: ['$scope', '$rootScope', '_', 'moment', '$log',
                function ($scope, $rootScope, _, moment, $log) {
                    $scope.role = $rootScope.user.data.role;
                    $scope.color = $rootScope.userData.color;
                    $scope.background = $rootScope.userData.background;
                    $scope.selectedDays = [];
                    $scope.defaultFrom= new Date();
                    $scope.defaultTo = new Date(moment().add(1, 'h').format());
                    $scope.defaultFromTime = moment($scope.defaultFrom).format('LT');
                    $scope.defaultToTime = moment($scope.defaultTo).format('LT');

                    // $scope.timeDiffPatern = '00:30:00';

                    $scope.createClassTimeData = [
                        {
                            day: 1,
                            dayTitle: 'Sun',
                            fullDay: 'Sunday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        },
                        {
                            day: 2,
                            dayTitle: 'Mon',
                            fullDay: 'Monday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        },
                        {
                            day: 3,
                            dayTitle: 'Tue',
                            fullDay: 'Tuesday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        },
                        {
                            day: 4,
                            dayTitle: 'Wed',
                            fullDay: 'Wednesday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        },
                        {
                            day: 5,
                            dayTitle: 'Thu',
                            fullDay: 'Thursday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        },
                        {
                            day: 6,
                            dayTitle: 'Fri',
                            fullDay: 'Friday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        },
                        {
                            day: 7,
                            dayTitle: 'Sat',
                            fullDay: 'Saturday',
                            active: false,
                            from: $scope.defaultFromTime,
                            to:$scope.defaultToTime
                        }
                    ];

                    $timeout(function () {
                        $scope.init();
                    });
                    /**
                     *
                     * @param col
                     */
                    $scope.initDatePicker = function (col) {
                        _.each(col, function (defaultDate, index) {
                            $(index).datetimepicker({
                                defaultDate: defaultDate,
                                format: 'LT'
                            }).on('dp.change', function (event) {
                                $(this).change();
                                $scope.doValidation(event.target.id);
                            }).on('dp.show', function () {
                                $('.bootstrap-datetimepicker-widget .btn-primary')
                                    .addClass('bg-'+$scope.role).css({'border': 'none'});
                                $('.bootstrap-datetimepicker-widget .btn :not(.btn-primary)')
                                    .addClass('c-'+$scope.role);

                            });
                        })
                    };
                    /**
                     *
                     * @param data
                     * @returns {{}}
                     */
                    $scope.preparePickerData = function (data) {
                        var o = {};
                        o['#from' + data.day] = data.from ? new Date(moment(data.to, 'LT').format()) : $scope.defaultFrom;
                        o['#to' + data.day] = data.to ? new Date(moment(data.to, 'LT').format()) : $scope.defaultTo;
                        return o;
                    };
                    /**
                     *
                     */


                    $scope.doValidation = function (id) {
                      if(id.indexOf('to') !== -1) {
                        var number = id.charAt(id.length - 1);
                        var timeObject = $scope.createClassTimeData.find(function (obj) {
                          return obj.day === +number
                        });
                        var from = new Date(moment(timeObject.from,"LT"));
                        var to = new Date(moment(timeObject.to,"LT"));
                        var diffMs = (to - from);
                        var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
                        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                        if(diffHrs * 60 + diffMins > 0 && diffHrs * 60 + diffMins < 30 || diffHrs * 60 + diffMins > -90 && diffHrs * 60 + diffMins < -60) {
                          timeObject.from = moment(moment(moment(timeObject.to,"LT")).add(-60, 'm')).format('LT');
                          $(this).change();
                        }
                      } else if (id.indexOf('from') !== -1) {
                        number = id.charAt(id.length - 1);
                        timeObject = $scope.createClassTimeData.find(function (obj) {
                          return obj.day === +number
                        });
                        from = new Date(moment(timeObject.from,"LT"));
                        to = new Date(moment(timeObject.to,"LT"));
                        diffMs = (to - from);
                        diffHrs = Math.floor((diffMs % 86400000) / 3600000);
                        diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                        if(diffHrs * 60 + diffMins > 0 && diffHrs * 60 + diffMins < 30 || diffHrs * 60 + diffMins > -90 && diffHrs * 60 + diffMins < -60) {
                          timeObject.to = moment(moment(moment(timeObject.from,"LT")).add(60, 'm')).format('LT');
                          $(this).change();
                        }
                      }
                    };



                    $scope.syncData = function () {
                        $scope.time = _.filter($scope.createClassTimeData, function (item) {
                            return item.active;
                        });
                        console.log("time", $scope.createClassTimeData);

                        $log.log("data time" , $scope.time);

                        // Set default value
                        if (!$scope.time.length) {
                            $scope.createClassTimeData[1].active = true;
                            $scope.syncData();
                        }
                    };
                    /**
                     *
                     */
                    $scope.init = function () {
                        for (var i = 0; i < $scope.createClassTimeData.length; i++) {
                            var obj = $scope.createClassTimeData[i];
                            for (var j = 0; j < $scope.time.length; j++) {
                                var obj1 = $scope.time[j];
                                if (obj1.day == obj.day) {
                                    obj.from = obj1.from;
                                    obj.to = obj1.to;
                                    obj.active = true;
                                    $log.log('Info:', obj)
                                }
                            }
                            $scope.initDatePicker($scope.preparePickerData(obj));
                        }
                      $scope.syncData();
                    };
                    /**
                     *
                     * @param day
                     */
                    $scope.selectDay = function (day) {
                        if (day.active) {
                            var length = _.filter($scope.createClassTimeData, function (item) {
                                return item.active;
                            }).length;
                            if (length == 1)
                                return;
                        }
                        day.active = !day.active;
                        $scope.syncData();
                    };

                }]
        }
    }]);
