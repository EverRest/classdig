angular.module('classDigApp')
    .directive('activities', [function () {
        return {
            scope: {
                selectedUser: "=",
                showAdditionalInfo:"=",
                showDistinguishedAdditionalInfo: "=",
                onStudentsPage: "="
            },
            templateUrl: 'scripts/directives/activities/activities.html',
            controller: ['$scope', 'Users', '$log', '$rootScope', '$http', 'appSettings', '$timeout', '$routeParams', 'classData', '_', '$q', function ($scope, Users, $log, $rootScope, $http, appSettings, $timeout, $routeParams, classData, _, $q) {

                $scope.userData = {};
                $scope.userData.color = $rootScope.user.data.role+'-color';
                $scope.userData.profileBackground = 'profile-bg-'+$rootScope.user.data.role;
                $scope.userInformation = {};
                //console.log($rootScope.user.data);
                var role =$rootScope.user.data.role;
                $scope.userProfileData ={
                    'color':role+'-color',
                    'border' : role+'-border',
                    'background' : role+'-background',
                    'userPhotoBorder': $rootScope.user.data.role + '-userPhotoBorder'
                };

                $scope.$watch('selectedUser',function () {

                    $scope.requesstInProgress = true;
                    if($scope.selectedUser){
                        getInfo($scope.selectedUser.id);
                    }
                    else if (!$scope.onStudentsPage) {
                        getInfo($rootScope.user.data.id);

                    }
                });


                function getInfo(id) {
                    $q.all([
                        $http.get(appSettings.link + 'profile/indicator/' + id),
                        $http.get(appSettings.link + 'current-user/' + id),
                        $http.get(appSettings.link + 'user/announcements/' + $rootScope.user.data.id)
                    ]).then(function (values) {
                        console.log(values);
                            $scope.requesstInProgress = false;
                            $scope.userStatistic = values[0].data.data;
                            $scope.userStatistic.countActivity = $scope.userStatistic.countActivity + $scope.userStatistic.countFollows + $scope.userStatistic.countSubscribers + values[2].data.announcements.length;
                            $scope.userInformation = values[1].data.data;
                            $scope.userData.profileBackground = 'profile-bg-'+$scope.userInformation.role;
                            $scope.userData.color = $scope.userInformation.role+'-color';
                        },
                        function (values) {

                        });
                }


                getInfo(732);




            }]
        }
    }]);

/*.directive("activities", function() {
    return {
        template : "<h2>Made by a directive!</h2>"
    };
});*/








