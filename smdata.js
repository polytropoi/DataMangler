var smApp = angular.module('smApp', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'colorpicker.module', 'mediaPlayer', 'angularFileUpload']);

	smApp.config(['$routeProvider',
		function ($routeProvider) {
		$routeProvider.
		when('/', {controller:HomeCtrl, templateUrl:'p_home.html'}).
		when('/home', {controller:HomeCtrl, templateUrl:'p_home.html'}).
		when('/login', {controller:LoginCtrl, templateUrl:'p_login.html'}).
		when('/register', {controller:NewUserCtrl, templateUrl:'p_newuser.html'}).
		when('/reset', {controller:ResetPasswordCtrl, templateUrl:'p_resetpw.html'}).
		when('/resetter/:hzch', {controller:ResetterCtrl, templateUrl:'p_resetter.html'}).

		when('/recent', {controller:RecentAudioDataCtrl, templateUrl:'p_playlist.html'}).
		when('/random', {controller:RandomAudioDataCtrl, templateUrl:'p_playlist.html'}).
		when('/list', {controller:ListCtrl, templateUrl:'p_list.html'}).
        when('/items', {controller:ItemsCtrl, templateUrl:'p_items.html'}).
	    when('/audioitems', {controller:AudioItemsCtrl, templateUrl:'p_itemsaudio.html'}).
	    when('/pictureitems', {controller:PictureItemsCtrl, templateUrl:'p_itemspictures.html'}).
	    when('/textitems', {controller:TextItemsCtrl, templateUrl:'p_itemstext.html'}).

		when('/uaudios/:u_id', {controller:UAudiosCtrl, templateUrl:'p_uaudios.html'}).
		when('/uaudio/:audio_id', {controller:UAudioCtrl, templateUrl:'p_uaudio.html'}).
		when('/upics/:u_id', {controller:UPicsCtrl, templateUrl:'p_upics.html'}).
        when('/upic/:pic_id', {controller:UPicCtrl, templateUrl:'p_upic.html'}).
        when('/uobjs/:u_id', {controller:UObjsCtrl, templateUrl:'p_uobjs.html'}).
        when('/uobj/:obj_id', {controller:UObjCtrl, templateUrl:'p_uobj.html'}).
        when('/upaths/:u_id', {controller:UPathsCtrl, templateUrl:'p_upaths.html'}).
        when('/upath/:user_id/:path_id', {controller:UPathCtrl, templateUrl:'p_upath.html'}).
        when('/path/:path_id', {controller:PathCtrl, templateUrl:'p_path.html'}).

//        when('/useqs/:u_id', {controller:USeqsCtrl, templateUrl:'p_useqs.html'}).
//        when('/useq/:seq_id', {controller:USeqCtrl, templateUrl:'p_useq.html'}).

        when('/ukeys/:u_id', {controller:UKeysCtrl, templateUrl:'p_ukeys.html'}).
        when('/ukey/:key_id', {controller:UKeyCtrl, templateUrl:'p_ukey.html'}).
		when('/uscenes/:u_id', {controller:UScenesCtrl, templateUrl:'p_uscenes.html'}).
		when('/uscene/:user_id/:scene_id', {controller:USceneCtrl, templateUrl:'p_uscene.html'}).

		when('/uprofile/:u_id', {controller:UProfileCtrl, templateUrl:'p_profile.html'}).

	    	    //when('/audiodetail/:item_id', {controller:ItemLongDetailCtrl, templateUrl:'p_audiodetail.html'}).
	    when('/audiodetail/:audio_id', {controller:DetailAudioCtrl, templateUrl:'p_audiodetail.html'}).
	    when('/delete/:item_id', {controller:ItemLongDetailCtrl, templateUrl:'p_delete.html'}).

	      when('/play/:item_id', {controller:ItemPlayCtrl, templateUrl:'p_wp.html'}).
	      when('/unity/:item_id', {controller:UnityPlayCtrl, templateUrl:'p_wpu.html'}).
	      //when('/uploadaudio', {controller:UploadAudioCtrl, templateUrl:'p_uploadaudio.html'}).
            when('/newscene/:u_id', {controller:NewSceneCtrl, templateUrl:'p_newscene.html'}).
            when('/newpath/:u_id', {controller:NewPathCtrl, templateUrl:'p_newpath.html'}).
	      when('/uploadaudio', {controller:NewAudioCtrl, templateUrl:'p_add_audio.html'}).
	      when('/uploadtext', {controller:NewAudioCtrl, templateUrl:'p_uploadtext.html'}).
	      when('/uploadpicture', {controller:NewPictureCtrl, templateUrl:'p_add_picture.html'}).
        when('/uploadobject', {controller:NewObjectCtrl, templateUrl:'p_add_object.html'}).
	      when('/uploadtext', {controller:UploadTextCtrl, templateUrl:'p_uploadtext.html'}).
	      when('/webplayer', {controller:WebplayerCtrl, templateUrl:'p_webplayer.html'}).
	      otherwise({redirectTo:'/'});
  		}]);

	smApp.factory('usernav', function() {
            return {
                urls: {
                    uaudioslink: "#/uaudios/",
                    upicslink: "#/upics/",
                    uobjslink: "#/uobjs/",
                    ukeyslink: "#/ukeys/",
                    ugroupslink: "#/upaths/",
                    usceneslink: "#/uscenes/",
                    uprofilelink: "#/uprofile/"
                }
            }
	});


	smApp.filter('getById', function() {
		  return function(input, id) {
		  	var i=0, len=input.length;
		    for (; i<len; i++) {
		      if (+input[i].id == +id) {
		        return input[i];
		      }
		    }
		    return null;
		}
	});

    smApp.directive('navular', function (){
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: '/navular.html'
        }
    });

    smApp.directive('errSrc', function() {
        return {
            link: function(scope, element, attrs) {

                scope.$watch(function() {
                    return attrs['ngSrc'];
                }, function (value) {
                    if (!value) {
                        element.attr('src', attrs.errSrc);
                    }
                });

                element.bind('error', function() {
                    element.attr('src', attrs.errSrc);
                });
            }
        }
    });

    smApp.directive('changeElementColor', function () {
        return {
            restrict: 'AC',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.myBgcolor, function (newColor) {
                    element.css('background-color', newColor);
                });
                scope.$watch(attrs.myTextcolor, function (newColor) {
                    element.css('color', newColor);
                });
              }
        }

    });


		function CollapseCtrl($scope) {
			console.log("tryna collapse");
  			$scope.isCollapsed = false;
		}

 		function HomeCtrl($scope, usernav, $http, $cookies, $timeout, $route) {
 			$('#unityPlayer').toggleClass('hidden', true);

  			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$scope.user = {};
//            $timeout( function () {
  			$scope.urls = usernav.urls;
//            }, 0, true);
//            console.log(usernav.urls[0])
//            if (usernav.urls[0] == 0) {
//                $route.reload();
//            }
  			console.log("tryna load HomeCtrl controller" + $scope.urls + " " + $cookies._id	);
  				if ($cookies._id !== null && $cookies._id !== undefined) {
				$http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
				console.log(data);


				$scope.userstatus = data;
				$scope.urls = usernav.urls;
				if ($scope.userstatus != "0") {
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace (/"/g,'');
					$scope.headermessage = "You are logged in as " + $scope.userstatus;
				} else {
					$scope.headermessage = "You are not logged in...";
					delete $cookies._id; //if server session doesn't match, the client cookie is bad
					}
				}).error(function (errdata) {
				 	console.log(errdata);
				 	$scope.userstatus = "0";
  					$scope.headermessage = "You are not logged in...";
  					delete $cookies._id; //if server session doesn't match, the client cookie is bad
  				});
			} else {
			$scope.userstatus = "0";
			$scope.headermesssage = "You are not logged in...";
			delete $cookies._id; //if server session doesn't match, the client cookie is bad

			}
  		}

		function LoginCtrl ($scope, $http, $routeParams, $cookies, $location, usernav) {
			//$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
			//console.log($cookies._id);
			$scope.user = {};
			$scope.updatestring = "";
			$scope.headermessage = "You are not logged in...";
//            console.log(usernav.urls[0])
//            if (usernav.urls[0] == 0) {
//                $route.reload();
//            }
			$scope.urls = usernav.urls;
			if ($cookies._id !== null && $cookies._id !== undefined) {

				$http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
				console.log(data);
				$scope.userstatus = data;
				if ($scope.userstatus != "0") {
                  //  $scope.user._id = $scope.user._id.replace (/"/g,'');
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace (/"/g,'');
					$scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
				} else {
					$scope.headermessage = "You are not logged in...";
					delete $cookies._id; //if server session doesn't match, the client cookie is bad
					}
				}).error(function (errdata) {
				 	console.log(errdata);
				 	$scope.userstatus = "0";
  					$scope.headermessage = "You are not logged in...";
  					delete $cookies._id; //if server session doesn't match, the client cookie is bad
  				});

			} else {
			$scope.userstatus = "0";
			$scope.headermesssage = "You are not logged in...";
			delete $cookies._id; //if server session doesn't match, the client cookie is bad
			}

			$scope.Login = function() {
			$http.post('/authreq', $scope.user).success(function(response){
				console.log(response); //mongo ID for user returned
				if (response == "user account not validated") {
				$scope.headermessage = "this user account is not yet validated";
				} else if (response == "noauth") {
				$scope.headermessage = "Login failed";
				} else {
                   // $scope.user._id = response;
                   // $scope.user._id = $scope.user._id.replace (/"/g,'');
				$cookies._id = response;
				console.log("login cookie: " + $cookies._id);
				$scope.headermessage = "successful login!";
				$location.path( "#/login");

				}
				//$scope.headermessage = "Logged in as " + response;
				}).error(function (errdata) {
				 	console.log(errdata);
				 	$scope.userstatus = 0;
  					$scope.headermessage = "Login failed...";
  				});
			}

			$scope.Logout = function() {

				$http.post('/logout', $scope.user).success(function(response){
					console.log(response);
					$cookies._id = null;
					$location.path( "/" );
					console.log("logout cookie: " + $cookies._id);
					});
				}
			}

		function NewUserCtrl ($scope, $http, $routeParams, $cookies, $location) {
			//$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

			$scope.user = {}
			$scope.headermessage = "Enter your desired credentials below";
			$scope.Register = function() {
			$http.post('/newuser', $scope.user).success(function(response){

				if (response == "badpassword") {
					$scope.headermessage = "Invalid password, must be at least 7 characters";
					return;
				} else if (response == "nametaken") {
					$scope.headermessage = "Sorry, that username is taken, please choose another";
					return;
				} else if (response == "emailtaken") {
					$scope.headermessage = "That email address is already in use";
					return;
				} else if (response == "bademail") {
					$scope.headermessage = "Invalid email address";
					return;
				} else if (response == "error") {
					$scope.headermessage = "User Not Found";
					return;
				} else if (response == "") {
					$scope.headermessage = "Server Error";
					return;
				} else {
					console.log(response);
					$cookies._id = response;
					console.log("login cookie: " + $cookies._id);
					$scope.headermessage = "Thanks, a validation email has been sent to the address you provided";
					$scope.user = {};
					$scope.regform.$valid = false;
						}
					});
				//console.log(response); //mongo ID for user returned
				//$location.path( "/profile/" + response);
			}
				//);
		}

		//}

		function ResetPasswordCtrl($scope, $http, $routeParams) {

			$scope.user = {}
			$scope.ready = true;
			console.log("tryna load ResetPasswordController");
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
 			$scope.headermessage = "Enter your email to reset your password";


 			//$('#unityPlayer').toggleClass('hidden', false);

 			$scope.Reset = function() {
 			$http.post('/resetpw', $scope.user).success(function(response){
 				console.log(response);
 					if (response == "invalid email address") {
 					$scope.headermessage = "Invalid email address";
 					} else if (response == "email address not found") {
 					$scope.headermessage = "Email address not found";
 					} else {
 					$scope.headermessage = "Email sent to " + $scope.user.email + " - expires in 1 hour!";
 					$scope.resetform.$valid = false;
 					}
 					});
 				}
 			}

		function ResetterCtrl($scope, $http, $routeParams) {

			console.log($routeParams.hzch);
			$scope.user = {};
 			$scope.headermessage = "Invalid link";
			$scope.validlink = false;
			$scope.checkit = { 'hzch' : $routeParams.hzch};
			//$scope.user.hzch = $routeParams.hzch;
			$http.post('/resetcheck', $scope.checkit).success(function(response){
 				console.log(response);
 					if (response == "validlink") {
 						$scope.validlink = true;
 						$scope.headermessage = "Choose a new password ";
 					} else {
 						$scope.validlink = false;
 					$scope.headermessage = "Invalid Link";

 					}
 				});

 			$scope.SavePassword = function() {
 				if ($scope.validlink) {
 				$scope.user.hzch = $routeParams.hzch;
 				$http.post('/savepw', $scope.user).success(function(response){
 				console.log(response);
 				if (response == "pwsaved") {
 						$scope.validlink = false;
 						$scope.headermessage = "New password saved!";
 					} else {
 						$scope.validlink = false;
 					$scope.headermessage = "Invalid Link";

 					}
 						});
 					}
 				}

 			}


 		function UProfileCtrl($scope, $http, $routeParams, usernav) {

 			$('#unityPlayer').toggleClass('hidden', true);
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/useraudio/:' + $routeParams.u_id).success(function (data) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
 		}

 		function UAudiosCtrl($scope, $http, $routeParams, usernav) {

 			$('#unityPlayer').toggleClass('hidden', true);
 			$scope.urls = usernav.urls;
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/useraudio/' + $routeParams.u_id).success(function (data) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
 		}

 		function UAudioCtrl($scope, $http, $routeParams, usernav) {
 			$scope.urls = usernav.urls;
 			$('#unityPlayer').toggleClass('hidden', true);
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/useraudio/' + $routeParams.audio_id).success(function (data) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
 		}

 		function UPicsCtrl($scope, $http, $routeParams, usernav) {
 			$scope.urls = usernav.urls;
 			$('#unityPlayer').toggleClass('hidden', true);
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/userpics/' + $routeParams.u_id).success(function (data) {
		                    $scope.imageitems = data;
		                    $scope.predicate = '-otimestamp';
                            console.log($scope.imageitems[0]);
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
 		}

 		function UPicCtrl($scope, $http, $routeParams, $cookies, $location, usernav) {
            $scope.urls = usernav.urls;
            $('#unityPlayer').toggleClass('hidden', true);
            $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

            $('#unityPlayer').toggleClass('hidden', true);
            $scope.headermessage = "";
            $scope.user = {};
            $scope.updatestring = "";
            $scope.item_id = $routeParams.pic_id;
            $scope.headermessage = "You are not logged in...";
            $scope.urls = usernav.urls;
            if ($cookies._id !== null && $cookies._id !== undefined) {

                $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                    console.log(data);
                    $scope.userstatus = data;
                    if ($scope.userstatus != "0") {
                        $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                    } else {
                        $scope.headermessage = "You are not logged in...";
                        delete $cookies._id; //if server session doesn't match, the client cookie is bad
                    }
                }).error(function (errdata) {
                    console.log(errdata);
                    $scope.userstatus = "0";
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                });

            } else {
                $scope.userstatus = "0";
                $scope.headermesssage = "You are not logged in...";
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            }

            $http.get('/userpic/' + $routeParams.pic_id).success(function (data) {
                $scope.item = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                //   $scope.setPagingData(page,pageSize);

                if ($scope.item.tags === null) {
                    $scope.item.tags = [];
                }

            });


            $scope.AddTag = function (tag) {
                console.log("tryna AddTag");
                $scope.item.tags.push(tag);
            }

            $scope.RemoveTag = function (tag) {
                console.log("tryna RemovePerson...");
                for (var i = 1, ii = $scope.item.tags.length; i < ii; i++) {
                    if (tag === $scope.item.tags[i]) {
                        $scope.item.tags.splice(i, 1);
                    }
                }
            }

            $scope.onUpdateItemDetails = function () {
                console.log("tryna update " + $scope.item);

                $http.post('/update_pic/' + $scope.item_id, $scope.item).success(function (response) {
                    console.log("submit response:  " + response);
                    if (response == "noauth") {
                        $scope.headermessage = "You must be logged in to do that!"
                    } else {
                        $scope.headermessage = response;

                    }
                });
            }

            $scope.DeleteItem = function () {
                console.log("tryna delete pic " + $scope.item);
                $http.post('/delete_picture/', $scope.item).success(function(response){
                    console.log(response);
                    if (response == "noauth") {
                        $scope.headermessage = "You must be logged in to do that!"
                    } else if (response !== "deleted") {

                        $scope.headermessage = response;

                    } else {
                        $location.path( "#/upics/" + $cookies._id.replace (/"/g,''));
                    }
                });
            }

        }


    function UObjsCtrl($scope, $http, $routeParams, usernav) {
        $scope.urls = usernav.urls;
        $('#unityPlayer').toggleClass('hidden', true);
        $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
        $http.get('/userobjs/' + $routeParams.u_id).success(function (data) {
            $scope.obj_items = data;
            $scope.predicate = '-otimestamp';
            console.log($scope.obj_items[0]);
            //  $scope.setPagingData(largeLoad,page,pageSize);
            //   $scope.setPagingData(page,pageSize);
        });
    }

    function UObjCtrl($scope, $http, $routeParams, $cookies, $location, usernav) {
        $scope.urls = usernav.urls;
        $('#unityPlayer').toggleClass('hidden', true);
        $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

        $('#unityPlayer').toggleClass('hidden', true);
        $scope.headermessage = "";
        $scope.user = {};
        $scope.updatestring = "";
        $scope.item_id = $routeParams.obj_id.toString();
        $scope.headermessage = "You are not logged in...";
        $scope.urls = usernav.urls;
        if ($cookies._id !== null && $cookies._id !== undefined) {

            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);
                $scope.userstatus = data;
                if ($scope.userstatus != "0") {
                    $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                } else {
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                }
            }).error(function (errdata) {
                console.log(errdata);
                $scope.userstatus = "0";
                $scope.headermessage = "You are not logged in...";
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            });

        } else {
            $scope.userstatus = "0";
            $scope.headermesssage = "You are not logged in...";
            delete $cookies._id; //if server session doesn't match, the client cookie is bad
        }

        $http.get('/userobj/' + $routeParams.obj_id).success(function (data) {
            $scope.item = data;
            $scope.predicate = '-otimestamp';
            //  $scope.setPagingData(largeLoad,page,pageSize);
            //   $scope.setPagingData(page,pageSize);

            if ($scope.item.tags === null) {
                $scope.item.tags = [];
            }

        });


        $scope.AddTag = function (tag) {
            console.log("tryna AddTag");
            $scope.item.tags.push(tag);
        }

        $scope.RemoveTag = function (tag) {
            console.log("tryna RemovePerson...");
            for (var i = 1, ii = $scope.item.tags.length; i < ii; i++) {
                if (tag === $scope.item.tags[i]) {
                    $scope.item.tags.splice(i, 1);
                }
            }
        }

        $scope.onUpdateItemDetails = function () {
            console.log("tryna update " + $scope.item);

            $http.post('/update_obj/' + $scope.item_id, $scope.item).success(function (response) {
                console.log("submit response:  " + response);
                if (response == "noauth") {
                    $scope.headermessage = "You must be logged in to do that!"
                } else {
                    $scope.headermessage = response;

                }
            });
        }

        $scope.DeleteItem = function () {
            console.log("tryna delete obj " + $scope.item);
            $http.post('/delete_obj/', $scope.item).success(function(response){
                console.log(response);
                if (response == "noauth") {
                    $scope.headermessage = "You must be logged in to do that!"
                } else if (response !== "deleted") {

                    $scope.headermessage = response;

                } else {
                    $location.path( "#/uobjs/" + $cookies._id.replace (/"/g,''));
                }
            });
        }

    }

        function UPathsCtrl($scope, $http, $routeParams, $cookies, usernav, $location) {
//            $scope.urls = usernav.urls;
            $scope.urls = usernav.urls;
            $('#unityPlayer').toggleClass('hidden', true);
            $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
            if ($cookies._id !== null && $cookies._id !== undefined) {
                //$scope.path = {};
                $scope.paths = [];
                //$scope.audioitems = [];
                $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                    console.log(data);
                    $scope.userstatus = data;
                    $scope.user = {};
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace(/"/g, '');
                    if ($scope.userstatus != "0") {
                        $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                    } else {
                        $scope.headermessage = "You are not logged in...";
                        delete $cookies._id; //if server session doesn't match, the client cookie is bad
                    }
                }).error(function (errdata) {
                    console.log(errdata);
                    $scope.userstatus = "0";
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                });
                $http.get('/upaths/' + $routeParams.u_id).success(function (data) {
                    $scope.pathitems = data;
                    console.log($scope.pathitems);
                    $scope.predicate = '-otimestamp';
                    //  $scope.setPagingData(largeLoad,page,pageSize);
                    //   $scope.setPagingData(page,pageSize);
                });

                $scope.rowClick = function (item) {
//                    $scope.pathID = this.path;
                    console.log("/upath/" + item._id);
                    $location.path( "/upath/" + $scope.user._id + "/"+ item._id);
                }
                $scope.viewClick = function (item) {
//                    $scope.pathID = this.path;
                    console.log("/path/" + item._id);
                    $location.path( "/path/" + item._id);
                }
            }
        }

        function UScenesCtrl($scope, $http, $routeParams, $cookies, usernav, $location) {
        //            $scope.urls = usernav.urls;
            $scope.urls = usernav.urls;
            $('#unityPlayer').toggleClass('hidden', true);
            $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
            if ($cookies._id !== null && $cookies._id !== undefined) {
                //$scope.path = {};
                $scope.paths = [];
                //$scope.audioitems = [];
                $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                    console.log("imallrite " + data);
                    $scope.userstatus = data;
                    $scope.user = {};
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace(/"/g, '');
                    if ($scope.userstatus != "0") {
                        $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                    } else {
                        $scope.headermessage = "You are not logged in...";
                        delete $cookies._id; //if server session doesn't match, the client cookie is bad
                    }
                }).error(function (errdata) {
                    console.log(errdata);
                    $scope.userstatus = "0";
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                });
                $http.get('/uscenes/' + $routeParams.u_id).success(function (data) {
                    $scope.scenes = data;
                    console.log($scope.scenes);
                    $scope.predicate = '-otimestamp';
                    //  $scope.setPagingData(largeLoad,page,pageSize);
                    //   $scope.setPagingData(page,pageSize);
                });

                $scope.rowClick = function (item) {
        //                    $scope.pathID = this.path;
                    console.log("/uscene/" + $scope.user._id + "/"+ item._id);
                    $location.path( "/uscene/" + $scope.user._id + "/"+ item._id);
                }
                $scope.viewClick = function (item) {
        //                    $scope.pathID = this.path;
                    console.log("/scene/" + item._id);
                    $location.path( "/scene/" + item._id);
                }
            }
        }
       
        function NewPathCtrl($scope, $http, $routeParams, $cookies, $location) {
            console.log("XXX NewPathControl load");
            $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
            if ($cookies._id !== null && $cookies._id !== undefined) {
                $scope.path = {};
                $scope.pictureitems = [];
                $scope.audioitems = [];
//                $scope.path.pathColor1 = "#aaaaaa";
//                $scope.path.pathColor2 = "#ffffff";
                $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                    console.log(data);
                    $scope.userstatus = data;
//                    $scope.path.user_id = $cookies._id;
                    $scope.path.user_id = $cookies._id.replace(/"/g, '');
                    if ($scope.userstatus != "0") {
                        $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                    } else {
                        $scope.headermessage = "You are not logged in...";
                        delete $cookies._id; //if server session doesn't match, the client cookie is bad
                    }
                }).error(function (errdata) {
                    console.log(errdata);
                    $scope.userstatus = "0";
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                });

                $http.get('/userpics/' + $routeParams.u_id).success(function (data) {
                    $scope.pictureitems = data;
                    $scope.predicate = '-otimestamp';
                    //  $scope.setPagingData(largeLoad,page,pageSize);
                    console.log("pictureitems.length: ", $scope.pictureitems.length);
                    //   $scope.setPagingData(page,pageSize);
                }).error(function	(data) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    location.$path("/login");
                });

                $http.get('/useraudio/' + $routeParams.u_id).success(function (data) {
                    $scope.audioitems = data;
                    $scope.predicate = '-otimestamp';
                    //  $scope.setPagingData(largeLoad,page,pageSize);
                    console.log($scope.audioitems[0]);
                    //   $scope.setPagingData(page,pageSize);
                }).error(function	(data) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    location.$path("/login");
                });

                $scope.AddTag = function(tag) {
                    if ($scope.flashcard.tags === null) {
                        //	$scope.flashcard.tags = new Array();
                    }
                    if (tag != null && tag.length > 1) {
                        console.log("tryna AddTag: " + tag);
                        $scope.flashcard.tags.push(tag);
                        $scope.tag = "";
                    } else {
                        console.log("that ain't no tag!");
                    }
                }

                $scope.RemoveTag = function (tag) {
                    console.log("tryna RemoveTag...")
                    for (var i = 0, ii = $scope.flashcard.tags.length; i < ii; i++) {
                        if (tag === $scope.flashcard.tags[i]) {
                            $scope.flashcard.tags.splice(i, 1);
                            $scope.tag = "";
                        }
                    }
                }

                $scope.$watch('path.pathPictureID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.pictureitems[i]._id) {
                                $scope.pathPictureIDthumb = $scope.pictureitems[i].URLthumb;
                                console.log($scope.pathPictureIDthumb);
                            }
                        }
                    }
                });

                $scope.$watch('path.pathMapPictureID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.pictureitems[i]._id) {
                                $scope.pathMapPictureIDthumb = $scope.pictureitems[i].URLthumb;
                                console.log($scope.pathMapPictureIDthumb);
                            }
                        }
                    }
                });

                $scope.$watch('path.pathArcanumPictureID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.pictureitems[i]._id) {
                                $scope.pathArcanumPictureIDthumb = $scope.pictureitems[i].URLthumb;
                                console.log($scope.pathArcanumPictureIDthumb);
                            }
                        }
                    }
                });

                $scope.$watch('path.pathTriggerAudioID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.audioitems[i]._id) {
                                $scope.audioWaveformPngTrigger = $scope.audioitems[i].audioWaveformPng;
                                console.log($scope.audioWaveformPngTrigger);
                            }
                        }
                    }
                });
                $scope.$watch('path.pathSpokenAudioID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.audioitems[i]._id) {
                                $scope.audioWaveformPngSpoken = $scope.audioitems[i].audioWaveformPng;
                                console.log($scope.audioWaveformPngSpoken);
                            }
                        }
                    }
                });
                $scope.$watch('path.pathBackgroundAudioID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.audioitems[i]._id) {
                                $scope.audioWaveformPngBackground = $scope.audioitems[i].audioWaveformPng;
                                console.log($scope.audioWaveformPngBackground);
                            }
                        }
                    }
                });
                $scope.$watch('path.pathEnvironmentAudioID', function(id){
                    if (id != null && id != undefined && id.length > 2) {
                        console.log(id);

                        for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (id === $scope.audioitems[i]._id) {
                                $scope.audioWaveformPngEnvironment = $scope.audioitems[i].audioWaveformPng;
                                console.log($scope.audioWaveformPngEnvironment);
                            }
                        }
                    }
                });

                $scope.onSavePath = function() {
                    console.log("tryna update " + $scope.path);

                    $http.post('/newpath',  $scope.path).success(function(response){
                        console.log("submit response:  " + response);
                        if (response == "noauth") {
                            $scope.headermessage = "You must be logged in to do that!"
                        } else {
                            $scope.headermessage = response;
                            $location.path( "#/upaths/" + $cookies._id.replace (/"/g,''));
                        }
                    });
                }

            } else {
                $scope.userstatus = "0";
                $scope.headermesssage = "You are not logged in...";
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            }
        }

    function USceneCtrl($scope, $http, $routeParams, usernav) {
        $scope.urls = usernav.urls;
        $('#unityPlayer').toggleClass('hidden', true);
        $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
        $scope.scene = {};

        $scope.scenePictures = [];
        $scope.scenePictureThumbs = [];
        $scope.pictureitems = [];
        $scope.audioitems = [];

        $http.get('/uscene/:' + $routeParams.user_id + '/:' + $routeParams.scene_id).success(function (data) {

            $scope.scene = data;
    //		                    $scope.predicate = '-otimestamp';
            console.log("XXXX scene:", $scope.scene);

            $http.get('/userpics/' + $routeParams.user_id).success(function (data) {
                $scope.pictureitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log("pictureitems.length: ", $scope.pictureitems.length);

                for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                    for (var k = 0, kk = $scope.scene.scenePictures.length; k < kk; k++) {
                    if ($scope.scene.scenePictures[k] === $scope.pictureitems[i]._id) {
                        var stump = {};
                        stump._id = $scope.pictureitems[i]._id;
                        stump.thumbUrl = $scope.pictureitems[i].URLthumb;
                        stump.title = $scope.pictureitems[i].title;
                        stump.filename = $scope.pictureitems[i].filename;
                        $scope.scenePictureThumbs.push(stump);
                        console.log($scope.scenePictureThumbs);
                        }
                    }
                }
                //   $scope.setPagingData(page,pageSize);
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");
            });

            $http.get('/useraudio/' + $routeParams.u_id).success(function (data) {
                $scope.audioitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log($scope.audioitems[0]);
                //   $scope.setPagingData(page,pageSize);
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");
            });

            $http.get('/userobjs/' + $routeParams.u_id).success(function (data) {
                $scope.objitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log($scope.objitems[0]);
                //   $scope.setPagingData(page,pageSize);
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");
            });

        });
        $scope.AddScenePicture = function(pictureID) {
//                if (id != null && id != undefined && id.length > 0) {
            console.log("XXX gotsa new pictureID: " + pictureID);
            if (pictureID) {
//                    pictures.forEach(function (picture) {
//                console.log(pictureID);
//                      $scope.scenePictureThumbs = [];
                if ($scope.scene.scenePictures) {
                    if ($scope.scene.scenePictures.indexOf(pictureID) == -1)
                        $scope.scene.scenePictures.push(pictureID);
                    //TODO get the value directly from the pictureitems object?
                    for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
//                        if ($scope.scenePictureItems)
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (pictureID === $scope.pictureitems[i]._id) {
                            var stump = {};
                            stump._id = $scope.pictureitems[i]._id;
                            stump.thumbUrl = $scope.pictureitems[i].URLthumb;
                            stump.title = $scope.pictureitems[i].title;
                            stump.filename = $scope.pictureitems[i].filename;

//                            $scope.scenePictureThumbs.push($scope.pictureitems[i].URLthumb);
                            $scope.scenePictureThumbs.push(stump);
                            console.log("XXXX scene pic thumbs: " + $scope.scenePictureThumbs);
                        }
                    }
                }
                //$scope.scene.scenePictures = $scope.scenePictures;
            }
        };
        $scope.DeleteScenePicture = function(id) {

//                if (id != null && id != undefined && id.length > 0) {


            console.log("XXX gotsa new pictureID: " + id + " " + JSON.stringify($scope.scenePictureThumbs[0]));
            if (id != undefined) {
//                    pictures.forEach(function (picture) {
//                console.log(pictureID);
//                      $scope.scenePictureThumbs = [];
                if ($scope.scene.scenePictures) {
                    var scenePicIndex = $scope.scene.scenePictures.indexOf(id);
                    if (scenePicIndex != -1) {
                        $scope.scene.scenePictures.splice(scenePicIndex, 1);
                    }
                    //TODO get the value directly from the pictureitems object?

                    for (var i = 0, ii = $scope.scenePictureThumbs.length - 1; i < ii; i++) {
                        if (($scope.scenePictureThumbs != undefined) && (id === $scope.scenePictureThumbs[i]._id)) {
                              $scope.scenePictureThumbs.splice(i, 1);

                        }
                    }
                    $scope.form.$dirty = true;
                    }
                }
        };

        $scope.onSaveScene = function() {
            console.log("tryna update " + $scope.scene);

            $http.post('/update_scene/' + $routeParams.scene_id,  $scope.scene).success(function(response){
                console.log("submit response:  " + response);
                if (response == "noauth") {
                    $scope.headermessage = "You must be logged in to do that!"
                } else {
                    $scope.headermessage = response;
                   // $location.path( "#/uscenes/" + $cookies._id.replace (/"/g,''));
                }
            });
        }
    }

    function NewSceneCtrl($scope, $http, $routeParams, $cookies, $location) {

        console.log("XXXX tryan load new scene ctrl");
        $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
        if ($cookies._id !== null && $cookies._id !== undefined) {
            $scope.scene = {};
            $scope.scene.scenePictures = [];
            $scope.scenePictureThumbs = [];
            $scope.pictureitems = [];
            $scope.audioitems = [];
    //                $scope.path.pathColor1 = "#aaaaaa";
    //                $scope.path.pathColor2 = "#ffffff";
            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);
                $scope.userstatus = data;
    //                    $scope.path.user_id = $cookies._id;
                $scope.scene.user_id = $cookies._id.replace(/"/g, '');
                if ($scope.userstatus != "0") {
                    $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                } else {
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                }
            }).error(function (errdata) {
                console.log(errdata);
                $scope.userstatus = "0";
                $scope.headermessage = "You are not logged in...";
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            });

            $http.get('/userpics/' + $routeParams.u_id).success(function (data) {
                $scope.pictureitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log("pictureitems.length: ", $scope.pictureitems.length);
                //   $scope.setPagingData(page,pageSize);
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");
            });

            $http.get('/useraudio/' + $routeParams.u_id).success(function (data) {
                $scope.audioitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log($scope.audioitems[0]);
                //   $scope.setPagingData(page,pageSize);
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");
            });

            $scope.AddTag = function(tag) {
                if ($scope.flashcard.tags === null) {
                    //	$scope.flashcard.tags = new Array();
                }
                if (tag != null && tag.length > 1) {
                    console.log("tryna AddTag: " + tag);
                    $scope.flashcard.tags.push(tag);
                    $scope.tag = "";
                } else {
                    console.log("that ain't no tag!");
                }
            }

            $scope.RemoveTag = function (tag) {
                console.log("tryna RemoveTag...");
                for (var i = 0, ii = $scope.flashcard.tags.length; i < ii; i++) {
                    if (tag === $scope.flashcard.tags[i]) {
                        $scope.flashcard.tags.splice(i, 1);
                        $scope.tag = "";
                    }
                }
            }



            $scope.$watch('newScenePicture', function(pictureID){
//                if (id != null && id != undefined && id.length > 0) {
                console.log("XXX gotsa new pictureID: " + pictureID);
                if (pictureID) {
//                    pictures.forEach(function (picture) {
                        console.log(pictureID);
//                      $scope.scenePictureThumbs = [];
                        $scope.scene.scenePictures.push(pictureID);
                    //TODO get the value directly from the pictureitems object?
                        for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                            //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                            if (pictureID === $scope.pictureitems[i]._id) {
                                $scope.scenePictureThumbs[i] = $scope.pictureitems[i].URLthumb;
                                console.log($scope.scenePictureThumbs[i]);
                            }
                        }
//                    });
                }
            });

            $scope.$watch('scene.triggerAudioID', function(id){
                if (id != null && id != undefined && id.length > 2) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngTrigger = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngTrigger);
                        }
                    }
                }
            });
            $scope.$watch('scene.sceneSpokenAudioID', function(id){
                if (id != null && id != undefined && id.length > 2) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngSpoken = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngSpoken);
                        }
                    }
                }
            });
            $scope.$watch('scene.sceneBackgroundAudioID', function(id){
                if (id != null && id != undefined && id.length > 2) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngBackground = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngBackground);
                        }
                    }
                }
            });
            $scope.$watch('scene.sceneEnvironmentAudioID', function(id){
                if (id != null && id != undefined && id.length > 2) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngEnvironment = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngEnvironment);
                        }
                    }
                }
            });

            $scope.onSaveScene = function() {
                console.log("tryna update " + $scope.scene);

                $http.post('/newscene',  $scope.scene).success(function(response){
                    console.log("submit response:  " + response);
                    if (response == "noauth") {
                        $scope.headermessage = "You must be logged in to do that!"
                    } else {
                        $scope.headermessage = response;
                        $location.path( "#/uscenes/" + $cookies._id.replace (/"/g,''));
                    }
                });
            }

        } else {
            $scope.userstatus = "0";
            $scope.headermesssage = "You are not logged in...";
            delete $cookies._id; //if server session doesn't match, the client cookie is bad
        }
    }
    function PathCtrl($scope, $http, $routeParams, $cookies, $route, $location, usernav) {
        console.log("tryna load path");
        $scope.urls = usernav.urls;
        $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

        $('#unityPlayer').toggleClass('hidden', true);
        $scope.headermessage = "";
        $scope.user = {};
        $scope.path = {};
        $scope.updatestring = "";
        $scope.item_id = $routeParams.pic_id;
        $scope.headermessage = "You are not logged in...";
        //            $scope.urls = usernav.urls;


        if ($cookies._id !== null && $cookies._id !== undefined) {

            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);
                $scope.userstatus = data;
                if ($scope.userstatus != "0") {
                    $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                } else {
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                }
            }).error(function (errdata) {
                console.log(errdata);
                $scope.userstatus = "0";
                $scope.headermessage = "You are not logged in...";
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            });

        } else {
            $scope.userstatus = "0";
            $scope.headermesssage = "You are not logged in...";
            delete $cookies._id; //if server session doesn't match, the client cookie is bad
        }


        if ($routeParams.path_id != null) {
            console.log("url:  '/path/" + $routeParams.path_id);

            $http.get('/path/' + $routeParams.path_id).then(function (path) {
//                console.log("path: ", path);
                $scope.path = path.data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                //   $scope.setPagingData(page,pageSize);
//                console.log("path :", JSON.stringify($scope.path));
                if ($scope.path.tags === null) {
                    $scope.path.tags = [];
                }
//
//                $scope.path.pictures.forEach( function() {
//                    if ($scope.path.pictures._id = $scope.path.pathPictureID)
//                });

                for (var i = 0; i < $scope.path.pictures.length; i++) {
                    if ($scope.path.pathPictureID === $scope.path.pictures[i]._id) {
                        $scope.pathPictureQuarterURL = $scope.path.pictures[i].urlQuarter;
                        $scope.pathPictureHalfURL = $scope.path.pictures[i].urlHalf;
                    }
                    if ($scope.path.pathMapPictureID === $scope.path.pictures[i]._id) {
                        $scope.pathMapQuarterURL = $scope.path.pictures[i].urlQuarter;
                        $scope.pathMapHalfURL = $scope.path.pictures[i].urlHalf;
                    }
                    if ($scope.path.pathArcanumPictureID === $scope.path.pictures[i]._id) {
                        $scope.pathArcanumHalfURL = $scope.path.pictures[i].urlHalf;
                    }
                }
//                console.log("pichalf", $scope.pathPictureHalfURL);

                for (var i=0; i<$scope.path.audio.length; i++) {

                    var audioSources = [];
                    audioSources.push({src: $scope.path.audio[i].URLogg, type: 'audio/ogg'});
                    audioSources.push({src: $scope.path.audio[i].URLmp3, type: 'audio/mp3'});

                    $scope.audioPlaylist.push(
                        audioSources
                    );
                }
                $http.get('/seq/1').then(function (sequence){
                    $scope.pathSequence = [];
                    $scope.seqPosition = 0;
                    $scope.pathSequence = sequence.data;
                   // console.log("sequence ", $scope.pathSequence);
//                    $scope.seqPosition = $scope.pathSequence.indexOf($scope.path._id);
                    //console.log("my position is: ", $scope.seqPosition);
                    $scope.seqPosition = parseInt($scope.path.pathNumber);
                });

                $scope.next = function () {
                  //  $scope.seqPosition = parseInt($scope.path.pathNumber);
                    $scope.seqPosition = parseInt($scope.path.pathNumber);
                    if ($scope.seqPosition < $scope.pathSequence.length) {
                        $location.path( "/path/" + ($scope.seqPosition + 1));

//                        $route.reload();
                    } else {
                        $location.path( "/path/" + 1);
//                        $route.reload();
                    }
                };
                $scope.prev = function () {
                    $scope.seqPosition = parseInt($scope.path.pathNumber);
                    if ($scope.seqPosition > 1) {
                        $location.path( "/path/" + ($scope.seqPosition - 1));
//                        $route.reload();
                    } else {
                        $location.path( "/path/" + $scope.pathSequence.length);
//                        $route.reload();
                    }

                };


            });
        }
    }


        function UPathCtrl($scope, $http, $routeParams, $cookies, $location, usernav) {
            console.log("tryna load path");
            $scope.urls = usernav.urls;
            $.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

            $('#unityPlayer').toggleClass('hidden', true);
            $scope.headermessage = "";
            $scope.user = {};
            $scope.path = {};
            $scope.updatestring = "";
            $scope.item_id = $routeParams.pic_id;
            $scope.headermessage = "You are not logged in...";
//            $scope.urls = usernav.urls;


            if ($cookies._id !== null && $cookies._id !== undefined) {

                $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                    console.log(data);
                    $scope.userstatus = data;
                    if ($scope.userstatus != "0") {
                        $scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
                    } else {
                        $scope.headermessage = "You are not logged in...";
                        delete $cookies._id; //if server session doesn't match, the client cookie is bad
                    }
                }).error(function (errdata) {
                    console.log(errdata);
                    $scope.userstatus = "0";
                    $scope.headermessage = "You are not logged in...";
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                });

            } else {
                $scope.userstatus = "0";
                $scope.headermesssage = "You are not logged in...";
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            }

            if ($routeParams.path_id != null) {
                $http.get('/upath/' + $routeParams.user_id + "/" + $routeParams.path_id).then(function (path) {
                    $scope.path = path.data[0];
                    $scope.predicate = '-otimestamp';
                    //  $scope.setPagingData(largeLoad,page,pageSize);
                    //   $scope.setPagingData(page,pageSize);
                    console.log ("path :", JSON.stringify($scope.path));
                    if ($scope.path.tags === null) {
                        $scope.path.tags = [];
                    }
                   // $scope.updateThumbs($scope.path);

                   // $scope.$apply();

                });
            }

            $http.get('/userpics/' + $routeParams.user_id).success(function (data) {
                $scope.pictureitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log("pictureitems.length: ", $scope.pictureitems.length);
                //   $scope.setPagingData(page,pageSize);
                if ($scope.path !== undefined) {
                    //$scope.$apply();
                    $scope.updatePicThumbs($scope.path);
                }
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");

            });

            $http.get('/useraudio/' + $routeParams.user_id).success(function (data) {
                $scope.audioitems = data;
                $scope.predicate = '-otimestamp';
                //  $scope.setPagingData(largeLoad,page,pageSize);
                console.log($scope.audioitems[0]);

                //   $scope.setPagingData(page,pageSize);
                if ($scope.path !== undefined) {
                    //$scope.$apply();
                    $scope.updateWaveformPngs($scope.path);
                }
            }).error(function	(data) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                location.$path("/login");
            });
