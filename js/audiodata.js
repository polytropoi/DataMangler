var elnoiseApp = angular.module('elnoiseApp', ['ngRoute','ngGrid', 'ui.bootstrap', 'audioPlayer', 'angularFileUpload']);

	elnoiseApp.config(['$routeProvider', 
		function ($routeProvider) {
		$routeProvider.
		when('/', {controller:HomeCtrl, templateUrl:'p_home.html'}).
		when('/home', {controller:HomeCtrl, templateUrl:'p_home.html'}).
		when('/recent', {controller:RecentAudioDataCtrl, templateUrl:'p_playlist.html'}).
		when('/random', {controller:RandomAudioDataCtrl, templateUrl:'p_playlist.html'}).
		when('/list', {controller:ListCtrl, templateUrl:'p_list.html'}).
	      when('/audioitems', {controller:AudioItemsCtrl, templateUrl:'p_itemsaudio.html'}).
	      when('/pictureitems', {controller:PictureItemsCtrl, templateUrl:'p_itemspictures.html'}).
	      when('/textitems', {controller:TextItemsCtrl, templateUrl:'p_itemstext.html'}).

	      when('/detail/:item_id', {controller:ItemDetailCtrl, templateUrl:'p_itemdetail.html'}).
	      when('/play/:item_id', {controller:ItemPlayCtrl, templateUrl:'p_wp.html'}).
	      when('/uploadaudio', {controller:UploadAudioCtrl, templateUrl:'p_uploadaudio.html'}).
	      when('/uploadtext', {controller:UploadAudioCtrl, templateUrl:'p_uploadtext.html'}).
	      when('/uploadpicture', {controller:UploadPicturesCtrl, templateUrl:'p_uploadpicture.html'}).
	      when('/uploadtext', {controller:UploadTextCtrl, templateUrl:'p_uploadtext.html'}).
	      when('/webplayer', {controller:WebplayerCtrl, templateUrl:'p_wp.html'}).
	      otherwise({redirectTo:'/'});
  		}]);
