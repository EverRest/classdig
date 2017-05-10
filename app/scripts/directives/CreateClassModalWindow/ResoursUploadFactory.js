angular.module('classDigApp').factory('ResoursUpload', function($resource) {

  return $resource('http://api.classdig.oyihost.com/upload/:id'); // Note the full endpoint address
  // return $resource('http://loc.classdig.com/upload/:id'); // Note the full endpoint address
});