//
//            $scope.$on('gotsaPath', function (id){
//
//                $path.pathPictureID = $path.pathPictureID
//
//            });

            $scope.updateWaveformPngs = function (pathData) {

                $scope.audioWaveformPngTrigger = returnAudioWaveform(pathData.pathTriggerAudioID);
                $scope.audioWaveformPngSpoken = returnAudioWaveform(pathData.pathSpokenAudioID);
                $scope.audioWaveformPngBackground = returnAudioWaveform(pathData.pathBackgroundAudioID);
                $scope.audioWaveformPngEnvironment = returnAudioWaveform(pathData.pathEnvironmentAudioID);
                function returnAudioWaveform (id) {
                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            return $scope.audioitems[i].audioWaveformPng;
                        }
                    }
                }
            };

            $scope.updatePicThumbs = function (pathData) {

                $scope.pathPictureIDthumb = returnThumb(pathData.pathPictureID);
                $scope.pathMapPictureIDthumb = returnThumb(pathData.pathMapPictureID);
                $scope.pathArcanumPictureIDthumb = returnThumb(pathData.pathArcanumPictureID);

                function returnThumb (id) {
                    for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.pictureitems[i]._id) {
                            return $scope.pictureitems[i].URLthumb;
                        }
                    }
                }
            };

            $scope.$watch('path.pathPictureID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.pictureitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.pictureitems[i]._id) {
                            $scope.pathPictureIDthumb = $scope.pictureitems[i].URLthumb;
                            console.log($scope.pathPictureIDthumb);
                            if ($scope.path !== undefined) {
                                $scope.updatePicThumbs($scope.path);
                            }
                        }
                    }
                }
            });

            $scope.$watch('path.pathMapPictureID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.pictureitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.pictureitems[i]._id) {
                            $scope.pathMapPictureIDthumb = $scope.pictureitems[i].URLthumb;
                            console.log($scope.pathMapPictureIDthumb);
                            if ($scope.path !== undefined) {
                                $scope.updatePicThumbs($scope.path);
                            }
                        }
                    }
                }
            });

            $scope.$watch('path.pathArcanumPictureID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.pictureitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.pictureitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.pictureitems[i]._id) {
                            $scope.pathArcanumPictureIDthumb = $scope.pictureitems[i].URLthumb;
                            console.log($scope.pathArcanumPictureIDthumb);
                            if ($scope.path !== undefined) {
                                $scope.updatePicThumbs($scope.path);
                            }
                        }
                    }
                }
            });

            $scope.$watch('path.pathTriggerAudioID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.audioitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngTrigger = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngTrigger);
//                            if ($scope.path !== undefined) {
//                                $scope.updateWaveformPngs($scope.path);
//                            }
                        }
                    }
                }
            });
            $scope.$watch('path.pathSpokenAudioID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.audioitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngSpoken = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngSpoken);
//                            if ($scope.path !== undefined) {
//                                $scope.updateWaveformPngs($scope.path);
//                            }
                        }
                    }
                }
            });
            $scope.$watch('path.pathBackgroundAudioID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.audioitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngBackground = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngBackground);
//                            if ($scope.path !== undefined) {
//                                $scope.updateWaveformPngs($scope.path);
//                            }
                        }
                    }
                }
            });
            $scope.$watch('path.pathEnvironmentAudioID', function(id){
                if (id != null && id != undefined && id.length > 2 && $scope.audioitems !== undefined) {
                    console.log(id);

                    for (var i = 0, ii = $scope.audioitems.length; i < ii; i++) {
                        //console.log(i + " of " + $scope.pictureitems.length + "looking at " + $scope.pictureitems[i]._id);
                        if (id === $scope.audioitems[i]._id) {
                            $scope.audioWaveformPngEnvironment = $scope.audioitems[i].audioWaveformPng;
                            console.log($scope.audioWaveformPngEnvironment);
//                            if ($scope.path !== undefined) {
//                                $scope.updateWaveformPngs($scope.path);
//                            }
                        }
                    }
                }
            });


            $scope.AddTag = function(tag) {
                console.log("tryna AddTag");
                $scope.item.tags.push(tag);
            }

            $scope.RemoveTag = function (tag) {
                console.log("tryna RemovePerson...");
                for (var i = 1, ii = $scope.item.tags.length; i < ii; i++) {
                    if (tag === $scope.item.tags[i]) {
                        $scope.item.tags.splice(i, 1);
                    }
                }
            }

            $scope.onUpdatePath = function() {
                console.log("tryna update " + $scope.item);

                $http.post('/update_path/' +  $scope.path._id, $scope.path).success(function(response){
                    console.log("submit response:  " + response);
                    if (response == "noauth") {
                        $scope.headermessage = "You must be logged in to do that!"
                    } else {
                        $scope.headermessage = response;

                    }
                });
            }

            $scope.DeleteItem = function () {
                console.log("tryna delete path " + $scope.path._id);
                $http.post('/delete_path/', $scope.path).success(function(response){
                    console.log(response);
                if (response == "noauth") {
                    $scope.headermessage = "You must be logged in to do that!"
                    } else if (response !== "deleted") {

                    $scope.headermessage = response;

                    } else {
                    $location.path( "#/upaths/" + $cookies._id.replace (/"/g,''));
                    }
                    });
        }
    }

 		function UKeysCtrl($scope, $http, $routeParams, usernav) {
 			$scope.urls = usernav.urls;
 			$('#unityPlayer').toggleClass('hidden', true);
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/useraudio/:' + $routeParams.u_id).success(function (data) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
 		}

 		function UKeyCtrl($scope, $http, $routeParams, usernav) {
 			$scope.urls = usernav.urls;
 			$('#unityPlayer').toggleClass('hidden', true);
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/useraudio/:' + $routeParams.audio_id).success(function (data) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
 		}



		function DetailAudioCtrl($scope, $http, $routeParams, $cookies, $location, usernav) {

			//$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
 			$('#unityPlayer').toggleClass('hidden', true);
 			$scope.headermessage = "";
  			$scope.user = {};
			$scope.updatestring = "";
			$scope.headermessage = "You are not logged in...";
			$scope.urls = usernav.urls;
			if ($cookies._id !== null && $cookies._id !== undefined) {

				$http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
				console.log(data);
				$scope.userstatus = data;
				if ($scope.userstatus != "0") {
					$scope.headermessage = "You are logged in as " + $scope.userstatus; //a bit cornfusing, it's returning username
				} else {
					$scope.headermessage = "You are not logged in...";
					delete $cookies._id; //if server session doesn't match, the client cookie is bad
					}
				}).error(function (errdata) {
				 	console.log(errdata);
				 	$scope.userstatus = "0";
  					$scope.headermessage = "You are not logged in...";
  					delete $cookies._id; //if server session doesn't match, the client cookie is bad
  				});

			} else {
			$scope.userstatus = "0";
			$scope.headermesssage = "You are not logged in...";
			delete $cookies._id; //if server session doesn't match, the client cookie is bad
			}

  			console.log("tryna load DetailAudioCtrl ID: " + $routeParams.audio_id);
    		$scope.item_id = $routeParams.audio_id;
    		console.log("gotsa item id: " + $scope.item_id);
    		$http.get('/audio/' + $scope.item_id).success(function (data) {  //to do: error handling

			$scope.item = data;
			console.log("gotsa item: " + $scope.item[0]._id);
			$scope.date = Date(data[0].otimestamp * 1000);
			$scope.itemStatus = $scope.item[0].item_status;
			$scope.itemCategories = {};

			if ($scope.item[0].tags === null) {
				$scope.item[0].tags = [];
				}

			});

			$scope.AddTag = function(tag) {
			 	console.log("tryna AddTag");
				$scope.item[0].tags.push(tag);
			  }

			$scope.RemoveTag = function (tag) {
				console.log("tryna RemovePerson...");
			for (var i = 1, ii = $scope.item[0].tags.length; i < ii; i++) {
			      if (tag === $scope.item[0].tags[i]) {
			        $scope.item[0].tags.splice(i, 1);
			      }
			    }
			}

			$scope.UpdateCategories = function(categories) {


			}


			$scope.onUpdateItemDetails = function() {
				console.log($scope.item[0]);

					$http.post('/update_audio/' +  $scope.item_id, $scope.item[0]).success(function(response){
					console.log("submit response:  " + response);
					if (response == "noauth") {
					$scope.headermessage = "You must be logged in to do that!"
						} else {
							$scope.headermessage = response;

						}
					});
			}


	            $scope.DeleteItem = function () {
	            	console.log("tryna delete audio " + $scope.item[0]._id);
	            	$http.post('/delete_audio/', $scope.item[0]).success(function(response){
	            		console.log(response);
	            	if (response == "noauth") {
						$scope.headermessage = "You must be logged in to do that!"
						} else if (response !== "deleted") {

						$scope.headermessage = response;

						} else {
	            		$location.path( "#/uaudio/" + $cookies._id.replace (/"/g,''));
	            		}
	            		});
	            }
		}


 		function ItemDetailCtrl($scope, $http, $routeParams) {
 			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load ItemDetailCtrl controller");
    		$scope.item_id = $routeParams.item_id;
    		console.log("gotsa item id: " + $scope.item_id);
    		$http.get('/item_sc/' + $scope.item_id).success(function (data) {

			$scope.item = data;
			console.log("gotsa item: " + $scope.item[0]._id);
			$scope.date = Date(data[0].otimestamp * 1000);
			$scope.itemStatus = $scope.item[0].item_status;
			$scope.itemCategories = {};

			});

  		}

  		function ItemLongDetailCtrl($scope, $http, $routeParams) {

 			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
 			$('#unityPlayer').toggleClass('hidden', true);


  			console.log("tryna load ItemDetailCtrl controller");
    		$scope.item_id = $routeParams.item_id;
    		console.log("gotsa item id: " + $scope.item_id);
    		$http.get('/audio/' + $scope.item_id).success(function (data) {  //to do: error handling

			$scope.item = data;
			console.log("gotsa item: " + $scope.item[0]._id);
			$scope.date = Date(data[0].otimestamp * 1000);
			$scope.itemStatus = $scope.item[0].item_status;
			$scope.itemCategories = {};

			if ($scope.item[0].tags === null) {
				$scope.item[0].tags = [];
				}

			});

			$scope.AddTag = function(tag) {
			 	console.log("tryna AddTag");
				$scope.item[0].tags.push(tag);
			  }

			$scope.RemoveTag = function (tag) {
				console.log("tryna RemovePerson...")
			for (var i = 1, ii = $scope.item[0].tags.length; i < ii; i++) {
			      if (tag === $scope.item[0].tags[i]) {
			        $scope.item[0].tags.splice(i, 1);
			      }
			    }
			}

			$scope.UpdateCategories = function(categories) {


			}


			$scope.onUpdateItemDetails = function() {
				console.log($scope.item[0]);

					$http.post('/update/' +  $scope.item_id, $scope.item[0]).success(function(response){
					console.log("submit response:  " + response);
					});
			}

			$scope.DeleteItem = function () {

				console.log("tryna delete item ");


			}



  		}
 		function ItemPlayCtrl($scope, $http, $routeParams) {


 			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");


 			//$('#unityPlayer').toggleClass('hidden', false);
 			$scope.item_id = $routeParams.item_id;
 			//u.getUnity().SendMessage("ConnectionMangler", "Incoming", $scope.item_id);
  			console.log("tryna load ItemPlayCtrl controller");

    		console.log("gotsa item id: " + $scope.item_id);
    		$scope.audioPlaylist = [];
    		$http.get('/item_sc/' + $scope.item_id).success(function (data) {

			$scope.audioitems = data;
			audioitems = $scope.audioitems;

			console.log("gots " + audioitems.length + " itemz: " + audioitems[0].URLogg);
			//$scope.date = Date(data[0].otimestamp * 1000);

			for (var i=0; i < audioitems.length; i++) {

  		   		var audioSources = [];
  		   		audioSources.push({src: audioitems[i].URLogg, type: 'audio/ogg'});
			    audioSources.push({src: audioitems[i].URLmp3, type: 'audio/mp3'});

  		   		$scope.audioPlaylist.push(

  		   			audioSources

  		   			);
  		   		}

  		   	$scope.ShowUnity = function() {

  		   		//audioPlayer.stop();
  		   		$('#unityPlayer').toggleClass('hidden', false);
  		   		u.getUnity().SendMessage("ConnectionMangler", "Incoming", $scope.item_id);

  		   	}


			});

  		}

 		function UnityPlayCtrl($scope, $http, $routeParams) {


 			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");


 			$('#unityPlayer').toggleClass('hidden', false);
 			$scope.item_id = $routeParams.item_id;
 			u.getUnity().SendMessage("ConnectionMangler", "Incoming", $scope.item_id);
  			console.log("tryna load ItemPlayCtrl controller");

    		console.log("gotsa item id: " + $scope.item_id);
    		$scope.audioPlaylist = [];
    		$http.get('/item_sc/' + $scope.item_id).success(function (data) {

			$scope.audioitems = data;
			audioitems = $scope.audioitems;

			console.log("gots " + audioitems.length + " itemz: " + audioitems[0].URLogg);
			//$scope.date = Date(data[0].otimestamp * 1000);


  		   	$scope.ShowUnity = function() {

  		   		//audioPlayer.stop();
  		   		$('#unityPlayer').toggleClass('hidden', false);
  		   		u.getUnity().SendMessage("ConnectionMangler", "Incoming", $scope.item_id);

  		   	}


			});

  		}


 		function WebplayerCtrl($scope, $http) {

 			 $('#unityPlayer').toggleClass('hidden', false);
  			console.log("tryna load WebplayerCtrl controller");
  		}



 		function AudioItemsCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  		}

 		function PictureItemsCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  		}

 		function TextItemsCtrl($scope, $http) {
 			$('#unityPlayer').toggleClass('hidden', true);
  			console.log("tryna load HomeCtrl controller");
  			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  		}


  		function RecentAudioDataCtrl($scope, $http, $location) {

  			$('#unityPlayer').toggleClass('hidden', true);
  			$scope.audioPlaylist = [];
  			//$scope.audioPlaylistData = [];

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

  		   		var audioSources = [];
  		   		audioSources.push({src: $scope.audioitems[i].URLogg, type: 'audio/ogg'});
			    audioSources.push({src: $scope.audioitems[i].URLmp3, type: 'audio/mp3'});

  		   		$scope.audioPlaylist.push(

  		   			audioSources

  		   			);
  		   		}
			});
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

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

  		   	for (var i=0; i<audioitems.length; i++) {

  		   		var audioSources = [];
  		   		audioSources.push({src: $scope.audioitems[i].URLogg, type: 'audio/ogg'});
			    audioSources.push({src: $scope.audioitems[i].URLmp3, type: 'audio/mp3'});

  		   		$scope.audioPlaylist.push(

  		   			audioSources

  		   			);
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


  			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");

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

  		function ItemsCtrl($scope, $http) {
  			$('#unityPlayer').toggleClass('hidden', true);
			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  			$http.get('/audiodata.json').success(function (data) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                  //  $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });

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
		                    $scope.predicate = '-otimestamp';
		                    $scope.setPagingData(data,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
		            } else {
		                $http.get('/audiodata.json').success(function (largeLoad) {
		                    $scope.audioitems = data;
		                    $scope.predicate = '-otimestamp';
		                    $scope.setPagingData(largeLoad,page,pageSize);
		                 //   $scope.setPagingData(page,pageSize);
		                });
		            }
		        }, 100);
		    };

			$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);

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

			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");
  		}

  		function DetailCtrl($scope, $http) {

  			$http.get('/audio/:id').success(function (data) {
			$scope.audioitem = data;
			});
  		}


		function NewAudioCtrl($scope, $http, $routeParams, $cookies, $location, $timeout, $upload, $route, usernav) {

  			console.log("tryna load NewPictureCtrl controller");

		    $scope.inprogress = false;
  			$scope.upstatus = "choose a file (mp3, ogg, wav, aif) or drag/drop into the outlined area";

			$scope.urls = usernav.urls;
  				if ($cookies._id !== null && $cookies._id !== undefined) {
				$http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
				console.log(data);
				//$scope.user._id = $cookies._id;
				$scope.userstatus = data;
				$scope.urls = usernav.urls;
				if ($scope.userstatus != "0") {
					$scope.headermessage = "You are logged in as " + $scope.userstatus;
					$scope.validFileType = false;
				} else {
					$scope.headermessage = "You are not logged in...no upload for you";
					$scope.validFileType = false;
					delete $cookies._id; //if server session doesn't match, the client cookie is bad
					}
				}).error(function (errdata) {
				 	console.log(errdata);
				 	$scope.userstatus = "0";
  					$scope.headermessage = "You are not logged in...no upload for you";
  					$scope.validFileType = false;
  					delete $cookies._id; //if server session doesn't match, the client cookie is bad
  				});
			} else {
			$scope.userstatus = "0";
			$scope.headermesssage = "You are not logged in...no upload for you";
			delete $cookies._id; //if server session doesn't match, the client cookie is bad
			}

  			//$scope.picture = {};
  		//	$scope.theFiles = [];
  			$scope.validFileType = false;
  			$scope.uploadInProgress = false;
  			$scope.uploadComplete = false;

  			$scope.tags = [];

  			//$scope.upload = [];

			$scope.onFileSelect = function($files) {

				$scope.selectedFiles = [];
				$scope.selectedFiles = $files;
				$scope.selectedFile = $scope.selectedFiles[0];

				if ($scope.selectedFile.type === "audio/mp3" || $scope.selectedFile.type === "audio/mp3" || $scope.selectedFile.type === "audio/wav" || $scope.selectedFile.type === "audio/aiff" || $scope.selectedFile.type === "audio/aif") {

				$scope.validFileType = true;

				$scope.upstatus = "valid file selected";
				console.log("gotsa file: " + $scope.selectedFile.type + " validFileType = " + $scope.validFileType);

				} else {
					$scope.validFileType = false;
					$scope.upstatus = "invalid file selected";
				}
			}

			$scope.onFileSubmit = function() {

			//	$scope.selectedFiles = [];
			$scope.percent = 0;
			//for (var i = 0; i < $files.length; i++) {
		      //var $file = $files[i];
		      if ($scope.selectedFile != null && $scope.validFileType === true && $scope.inprogress === false) {
		      	$scope.inprogress = true;
		      $scope.upload = $upload.upload({

		        url: '/uploadaudio', //node.js route

		        // headers: {'headerKey': 'headerValue'}, withCredential: true,
		        data: {title: "", tags: ""},
		        file: $scope.selectedFile,
		        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
		        fileFormDataName: 'audio_upload'
		        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
		        //formDataAppender: function(formData, key, val){}
		      }).progress(function(evt) {
		      	$scope.percent = parseInt(100.0 * evt.loaded / evt.total);
		        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		        $scope.upstatus = "upload in progress, " + $scope.percent + " % complete";
		      }).success(function(data, status, headers, config) {
		        // file is uploaded successfully
		        console.log(data);
		        $scope.inprogress = false;
		        $location.path( "/audiodetail/" + data);
		      });
		  		} else {
		  			$scope.upstatus = "could not submit audio"
		  			console.log("could not submit audio");
		  		}
		  	}

		  	$scope.hasUploader = function() {
		  		if ($scope.upload) {
				return $scope.upload != null;
				}
			};
			$scope.abort = function() {
				if ($scope.upload) {
				$scope.upload.abort();
				$scope.upload = null;
				$route.reload();
				}
			};
 		}

