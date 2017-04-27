/*
*
*
*  $scope.options = [
 {'id':0, 'option':'Never', 'val': -1},
 {'id':1, 'option':'At time of exam', 'val': 0},
 {'id':2, 'option':'5 minutes before', 'val': 5},
 {'id':3, 'option':'10 minutes before', 'val': 10},
 {'id':4, 'option':'15 minutes before', 'val': 15},
 {'id':5, 'option':'30 minutes before', 'val': 30},
 {'id':6, 'option':'1 hour before', 'val': 60},
 {'id':7, 'option':'2 hours before', 'val': 2*60},
 {'id':8, 'option':'1 day before', 'val': 24*60},
 {'id':9, 'option':'2 days before', 'val': 2*24*60},
 {'id':10, 'option':'1 week before', 'val': 7*24*60},
 {'id':11, 'option':'2 weeks before', 'val': 2*7*24*60}
 ];

 *
*
*
* */

angular.module('classDigApp')
    .directive('customSelector', ['$timeout', function ($timeout) {
        return {
            scope: {
                selectedOption: "=",
                options: "=",
                bottom: "="
            },
            transclude: 'true',
            templateUrl: 'scripts/directives/customSelector/customSelectorTemplate.html',
            controller: ['$scope', '$rootScope',  function ($scope, $rootScope) {
                $timeout(function () {
                    if ($scope.bottom) {
                        $('#allOptionList' + $scope.$id).css({bottom: 0});
                    }
                });

                function findOption(options) {
                    return options.val == $scope.selectedOption;
                }

                $(document).click(function (e) {
                    if (['selectedArea', 'customSelectorLabel', 'selector-right-icon'].indexOf(e.target.id) === -1) {
                        if (!$(e.target).hasClass('select-item') && $scope.showOptions) {
                            $scope.showOptions = !$scope.showOptions;
                            $scope.$apply($scope.showOptions);
                        }
                    }
                });

                if ($scope.options.length) {
                    $scope.showOptions = false;
                    if ($scope.selectedOption) {
                        var lableObj = $scope.options.find(findOption);
                        if(lableObj){
                          $scope.label = lableObj.option;
                        }
                    }
                    else {
                        $scope.label = $scope.options[0].option;
                        $scope.selectedOption = $scope.options[0].val;

                    }

                    $scope.functionShowOptions = function () {
                        $scope.showOptions = !$scope.showOptions;
                    };

                    $rootScope.$on('semester-name-was-changed', function (event, selection, selectedOption) {
                      if($scope.options.length === 4) {
                        $scope.options = selection;
                        $scope.selectedOption = selectedOption;
                        $scope.label = selectedOption;
                      }
                    });

                    $scope.functionPushValue = function (value, selectedOption) {
                        $scope.label = selectedOption;
                        $scope.selectedOption = value;
                        $scope.showOptions = !$scope.showOptions;
                      if($scope.options.length === 4) {
                        $rootScope.$broadcast('semester-was-changed', $scope.selectedOption)
                      }
                    }
                }

            }]
        }
    }]);

