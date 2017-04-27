app.controller('filesController',
  ['$scope',
    '$rootScope',
    '$uibModal',
    '$log',
    '$document',
    '$http',
    'appSettings',
    '$routeParams',
    '$timeout',
    function ($scope, $rootScope, $uibModal, $log, $document, $http, appSettings,$routeParams, $timeout) {

    $rootScope.activeClassItem = 8;
      $scope.hideCustomButton = true;
      $rootScope.$on('class-data-was-received', function () {
        if(!$rootScope.user.classData.classInArchived){
          $scope.hideCustomButton = false;
        }
      });

      $scope.role = $rootScope.user.data.role;

      $rootScope.userData = {
        'iconAddFile': 'images/files-library/icon-addfile-' + $rootScope.user.data.role + '.svg',
        'iconCreateFolder': 'images/files-library/icon-createfolder-' + $rootScope.user.data.role + '.svg',
        'iconFolder': 'images/files-library/icon-folder-' + $rootScope.user.data.role + '.svg',
        'iconArrowBack': 'images/files-library/icon-arrow-back-' + $rootScope.user.data.role + '.svg',
        'color': $rootScope.user.data.role + '-color',
        'border': $rootScope.user.data.role + '-border',
        'background': $rootScope.user.data.role + '-background',
        "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png'
      };
      $scope.showButton = ($scope.role !=='parent');
      $scope.selection = {selectedItems: [], currentItem: []};
      $scope.arrayOfFoldersId=[0];
      $rootScope.parentFolderId = 0;
      $scope.arrayOfStudentFoldersId=[0];
      $rootScope.parentFolderStudentId = 0;
      $scope.iconFolderImage ='images/files-library/icon-folder-' + $rootScope.user.data.role + '.svg';

      function isFolder(value) {
        return value.type === 1;
      }

      function isTeacherOwner(value){
        return value.owner !== $rootScope.user.data.id
      }

      function isStudentOwner(value){
        return value.owner === $rootScope.user.data.id
      }

      function getListOfFilesFromServer() {
      $http({
        url: appSettings.link + 'class/' + $routeParams.classId + '/library/' + $rootScope.parentFolderId,
        method: "GET"
      })
        .then(function (response) {
            $scope.allFiles = response.data.data;
            console.log("-->", $scope.allFiles);
            $scope.listOfFiles = response.data.data;
            if ($rootScope.user.data.role === 'student') {
              var teacherFiles = $scope.listOfFiles.filter(isTeacherOwner);
              $scope.listOfFiles = teacherFiles;
              $scope.showTeacherFiles = true;
              var studentFiles = $scope.allFiles.filter(isStudentOwner);
              $scope.listOfStudentFiles = studentFiles;

              if ($scope.listOfStudentFiles.length !== 0) {
                $scope.arrayOfStudentFolders = $scope.listOfStudentFiles.filter(isFolder);
                console.log($scope.arrayOfStudentFolders);
                $scope.numberOfStudentFolders = $scope.arrayOfStudentFolders.length;
                $scope.numberOfStudentFiles = $scope.listOfStudentFiles.length - $scope.numberOfStudentFolders;
                $scope.examExist = true;
                $scope.examNotExist = false;
                $('#user-loader').hide();
              }
              else {
                $scope.examNotExist = true;
              }
            }
            if (response.data.data.length !== 0) {
              $scope.arrayOfFolders = $scope.listOfFiles.filter(isFolder);
              $scope.numberOfFolders = $scope.arrayOfFolders.length;
              $scope.numberOfFiles = $scope.listOfFiles.length - $scope.numberOfFolders;
              $scope.examExist = true;
              $scope.examNotExist = false;
              $('#user-loader').hide();
            }
            else {
              $scope.examNotExist = true;
              $scope.examExist = false;
              $('#user-loader').hide();
            }
          },
          function (response) {
            $('#user-loader').hide();
          });
      }

      getListOfFilesFromServer();

      $scope.chooseFileType = function (str) {
        if(str){
          var type = str.split('.');
          return  'images/files-library/icon-file-'+type[1]+'.svg'
        }
        else{
          return 'images/files-library/icon-file-'+'txt'+'.svg'
        }

      };

      $scope.folderIcon=function () {
        return  $rootScope.userData.iconFolder;
      };

      $scope.iconArrowBack = function(){
        return $rootScope.userData.iconArrowBack
      };

      $scope.downloadImgName = function(file){
        return file.name
      };

      $scope.functionSaveFile = function (file) {
        var downloadLink = $('#'+file.id);
        downloadLink.attr('href',file.link);
        downloadLink.attr('download', file.filename);
        downloadLink[0].click();
        downloadLink.removeAttr('href');
        downloadLink.removeAttr('download');
      };

      $scope.functionOpenReference = function(file){
        var showReference = $('#'+file.id);
        var re = new RegExp("^(http|https)://", "i");
        var match = re.test(file.reference);
        if(match){
          file.reference = file.reference
        }
        else{
          file.reference = 'http://'+file.reference
        }

        showReference.attr('href',file.reference);
        showReference[0].click();
        showReference.removeAttr('href');
      };

      $scope.createdByTeacher = function(){
        $scope.showTeacherFiles = true;
        $scope.showStudentFiles = false;
        if($scope.listOfFiles.length!==0){
          $scope.examNotExist = false;
          $scope.examExist = true;
        }
        else{
          $scope.examNotExist = true;
          $scope.examExist = false;
        }
        $('.files-subheader-item').css('border-bottom','2px solid white');
        $('#itemCreatedByStudent').css('border-bottom','2px solid #3d8e78');
        for (var i = 0; i < $scope.contextMenu.items.length; i++){
          $scope.contextMenu.items[i].active = false;
        }
      };

      $scope.createdByStudent = function(){
        $scope.showTeacherFiles = false;
        $scope.showStudentFiles = true;
        if($scope.listOfStudentFiles.length!==0){
          $scope.examNotExist = false;
          $scope.examExist = true;
        }
        else{
          $scope.examNotExist = true;
          $scope.examExist = false;
        }
        $('.files-subheader-item').css('border-bottom','2px solid white');
        $('#itemCreatedByTeacher').css('border-bottom','2px solid #3d8e78');
        for (var i = 0; i < $scope.contextMenu.items.length; i++){
          $scope.contextMenu.items[i].active = true;
        }
      };

      $rootScope.$watch('parentFolderId',function (newVal, oldVal) {
        console.log(newVal, oldVal);
      });

      $rootScope.folderChain = [];
      $rootScope.studentFolderChain = [];

      $scope.openFolder = function (folder) {
        $rootScope.folderChain.push(folder.id);

        $scope.selection = {selectedItems: [], currentItem: []};
        $scope.examExist = false;
        $scope.examNotExist = false;
        $('#user-loader').show();
        $scope.arrayOfFoldersId.push(folder.id);
        // $rootScope.preParentFolder = $rootScope.parentFolderId;
        $rootScope.parentFolderId = folder.id;
        $http({
          url: appSettings.link +'class/'+$routeParams.classId+'/library/'+folder.id,
          method: "GET"
        })
          .then(function (response) {
              $scope.allFiles = response.data.data;
              $scope.listOfFiles=response.data.data;
              //$('#user-loader').hide();
              if(response.data.data.length !== 0) {
                $scope.arrayOfFolders = $scope.listOfFiles.filter(isFolder);
                $scope.numberOfFolders = $scope.arrayOfFolders.length;
                $scope.numberOfFiles = $scope.listOfFiles.length - $scope.numberOfFolders;
                $scope.examExist = true;
                $scope.examNotExist = false;
                $('#user-loader').hide();
              }
              else{
                $scope.numberOfFolders = 0;
                $scope.numberOfFiles = 0;
                $scope.examNotExist = true;
                $scope.examExist = false;
                $('#user-loader').hide();
              }
            },
            function (response) {
              $('#user-loader').hide();
            });
      };

      $scope.openStudentFolder = function (folder) {
        $rootScope.studentFolderChain.push(folder.id);
        $scope.selection = {selectedItems: [], currentItem: []};

        $scope.examExist = false;
        $scope.examNotExist = false;
        $('#user-loader').show();
        $scope.arrayOfStudentFoldersId.push(folder.id);
        $rootScope.parentFolderStudentId = folder.id;
        $http({
          url: appSettings.link +'class/'+$routeParams.classId+'/library/'+folder.id,
          method: "GET"
        })
          .then(function (response) {
                $scope.listOfStudentFiles = response.data.data;
              //$('#user-loader').hide();
              if($scope.listOfStudentFiles.length !== 0) {
                $scope.arrayOfStudentFolders = $scope.listOfStudentFiles.filter(isFolder);
                $scope.numberOfStudentFolders = $scope.arrayOfStudentFolders.length;
                $scope.numberOfStudentFiles = $scope.listOfStudentFiles.length - $scope.numberOfStudentFolders;
                $scope.examExist = true;
                $scope.examNotExist = false;
                $('#user-loader').hide();
              }
              else{
                $scope.examNotExist = true;
                $scope.examExist = false;
                $('#user-loader').hide();
              }
            },
            function (response) {
              $('#user-loader').hide();
            });
      };

      $scope.backToParentFolder = function(){
        $rootScope.folderChain.pop();

        $scope.selection = {selectedItems: [], currentItem: []};
        for (var i = 0; i < $scope.contextMenu.items.length; i++){
          $scope.contextMenu.items[i].state = false;
        }

        $scope.examExist = false;
        $scope.examNotExist = false;
        $('#user-loader').show();
        $rootScope.parentFolderId = $scope.arrayOfFoldersId[$scope.arrayOfFoldersId.length-2];
        $http({
          url: appSettings.link +'class/'+$routeParams.classId+'/library/'+$rootScope.parentFolderId,
          method: "GET"
        })
          .then(function (response) {
              //$('#user-loader').hide();

              $scope.allFiles = response.data.data;
              $scope.listOfFiles=response.data.data;
              if($rootScope.parentFolderId ===0 && $rootScope.user.data.role==='student'){
                $scope.listOfFiles = $scope.allFiles.filter(isTeacherOwner);
              }
              if($scope.listOfFiles.length !== 0) {
                $scope.arrayOfFolders = $scope.listOfFiles.filter(isFolder);
                $scope.numberOfFolders = $scope.arrayOfFolders.length;
                $scope.numberOfFiles = $scope.listOfFiles.length - $scope.numberOfFolders;
                $scope.examExist = true;
                $scope.examNotExist = false;
                $('#user-loader').hide();
              }
              else{
                $scope.examNotExist = true;
                $scope.examExist = false;
                $('#user-loader').hide();
              }
            },
            function (response) {
              $('#user-loader').hide();
            });

        $scope.arrayOfFoldersId.pop();
      };

      //////////////STUDENT BACK/////////////

      $scope.backToParentStudentFolder = function(){
        $rootScope.studentFolderChain.pop();

        $scope.selection = {selectedItems: [], currentItem: []};
        for (var i = 0; i < $scope.contextMenu.items.length; i++){
          $scope.contextMenu.items[i].state = false;
        }

        $scope.examExist = false;
        $scope.examNotExist = false;
        $('#user-loader').show();
        $rootScope.parentFolderStudentId = $scope.arrayOfStudentFoldersId[$scope.arrayOfStudentFoldersId.length-2];
        $http({
          url: appSettings.link +'class/'+$routeParams.classId+'/library/'+$rootScope.parentFolderStudentId,
          method: "GET"
        })
          .then(function (response) {
              //$('#user-loader').hide();
              $scope.allFiles = response.data.data;
              if($rootScope.user.data.role ==='student'){
                var teacherFiles=$scope.allFiles.filter(isTeacherOwner);
                var studentFiles=$scope.allFiles.filter(isStudentOwner);
                $scope.listOfStudentFiles = studentFiles
              }
              if($scope.listOfStudentFiles.length !== 0) {
                $scope.arrayOfStudentFolders = $scope.listOfStudentFiles.filter(isFolder);
                $scope.numberOfStudentFolders = $scope.arrayOfStudentFolders.length;
                $scope.numberOfStudentFiles = $scope.listOfStudentFiles.length - $scope.numberOfStudentFolders;
                $scope.examExist = true;
                $scope.examNotExist = false;
                $('#user-loader').hide();
              }

              else{
                $scope.examNotExist = true;
                $scope.examExist = false;
                $('#user-loader').hide();
              }
            },
            function (response) {
              $('#user-loader').hide();
            });

        $scope.arrayOfStudentFoldersId.pop();
      };


      $scope.$on('createFile', function (event, data) {
        $log.log('New file:',data);
        if($rootScope.user.data.role ==='student' && $scope.showStudentFiles){
          if($scope.listOfStudentFiles.length>0) {
            $scope.listOfStudentFiles.push(data);
            $scope.examExist = true;
            $scope.examNotExist = false;
          }
          else{
            $scope.listOfStudentFiles = [];
            $scope.listOfStudentFiles[0] = data;
            $scope.examExist = true;
            $scope.examNotExist = false;

          }
        }

        else{
          if($scope.listOfFiles.length>0) {
            $scope.listOfFiles.push(data);
            $scope.examExist = true;
            $scope.examNotExist = false;
          }
          else{
            $scope.listOfFiles = [];
            $scope.listOfFiles[0] = data;
            $scope.examExist = true;
            $scope.examNotExist = false;

          }
        }

      });

      $scope.animationsEnabled = true;

      $scope.openModalCreateFile = function (size, parentSelector) {
         var parentElem = parentSelector ?
         angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/files/filesModal/filesModal.html',
          controller: 'fileModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });
      };

      $scope.openModalEditFile = function (currentItem,size, parentSelector) {
        var parentElem = parentSelector ?
          angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/files/filesModal/filesModal.html',
          controller: 'fileModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          appendTo: parentElem,
          resolve: {
            items: function () {
              return currentItem;
            }
          }
        });
      };

      $scope.openModalCreateFolder = function (size, parentSelector) {
        var parentElem = parentSelector ?
          angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/files/folderModal/folderModal.html',
          controller: 'folderModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          appendTo: parentElem,
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });
      };

      $scope.openModalEditFolder = function (currentItem, size, parentSelector) {
        var parentElem = parentSelector ?
          angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/files/folderModal/folderModal.html',
          controller: 'folderModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: size,
          appendTo: parentElem,
          resolve: {
            items: function () {
              return currentItem
            }
          }
        });
      };

      $scope.openAreUSureModal = function (size) {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'components/class/dashboard/files/areUSureModal/areUSureModal.html',
          controller: 'areUSureModalCtrl',
          controllerAs: '$ctrl',
          size: size,
          resolve: {
            items: function () {
              return $scope.modalContext;
            }
          }
        });
      };

      $scope.openMoveModal = function (size) {
        // console.log($scope.arrayOfStudentFolders);
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'components/class/dashboard/files/moveModal/moveModal.html',
          controller: 'moveFilesModalCtrl',
          size: size,
          resolve: {
            files: function () {
              return $scope.selection.selectedItems;
            },
            studentFolders : function () {
              return $scope.arrayOfStudentFolders
            },
            folders : function () {
              return $scope.listOfFiles.filter(isFolder);
            }
          }
        });
      };

      $(document).ready(function () {
        $(document).on('mouseenter', '.button-inside', function () {
          $(this).find(".img-hover").show();
        }).on('mouseleave', '.button-inside', function () {
          $(this).find(".img-hover").hide();
        });
      });

      $scope.data = {
        'items': [
          {
            'img': $rootScope.userData.iconCreateFolder,
            'imgHover': 'images/hover_img/create-folder.png',
            'text': 'Create Folder',
            'click': $scope.openModalCreateFolder
          },
          {
            'img': $rootScope.userData.iconAddFile,
            'imgHover': 'images/hover_img/add-file.png',
            'text': 'Add File',
            'click': $scope.openModalCreateFile
          }
        ],
        'onGlobalButtonClick': ''
      };

      $scope.contextMenu = {
        'items': [
          {
            'img': 'images/context_menu/icon-edit-' + $rootScope.user.data.role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-edit-default_3x.png',
            'imgHover' : 'images/context_menu/icon-edit-hover_3x.png',
            'state' : false,
            'active': false,
            'text': 'Edit',
            'multiSelect': false
          },

          {
            'img': 'images/context_menu/icon-share-' + $rootScope.user.data.role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-share-default_3x.png',
            'imgHover' : 'images/context_menu/icon-share-hover_3x.png',
            'state' : false,
            'active': false,
            'text': 'Move',
            'multiSelect': ['teacher', 'student', 'parents'],
            'singleSelect': ['teacher', 'student', 'parents'],
            'click' : $scope.openMoveModal,
            // 'context' :  $scope.selection.selectedItems
          },

          {
            'img': 'images/context_menu/icon-delete-' + $rootScope.user.data.role + '_3x.png',
            'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
            'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
            'state' : false,
            'active': false,
            'text': 'Delete',
            'multiSelect': ['teacher', 'student'],
            'singleSelect': ['teacher', 'student']
            // 'click': $scope.deleteArrayOfFiles,
            // 'context': $scope.selection.selectedItems
          }
          // {
          //   'img': 'images/context_menu/icon-archive-' + $rootScope.user.data.role + '_3x.png',
          //   'imgDisabled' : 'images/context_menu/icon-archive-default_3x.png',
          //   'state' : false,
          //   'text': 'Insert',
          //   'multiSelect': ['teacher', 'student', 'parents'],
          //   'singleSelect': ['teacher', 'student', 'parents']
          //   // 'click': $scope.InsertLibraryEntries,
          //   // 'context' :  $scope.selection.selectedItems
          // }
        ]
      };

        if($rootScope.user.data.role === 'teacher' || ($rootScope.user.data.role === 'student' && $scope.showStudentFiles)){
          for (var i = 0; i < $scope.contextMenu.items.length; i++){
            $scope.contextMenu.items[i].active = true;
          }
        }
      $scope.selectionWasChanged = function () {
       $timeout(function () {
          if($rootScope.user.data.role === 'teacher' || ($rootScope.user.data.role === 'student' && $scope.showStudentFiles)){
           //console.log($scope.selection);
            if($scope.selection.selectedItems.length === 1) {
              $scope.hidePlusButton = true;
              for (var i = 0; i < $scope.contextMenu.items.length; i++){
                $scope.contextMenu.items[i].state = true;
              }

              // $scope.contextMenu.items[1].click = $scope.MoveLibraryEntries;
              // $scope.contextMenu.items[1].context = $scope.selection.selectedItems;

              $scope.contextMenu.items[2].click = $scope.deleteArrayOfFiles;
              $scope.contextMenu.items[2].context = $scope.selection.selectedItems;

              // $scope.contextMenu.items[3].click = $scope.InsertLibraryEntries;
              // $scope.contextMenu.items[3].context = $scope.selection.selectedItems;


              if($scope.selection.currentItem[0].type ===1){
                $scope.contextMenu.items[0].click = $scope.openModalEditFolder;
                $scope.contextMenu.items[0].context = $scope.selection.currentItem[0];
              }

              if($scope.selection.currentItem[0].type ===0){
                $scope.contextMenu.items[0].click = $scope.openModalEditFile;
                $scope.contextMenu.items[0].context = $scope.selection.currentItem[0];
              }

            } else if($scope.selection.selectedItems.length === 0) {
              $scope.hidePlusButton = false;
              for (var i = 0; i < $scope.contextMenu.items.length; i++){
                $scope.contextMenu.items[i].state = false;
              }
            } else {
              $scope.hidePlusButton = true;
              $scope.contextMenu.items[0].state = false;
              $scope.contextMenu.items[1].state = true;
              $scope.contextMenu.items[2].state = true;
              //$scope.contextMenu.items[1].click = $scope.MoveLibraryEntries;
             // $scope.contextMenu.items[1].context = $scope.selection.currentItem;
            }
          }
        });
        //return $scope.selection
      };

      // $scope.MoveLibraryEntries = function(data){
      //   $rootScope.$broadcast('ChangeInsertState');
      //   $scope.contextMenu.items[3].state = true;
      // };

      $scope.InsertLibraryEntries = function(data){
        $scope.moveParentId;
        $rootScope.$broadcast('ChangeInsertStateTrue');
        if($rootScope.user.data.role ==='teacher'){
          $scope.moveParentId = $rootScope.parentFolderId;
        }
        if($rootScope.user.data.role ==='student'){
          $scope.moveParentId = $rootScope.parentFolderStudentId;
        }
        $http({
          method: 'POST',
          url: appSettings.link + 'class/'+$routeParams.classId+'/library/move',
          headers: {'Content-Type': 'application/json'},
          data: {
            "entries_id": data,
            "parent_id":$scope.moveParentId,
            "id":+$routeParams.classId
          }
        })
          .success(function (response) {
            if($rootScope.user.data.role ==='teacher') {
              $rootScope.$broadcast('DeleteFileFromTeacherList')
            }
            if($rootScope.user.data.role ==='student'){
              $rootScope.$broadcast('DeleteFileFromStudentList')
            }
            $rootScope.$broadcast('ChangeInsertState');
          })
          .error(function () {

          })
      };

      $scope.$on('ChangeInsertState',function(event,data){
        // $scope.contextMenu.items[3].state = !$scope.contextMenu.items[3].state;
      });

      $scope.$on('DeleteFileFromTeacherList',function(event,data){
        getListOfFilesFromServer();
        $scope.selection = {selectedItems: [], currentItem: []};
        $scope.selectionWasChanged();
      });

      $scope.$on('DeleteFileFromStudentList',function(event,data){
        $http({
          url: appSettings.link +'class/'+$routeParams.classId+'/library/'+$rootScope.parentFolderStudentId,
          method: "GET"
        })
          .then(function (response) {
              $scope.listOfStudentFiles = response.data.data;
              var studentFiles = $scope.listOfStudentFiles.filter(isStudentOwner);
              $scope.listOfStudentFiles = studentFiles;
              //$('#user-loader').hide();
              if($scope.listOfStudentFiles.length !== 0) {
                $scope.arrayOfStudentFolders = $scope.listOfStudentFiles.filter(isFolder);
                $scope.numberOfStudentFolders = $scope.arrayOfStudentFolders.length;
                $scope.numberOfStudentFiles = $scope.listOfStudentFiles.length - $scope.numberOfStudentFolders;
                $scope.examExist = true;
                $scope.examNotExist = false;
                $('#user-loader').hide();
              }
              else{
                $scope.examNotExist = true;
                $scope.examExist = false;
                $('#user-loader').hide();
              }
            },
            function (response) {
              $('#user-loader').hide();
            });

        $scope.selection = {selectedItems: [], currentItem: []};
      });

      $scope.deleteArrayOfFiles = function (selectedItems) {
        $scope.modalContext = {
          'action': 'deleteFiles',
          'actionTitle': 'delete',
          'selection': $scope.selection.selectedItems,
          'current': $scope.selection.currentItem
        };
        $scope.openAreUSureModal('sm');
        $rootScope.$on('deleteFiles', function () {
        $http({
          method: 'DELETE',
          url: appSettings.link + 'library',
          headers: {'Content-Type': 'application/json'},
          data: {
            "entries_folder_id": selectedItems,
            "entries_file_id":[],
            "entries_filename":[]
          }
        })
          .success(function (response) {
            if($rootScope.user.data.role ==='teacher') {
              $rootScope.$broadcast('DeleteFileFromTeacherList')
            }
            if($rootScope.user.data.role ==='student'){
              $rootScope.$broadcast('DeleteFileFromStudentList')
            }
          })
          .error(function () {

          })
        })
       }

    }])
    .filter('nameLengthFilter', function() {
      return function(fileName) {
        if(((fileName.length)>10)) {
          return fileName.slice(0, 10) + '...';
        } else {
          return fileName
        }
      }
    });