/*
		elnoiseApp.directive("myAudio", function(){

        return function(scope, element, attrs){
            element.bind("timeupdate", function(){
                scope.timeElapsed = element[0].currentTime;
                scope.$apply();
            	});
        	}
    	});
*/
		function CollapseCtrl($scope) {
			console.log("tryna collapse");
  			$scope.isCollapsed = false;
		}

 		function ItemDetailCtrl($scope, $http, $routeParams) {
 			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load ItemDetailCtrl controller");
    		$scope.item_id = $routeParams.item_id;
    		console.log("gotsa item id: " + $scope.item_id);
    		$http.get('/item_sc/' + $scope.item_id).success(function (data) {
    			
			$scope.item = data;
			console.log("gotsa item: " + $scope.item[0]._id);
			$scope.date = Date(data[0].otimestamp * 1000);

			});

  		}
  		
 		function ItemPlayCtrl($scope, $http, $routeParams) {
 			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
 			$('#unityPlayer').toggleClass('hidden', false);
 			$scope.item_id = $routeParams.item_id;
 			u.getUnity().SendMessage("ConnectionMangler", "Incoming", $scope.item_id);
  			console.log("tryna load ItemPlayCtrl controller");
    		
    		console.log("gotsa item id: " + $scope.item_id);
    		$http.get('/item_sc/' + $scope.item_id).success(function (data) {
    			
			$scope.item = data;
			console.log("gotsa item: " + $scope.item[0]._id);
			$scope.date = Date(data[0].otimestamp * 1000);

			

			});

  		}

 		function WebplayerCtrl($scope, $http) {
 			
 			 $('#unityPlayer').toggleClass('hidden', false);
  			console.log("tryna load WebplayerCtrl controller");
  		}

 		function HomeCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
  		}

 		function AudioItemsCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
  		}

 		function PictureItemsCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
  		}

 		function TextItemsCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
  		}


  		function RecentAudioDataCtrl($scope, $http, $location) {

  			$('#unityPlayer').toggleClass('hidden', true);
  			$scope.audioPlaylist = [];
  			var audioitems = [];

  			$scope.ptype = "Recent";
  			console.log("tryna load RecentAudioDataCtrl controller");

  			$scope.goNext = function (hash) { 
  				console.log("gotsa location:" + hash);
			$location.path(hash);
			}

  			$http.get('/newaudiodata.json').success(function (data) {
			$scope.audioitems = data;
			audioitems = $scope.audioitems;
			console.log("scopeaudioitems.length = " + audioitems.length + $scope.audioitems[0].URLpng);
					
  		   	for (var i=0; i<audioitems.length; i++) {
  		   		
  		   		$scope.audioPlaylist.push({
  		   			src: [$scope.audioitems[i].URLogg, $scope.audioitems[i].URLmp3],
			       	type: ['audio/ogg', 'audio/mp3'],
			      	title: $scope.audioitems[i].title,
			      	artist: $scope.audioitems[i].artist,
			      	album: $scope.audioitems[i].album,
			      	shortid: $scope.audioitems[i].short_id

  		   			});
  		   		}
			});	
			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");

			}

			function RandomAudioDataCtrl($scope, $http, $location) {
			$('#unityPlayer').toggleClass('hidden', true);
  			$scope.audioPlaylist = [];
  			var audioitems = [];

  			$scope.ptype = "Recent";

  			console.log("tryna load RandomAudioDataCtrl controller");

  			$scope.goNext = function (hash) { 
  				console.log("gotsa location:" + hash);
			$location.path(hash);
			}

  			$http.get('/randomaudiodata.json').success(function (data) {
			$scope.audioitems = data;
			audioitems = $scope.audioitems;
			console.log("scopeaudioitems.length = " + audioitems.length + $scope.audioitems[0].URLpng);
			
			$scope.playlistVariable = [];
  		   	for (var i=0; i<audioitems.length; i++) {
  		   		
  		   		$scope.audioPlaylist.push({
  		   			src: [$scope.audioitems[i].URLogg, $scope.audioitems[i].URLmp3],
			       	type: ['audio/ogg', 'audio/mp3'],
			      	title: $scope.audioitems[i].title,
			      	artist: $scope.audioitems[i].artist,
			      	album: $scope.audioitems[i].album,
			      	shortid: $scope.audioitems[i].short_id

  		   			});
  		   		}
			});		 



			  /*
			  $timeout(function () {
			    $scope.playlist1.unshift({
			      src: 'http://www.metadecks.org/software/sweep/audio/demos/vocal2.ogg',
			      type: 'audio/ogg'
			    });
			  }, 5500);
			  $timeout(function () {
			    $scope.playlist1.push({
			      src: 'http://demos.w3avenue.com/html5-unleashed-tips-tricks-and-techniques/demo-audio.ogg',
			      type: 'audio/ogg'
			    });
			  }, 9500);
				*/
			

  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");

			$scope.myInterval = 5000;
			var slides = $scope.slides = [];
			  
			for (var i=0; i<audioitems.length; i++) {
			  	  slides.push({
			      image: $scope.audioitems[i].URLpng,
			      title: $scope.audioitems[i].title
			      });
			      console.log(slides[i]);
		    }
  		}



  		function ListCtrl($scope, $http) {
  			$('#unityPlayer').toggleClass('hidden', true); 

			$scope.filterOptions = {
		        filterText: "",
		        useExternalFilter: true
		    }; 
		    $scope.totalServerItems = 0;
		    $scope.pagingOptions = {
		        pageSizes: [20, 50, 100],
		        pageSize: 20,
		        currentPage: 1

		    };	

      		$scope.sortInfo = {fields: ['id'], directions: ['asc']};
			//$scope.audioitems = [];

		    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
		        setTimeout(function () {
		            var data;
		            if (searchText) {
		                var ft = searchText.toLowerCase();
		                $http.get('/audiodata.json').success(function (largeLoad) {		
		                    data = largeLoad.filter(function(item) {
		                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
		                    });
		                    $scope.audioitems = data;
		                    $scope.setPagingData(data,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });            
		            } else {
		                $http.get('/audiodata.json').success(function (largeLoad) {
		                    $scope.audioitems = data;
		                    $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
		            }
		        }, 100);
		    };

			$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
		    
		    // sort over all data, not only the data on current page
			//$scope.$watch('sortInfo', function (newVal, oldVal) {
			//  $scope.sortData(newVal.fields[0], newVal.directions[0]);
			//  $scope.pagingOptions.currentPage = 1;
			//  $scope.setPagingData($scope.audioitems, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize)
			//}, true);
			
		    $scope.$watch('pagingOptions', function (newVal, oldVal) {
		        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
		       // if (newVal !== oldVal) {
		          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
		        }
		    }, true);

		    $scope.$watch('filterOptions', function (newVal, oldVal) {
		        if (newVal !== oldVal) {
		          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
		        }
		    }, true);
			
			var linkCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
	                       '  <a href="#/detail/{{row.getProperty(col.field)}}" style="color: #000000">{{row.getProperty(col.field)}}</a>' +
	                       '</div>';

			var dateCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()">{{row.getProperty(col.field) * 1000 | date:\'yyyy-MM-dd\'}}</div>';


			var dateCellFilter = "date * 1000:'yyyy-MM-dd'";

			$scope.gridOptions = { data: 'audioitems',  
				enablePaging: true,
				showFooter: true,
		        totalServerItems: 'totalServerItems',
		   //     sortInfo: $scope.sortInfo,
  			//		useExternalSorting: true,
		        pagingOptions: $scope.pagingOptions,
		        filterOptions: $scope.filterOptions,
				columnDefs: [
				{field:'title', displayName:'Title', width: '30%'}, 
				{field:'artist', displayName:'Author'},
				{field:'album', displayName:'Source'},
				{field:'otimestamp', displayName:'Date', cellTemplate: dateCellTemplate},
				{field:'short_id', displayName:'Code', cellTemplate: linkCellTemplate}
				]};

		//	$scope.setPagingData = function(page, pageSize){	
			$scope.setPagingData = function(data, page, pageSize){		
		        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
		  		$scope.audioitems = pagedData;
		        $scope.totalServerItems = data.length;
		       // if (!$scope.allData) return;
			//	  $scope.totalServerItems = $scope.allData.length;
			//	  $scope.audioitems = $scope.allData.slice((page - 1) * pageSize, page * pageSize);;
		        if (!$scope.$$phase) {
		            $scope.$apply();
		        }
		    };
			
			$scope.sortData = function (field, direction) {
			  if (!$scope.allData) return;
			  $scope.allData.sort(function (a, b) {
			    if (direction == "asc") {
			      return a[field] > b[field] ? 1 : -1;
			    } else {
			      return a[field] > b[field] ? -1 : 1;
			    }
			  })
			}

			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");	
  		}

  		function DetailCtrl($scope, $http) {

  			$http.get('/audio/:id').success(function (data) {
			$scope.audioitem = data;
			});
  		}

  		function UploadAudioCtrl($scope, $http, $timeout, $upload, $route) {  //uses angular-file-upload.js

  			$('#unityPlayer').toggleClass('hidden', true);
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");

  			console.log("tryna load UploadAudioCtrl controller");

  		//	$scope.theFiles = [];
  			$scope.validFileType = false;

			$scope.onFileSelect = function($files) {

				$scope.selectedFiles = [];
				$scope.selectedFiles = $files;

				if ($scope.selectedFiles[0].type === "audio/mp3" || $scope.selectedFiles[0].type === "audio/ogg" || $scope.selectedFiles[0].type === "audio/wav" || $scope.selectedFiles[0].type === "audio/aiff"|| $scope.selectedFiles[0].type === "audio/aif" ) {
					$scope.validFileType = true;
				} else {
					$route.reload();
				}
				
				console.log("gotsa file: " + $scope.selectedFiles[0].type + " validFileType = " + $scope.validFileType);

			}

			$scope.onSubmitUpload = function($files)	{

				$scope.selectedFiles = [];
			//	$scope.selectedFiles = $files;
			//	$scope.selectedFiles = [];
				console.log("tryna onSumbitUpload");
				$scope.progress = [];
				if ($scope.upload && $scope.upload.length > 0) {
					for (var i = 0; i < $scope.upload.length; i++) {
						$scope.upload[i].abort();
						$scope.upload[i].success = null;
					}
				}

				$scope.upload = [];
				$scope.uploadResult = [];
				//$scope.selectedFiles = $files;
				for ( var i = 0; i < 1; i++) {
					var $file = $files[i];
					$scope.progress[i] = 0;
					(function() {
						var index = i; 
						$scope.upload[index] = $upload.upload({
							url : 'uploadaudio',
							headers: {'myHeaderKey': 'myHeaderVal'},
							data : {
								myModel : $scope.myModel
							},
							file : $file,
							fileFormDataName: 'myFile',
							progress: function(evt) {
								$scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
								if (!$scope.$$phase) {
									$scope.$apply();
								}
							}
						}).success(function(data, status, headers, config) {
							$scope.uploadResult.push(data.result);
							// to fix IE not updating the dom
							if (!$scope.$$phase) {
								$scope.$apply();
							}
						});
					})();
				}
			}
		}
  		

  		function UploadPicturesCtrl($scope, $http) {
  			$('#unityPlayer').toggleClass('hidden', true);
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");
  		}
  		function UploadTextCtrl($scope, $http) {
  			$('#unityPlayer').toggleClass('hidden', true);
  			$.backstretch("http://elnoise.s3.amazonaws.com/psychNoise.jpg");	

  		}
/*
elnoiseApp.controller('AudioDataCtrl'	, function AudioDataCtrl($scope, $http) {


		//$scope.audioitems = [];

		$http.get('/audiodata.json').success(function (data) {
			$scope.audioitems = data;
			});
	});



		$scope.countitems = function() {
			var count = 0;
			angular.forEach($scope.audioitems, function (item) {

					count += 1;

				});
			return count;
			}
*/
