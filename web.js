var smApp = angular.module('smApp', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'colorpicker.module']);

    smApp.config(['$compileProvider',  //so custom urls will work on mobile, i.e. strr://blahblah
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|ftp|mailto|strr|chrome-extension):/);
        }
    ]);

	smApp.config(['$routeProvider',

		function ($routeProvider) {
		$routeProvider.
		when('/', {controller:HomeCtrl, templateUrl:'p_home.html'}).
		when('/home', {controller:HomeCtrl, templateUrl:'p_home.html'}).
        when('/about', {controller:AboutCtrl, templateUrl:'p_about.html'}).
		when('/login', {controller:LoginCtrl, templateUrl:'p_login.html'}).
		when('/register', {controller:NewUserCtrl, templateUrl:'p_newuser.html'}).
		when('/reset', {controller:ResetPasswordCtrl, templateUrl:'p_resetpw.html'}).
		when('/resetter/:hzch', {controller:ResetterCtrl, templateUrl:'p_resetter.html'}).

//      when('/uprofile/:user_id', {controller:UProfileCtrl, templateUrl:'p_uprofile.html'}).
		when('/uprofile/:u_id', {controller:UProfileCtrl, templateUrl:'p_profile.html'}).

        when('/alldomains/', {controller:DomainsCtrl, templateUrl:'p_domains.html'}).
        when('/domain/:domain', {controller:DomainCtrl, templateUrl:'p_domain.html'}).
        when('/allusers/', {controller:UsersCtrl, templateUrl:'p_users.html'}).
        otherwise({redirectTo:'/'});
  		}]);

	smApp.factory('usernav', function() {
            return {
                urls: {
                    uprofilelink: "#/uprofile/"
                }
            }
	});

    smApp.factory('app_id', function() {
        var app_id = {
            request: function(config) {
                config.headers['appid'] = "55b2ecf840edea7583000001";
                return config;
            }
        };
        return app_id;
    });

    smApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('app_id');
    }]);

    smApp.factory('messages', function(){
        var messages = {};

        messages.list = [];

        messages.add = function(message){
            messages.list.push({id: messages.list.length, text: message});
        };
        return messages;
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

    function HomeCtrl($scope, usernav, $http, $cookies) {
        $('#unityPlayer').toggleClass('hidden', true);

        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");
        $scope.user = {};
//            $timeout( function () {
        $scope.urls = usernav.urls;

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

        $scope.user = {};
        $scope.updatestring = "";
        $scope.headermessage = "You are not logged in...";

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

                var r = response.replace(/["']/g, ""); //cleanup
                var resp = r.split('~');
            $cookies._id = resp[0];
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
        }

    }

    function AboutCtrl($scope, $http, $routeParams) {

        $scope.user = {};
        console.log("tryna load aboutpage");
        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");

    }

    function ResetPasswordCtrl($scope, $http, $routeParams) {

        $scope.user = {}
        $scope.ready = true;
        console.log("tryna load ResetPasswordController");
        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");
        $scope.headermessage = "Enter your email to reset your password";

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
    function DomainsCtrl($scope, $http, usernav, $cookies) {

        $('#unityPlayer').toggleClass('hidden', true);
        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");
        $scope.user = {};
        $scope.userprofile = {};
        $scope.urls = usernav.urls;

        console.log("tryna load DomainsCtrl controller" + $scope.urls + " " + $cookies._id	);
        if ($cookies._id !== null && $cookies._id !== undefined) {
            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);

                $scope.userstatus = data;
                $scope.urls = usernav.urls;
                if ($scope.userstatus != "0") {
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace (/"/g,'');
                    $scope.headermessage = "You are logged in as " + $scope.userstatus;
                    $http.get('/alldomains/').success(function (data) {
                        $scope.domains = data;
                    });

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

    function DomainCtrl($scope, $http, $routeParams, usernav, $cookies, $route) {

        $('#unityPlayer').toggleClass('hidden', true);
        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");
        $scope.user = {};
        $scope.userprofile = {};
        $scope.urls = usernav.urls;
        $scope.appname = "";
        console.log("tryna load DomainsCtrl controller" + $scope.urls + " " + $cookies._id	);
        if ($cookies._id !== null && $cookies._id !== undefined) {
            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);

                $scope.userstatus = data;
                $scope.urls = usernav.urls;
                if ($scope.userstatus != "0") {
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace (/"/g,'');
                    $scope.headermessage = "You are logged in as " + $scope.userstatus;
                    $http.get('/domain/'+ $routeParams.domain).success(function (domaindata) {
                    $scope.domain = domaindata;
                    });

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

        $scope.CreateApp = function (appname) {
            console.log("tryna create app " + appname);
            $http.get('/create_app/' + $scope.domain.domain + '/' + appname).success(function (response) {
                console.log("submit response:  " + response);
                if (response == "noauth") {
                    $scope.headermessage = "You must be logged in to do that!"
                } else {
                    $scope.headermessage = response;
                    $route.reload();
                }
            });
        }


    }
    function UsersCtrl($scope, $http, $routeParams, usernav, $cookies, $location) {

        $('#unityPlayer').toggleClass('hidden', true);
        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");
        $scope.user = {};
        $scope.userprofile = {};
        $scope.urls = usernav.urls;

        console.log("tryna load ProfileCtrl controller" + $scope.urls + " " + $cookies._id	);
        if ($cookies._id !== null && $cookies._id !== undefined) {
            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);

                $scope.userstatus = data;
                $scope.urls = usernav.urls;
                if ($scope.userstatus != "0") {
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace (/"/g,'');
                    $scope.headermessage = "You are logged in as " + $scope.userstatus;
                    $http.get('/allusers/').success(function (data) {
                        $scope.users = data;
                    });

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

    function UProfileCtrl($scope, $http, usernav, $cookies ) {

        $('#unityPlayer').toggleClass('hidden', true);

        $.backstretch("http://mvmv.us.s3.amazonaws.com/issUndock.jpg");
        $scope.user = {};
        $scope.userprofile = {};

        $scope.urls = usernav.urls;

        console.log("tryna load ProfileCtrl controller" + $scope.urls + " " + $cookies._id	);
        if ($cookies._id !== null && $cookies._id !== undefined) {
            $http.get('/amirite/' + $cookies._id).success(function (data) {  //check server if this cookie is still valid
                console.log(data);

                $scope.userstatus = data;
                $scope.urls = usernav.urls;
                if ($scope.userstatus != "0") {
                    $scope.user._id = $cookies._id;
                    $scope.user._id = $scope.user._id.replace (/"/g,'');
                    $scope.headermessage = "You are logged in as " + $scope.userstatus;
                    $http.get('/profile/'+ $scope.user._id).success(function (data) {
                        $scope.userprofile = data;
                    });

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