/*

*/
function NewPictureCtrl($scope, $http, $routeParams, $cookies, $location, $timeout, $upload, $route, usernav) {

  			console.log("tryna load NewPictureCtrl controller");

		    $scope.inprogress = false;
  			$scope.upstatus = "choose a file (jpg or png) or drag/drop into the outlined area";

			$scope.urls = usernav.urls;
  				if ($cookies._id !== null && $cookies._id !== undefined) {
				$http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
				console.log(data);
				//$scope.user._id = $cookies._id;
				$scope.userstatus = data;
				$scope.urls = usernav.urls;
				if ($scope.userstatus != "0") {
					$scope.headermessage = "You are logged in as " + $scope.userstatus;
					$scope.validFileType = false;
				} else {
					$scope.headermessage = "You are not logged in...no upload for you";
					$scope.validFileType = false;
					delete $cookies._id; //if server session doesn't match, the client cookie is bad
					}
				}).error(function (errdata) {
				 	console.log(errdata);
				 	$scope.userstatus = "0";
  					$scope.headermessage = "You are not logged in...no upload for you";
  					$scope.validFileType = false;
  					delete $cookies._id; //if server session doesn't match, the client cookie is bad
  				});
			} else {
			$scope.userstatus = "0";
			$scope.headermesssage = "You are not logged in...no upload for you";
			delete $cookies._id; //if server session doesn't match, the client cookie is bad
			}

  			$scope.picture = {};
  		//	$scope.theFiles = [];
  			$scope.validFileType = false;
  			$scope.uploadInProgress = false;
  			$scope.uploadComplete = false;

  			$scope.tags = [];

  			//$scope.upload = [];

			$scope.onFileSelect = function($files) {

				$scope.selectedFiles = [];
				$scope.selectedFiles = $files;
				$scope.selectedFile = $scope.selectedFiles[0];

				if ($scope.selectedFile.type === "image/jpg" || $scope.selectedFile.type === "image/png" || $scope.selectedFile.type === "image/jpeg") {

				$scope.validFileType = true;

				$scope.upstatus = "valid file selected";
				console.log("gotsa file: " + $scope.selectedFile.type + " validFileType = " + $scope.validFileType);

				} else {
					$scope.validFileType = false;
					$scope.upstatus = "invalid file selected";
				}
			}

			$scope.onFileSubmit = function() {

			//	$scope.selectedFiles = [];
			$scope.percent = 0;
			//for (var i = 0; i < $files.length; i++) {
		      //var $file = $files[i];
		      if ($scope.selectedFile != null && $scope.validFileType === true && $scope.inprogress === false) {
		      	$scope.inprogress = true;
		      $scope.upload = $upload.upload({

		        url: '/uploadpicture', //upload.php script, node.js route, or servlet url

		        // headers: {'headerKey': 'headerValue'}, withCredential: true,
		        data: {title: "", tags: ""},
		        file: $scope.selectedFile,
		        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
		        fileFormDataName: 'picture_upload'
		        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
		        //formDataAppender: function(formData, key, val){}
		      }).progress(function(evt) {
		      	$scope.percent = parseInt(100.0 * evt.loaded / evt.total);
		        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		        $scope.upstatus = "upload in progress, " + $scope.percent + " % complete";
		      }).success(function(data, status, headers, config) {
		        // file is uploaded successfully
		        console.log(data);
		        $scope.inprogress = false;
		        $location.path( "/upicture/" + data);
		      });
		  		} else {
		  			$scope.upstatus = "could not upload picture"
		  			console.log("could not submit picture");
		  		}
		  	}

		  	$scope.hasUploader = function() {
		  		if ($scope.upload) {
				return $scope.upload != null;
				}
			};
			$scope.abort = function() {
				if ($scope.upload) {
				$scope.upload.abort();
				$scope.upload = null;
				$route.reload();
				}
			};
 		}



    function NewObjectCtrl($scope, $http, $routeParams, $cookies, $location, $timeout, $upload, $route, usernav) {

        console.log("tryna load NewPictureCtrl controller");

        $scope.inprogress = false;
        $scope.upstatus = "choose a .obj file or drag/drop into the outlined area";

        $scope.urls = usernav.urls;
        if ($cookies._id !== null && $cookies._id !== undefined) {
            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);
                //$scope.user._id = $cookies._id;
                $scope.userstatus = data;
                $scope.urls = usernav.urls;
                if ($scope.userstatus != "0") {
                    $scope.headermessage = "You are logged in as " + $scope.userstatus;
                    $scope.validFileType = false;
                } else {
                    $scope.headermessage = "You are not logged in...no upload for you";
                    $scope.validFileType = false;
                    delete $cookies._id; //if server session doesn't match, the client cookie is bad
                }
            }).error(function (errdata) {
                console.log(errdata);
                $scope.userstatus = "0";
                $scope.headermessage = "You are not logged in...no upload for you";
                $scope.validFileType = false;
                delete $cookies._id; //if server session doesn't match, the client cookie is bad
            });
        } else {
            $scope.userstatus = "0";
            $scope.headermesssage = "You are not logged in...no upload for you";
            delete $cookies._id; //if server session doesn't match, the client cookie is bad
        }

        $scope.object = {};
        //	$scope.theFiles = [];
        $scope.validFileType = false;
        $scope.uploadInProgress = false;
        $scope.uploadComplete = false;

        $scope.tags = [];

        //$scope.upload = [];

        $scope.onFileSelect = function($files) {

            $scope.selectedFiles = [];
            $scope.selectedFiles = $files;
            $scope.selectedFile = $scope.selectedFiles[0];

//            if ($scope.selectedFile.type === "application/octet-stream") { ? wtf is proper mime type for .obj?
                if (1 == 1) {
                $scope.validFileType = true;

                $scope.upstatus = "valid file selected";
                console.log("gotsa file: " + $scope.selectedFile.type + " validFileType = " + $scope.validFileType);

            } else {
                $scope.validFileType = false;
                $scope.upstatus = "invalid file selected";
            }
        }

        $scope.onFileSubmit = function() {

            //	$scope.selectedFiles = [];
            $scope.percent = 0;
            //for (var i = 0; i < $files.length; i++) {
            //var $file = $files[i];
            if ($scope.selectedFile != null && $scope.validFileType === true && $scope.inprogress === false) {
                $scope.inprogress = true;
                $scope.upload = $upload.upload({

                    url: '/uploadobject', //upload.php script, node.js route, or servlet url

                    // headers: {'headerKey': 'headerValue'}, withCredential: true,
                    data: {title: "", tags: ""},
                    file: $scope.selectedFile,
                    /* set file formData name for 'Content-Desposition' header. Default: 'file' */
                    fileFormDataName: 'obj_upload'
                    /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
                    //formDataAppender: function(formData, key, val){}
                }).progress(function(evt) {
                    $scope.percent = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    $scope.upstatus = "upload in progress, " + $scope.percent + " % complete";
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                    $scope.inprogress = false;
                    $location.path( "/uobj/" + data);
                });
            } else {
                $scope.upstatus = "could not upload obj"
                console.log("could not submit obj");
            }
        }

        $scope.hasUploader = function() {
            if ($scope.upload) {
                return $scope.upload != null;
            }
        };
        $scope.abort = function() {
            if ($scope.upload) {
                $scope.upload.abort();
                $scope.upload = null;
                $route.reload();
            }
        };
    }

  		function UploadTextCtrl($scope, $http) {
  			$('#unityPlayer').toggleClass('hidden', true);
  			$.backstretch("http://servicemedia.s3.amazonaws.com/servmed_c1.jpg");	

  		}
/*
smApp.controller('AudioDataCtrl'	, function AudioDataCtrl($scope, $http) {


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
