"use strict";

angular.module('classDigApp').factory('userRoleFactory', function () {

  return {

    getUserRole: function (teacher, student, parent) {
      var userRoleData;
      var userTeacherData = teacher;
      var userStudentData = student;
      var userParentData = parent;
      var currentUser = 'student';
      switch (currentUser) {
        case 'teacher':
          userRoleData = userTeacherData;
          break;
        case 'student':
          userRoleData = userStudentData;
          break;
        case 'parent':
          userRoleData = userParentData;
          break;
      }
      return userRoleData;
    }
  };
});
