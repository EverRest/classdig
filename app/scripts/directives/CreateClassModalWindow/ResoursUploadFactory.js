angular.module('classDigApp').factory('ResoursUpload', function($resource) {

  return $resource('http://api.classdig.com/upload/:id'); // Note the full endpoint address
});
