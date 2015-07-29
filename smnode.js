// We need to 'require' the                                                                                                                            
// // following modules                                                                                                                    
 var express = require("express")
// , cors = require('cors')
// , acl = require('acl')
 , http = require("http")
 , path = require("path")
 , fs = require("fs")
 //, passport = require("passport")
 , validator = require('validator')
 , util = require('util')
 , mm = require('musicmetadata')
 , ObjectId = require('mongodb').ObjectID
 , async = require('async')
 , mongo = require('mongodb')
 , bcrypt = require('bcrypt')
 , shortId = require('short-mongo-id')
 , transloadit = require('node-transloadit')
 , transloadClient = new transloadit('d19741da29ba4adb8961e20f87f547f0','e75f79441df3ff89a0de731949f5c5bf8b46c46d')	
 , knox = require('knox')
 , knoxClient = knox.createClient({
			key: '1G198RB42M1G51PMNA02',
			secret: 'dTAWqIuxV8DTs6QpxlO8ZEO+/8gy2yft5pC0dfic',
			bucket: 'servicemedia'}),

app = express();

var whitelist = ['unityapp', 'strr.us.s3.amazonaws.com', 'strr.us', 'elnoise.com', 'philosphersgarden.com', 'mvmv.us', 'servicemedia.net', 'kork.us', 'spacetimerailroad.com'];
var corsOptions = function (origin) {
    console.log("checking vs whitelist:" + origin);
    if ( whitelist.indexOf(origin) !== -1 ) {
        return true;
    } else {
        return false; //fornow...
    }
};

    var allowCrossDomain = function(req, res, next) {

        var origin = req.header.origin;

        if (corsOptions(origin)) {
            res.header('Access-Control-Allow-Origin', origin);

            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization');
            res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, Cookie, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
            //res.header('Access-Control-Allow-Credentials', true);
            // intercept OPTIONS method
        }
        if (req.method === 'OPTIONS') {
            res.send(200);
        }
        else {
            next();
        }
    };

    var oneDay = 86400000;
    // This is our basic configuration
    app.configure(function () {
    app.use(express.static(path.join(__dirname, './'), { maxAge: oneDay }));
//       app.use(cors());
    //        cors stuff
        app.use(allowCrossDomain);   // make sure this is is called before the router
            app.use(function(req, res, next) {
                res.header('Access-Control-Allow-Credentials', true);
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,POST');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
                if ('OPTIONS' == req.method) {
                    res.send(200);
                } else {
                    next();
                }
            });

        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.methodOverride());
        app.use(express.session({
            secret: 'permanententropy',
            path: '/',
            maxAge: 1000,
            httpOnly: false
        }));
        app.use(express.staticCache());
        app.use(app.router);      // not entirely necessary--will be automatically called with the first .get()
        //
    });

       // Create the http server and get it to listen on the specified port 8084                                                                                                                   
  var databaseUrl = "asterion:menatar@linus.mongohq.com:10093/servmed";
  var collections = ["acl", "auth_req", "domains", "apps", "users", "audio_items", "audio_item_keys", "image_items",
      "obj_items", "paths", "keys", "scores", "activity", "purchases", "scenes", "weblinks"];
  var db = require("mongojs").connect(databaseUrl, collections);
//  acl = new acl (new acl.mongodbBackend(db, "acl"));
  var BSON = mongo.BSONPure;
  

  var maxItems = 1000;


  var aws = require('aws-sdk');
  aws.config.loadFromPath('./mgmt/conf.json');
  var ses = new aws.SES({apiVersion : '2010-12-01'});
  var s3 = new aws.S3.Client();
  //var to = ['wemovepets@gmail.com'];
  //var from = 'wemovepets@gmail.com';
  //var bcc = ['polytropoi@gmail.com'];

  var appAuth = "noauth";


//    acl.allow('guest', 'public', 'view');

  http.createServer(app).listen(8092, function(){

	console.log("Express server listening on port 8092");
    });

  function requiredAuthentication(req, res, next) {
    console.log("headers: " + JSON.stringify(req.headers));
    if (req.session.user) {
//        var a_id = new BSON.ObjectID(req.headers.appid.toString().replace(":", ""));
//        db.apps.findOne({_id : a_id }, function (err, app) {
//            if (err || !app) {
//                console.log("no app id!");
////                req.session.error = 'Access denied!';
////                res.send("noappauth");
//                next();
//            } else {
//                console.log("hey, gotsa appID!");
//                next();
//            }
//        });
        next();
    } else  {
        req.session.error = 'Access denied!';
        res.send('noauth');
        }
    }

    function checkAppID(req, res, next) {
        console.log("req.headers: " + JSON.stringify(req.headers));
        if (req.headers.appid) {
            var a_id = new BSON.ObjectID(req.headers.appid.toString().replace(":", ""));
            db.apps.findOne({_id: a_id }, function (err, app) {
                if (err || !app) {
                    console.log("no app id!");
                    req.session.error = 'Access denied!';
                    res.send("noappauth");
//                next();
                } else {
                    console.log("hey, gotsa appID!");
                    next();
                }
            });
        } else {
            console.log("no app id!");
            req.session.error = 'Access denied!';
            res.send("noappauth");
        }
    }



    function amirite (acl_rule, u_id) { //check user id against acl
//        console.log("checking " + JSON.stringify(req.session));
//        if (JSON.stringify(req.session.user._id) == u_id) {
//            console.log("Logged in: " + req.session.user.userName);
            //is there such a rule, and is this user id in it's userIDs array?
//            var u_id = session.user._id;
        console.log("lookin for u_id :" + u_id + " in " + acl_rule);
            db.acl.findOne({$and: [{acl_rule: acl_rule}, {userIDs: {$in: [u_id]}}]}, function (err, rule) {
                if (err || !rule) {
                    //req.session.error = 'Access denied!';
                    //res.send('noauth');
                    console.log("sorry, that's not in the acl");
                    return false;
                } else {
                    console.log("yep, that's in the acl");
//                    next();
                    return true;
                }
            });
//        }
    }

    function admin (req, res, next) { //check user id against acl
        var u_id = req.session.user._id;
//        console.log("lookin for u_id :" + u_id + " in " + acl_rule);
        db.acl.findOne({$and: [{acl_rule: "admin"}, {userIDs: {$in: [u_id]}}]}, function (err, rule) {
            if (err || !rule) {
                req.session.error = 'Access denied!';
                res.send('noauth');
                console.log("sorry, that's not in the acl");
//                return false;
            } else {
                console.log("yep, that's in the acl");
                        next();
//                return true;
            }
        });
    }

    function usercheck (req, res, next) {
        var u_id = req.session.user._id;
        var req_u_id = req.params._id;
//        var scene_id = req.params.scene_id;
        console.log("checkin " + u_id + " vs " + req_u_id);
        if (u_id == req_u_id.toString().replace(":", "")) { //hrm.... dunno why the : needs trimming...
        next();
        } else {
            req.session.error = 'Access denied!';
            res.send('noauth');
        }
    }

    function domainadmin (req, res, next) {
        var u_id = req.session.user._id;
//        var req_u_id = req.params.user_id;
//        var domain = req.params.domain;
//        console.log("checkin " + u_id + " vs " + req_u_id);
//        if (u_id == req_u_id.toString().replace(":", "")) { //hrm.... dunno why the : needs trimming...
        var rule = "domain_admin_" + req.params.domain.toString().replace(":", "");
        console.log("acl rule check " + rule + " vs " + u_id);
                        //either admin or domain admin, admin can do everything
        db.acl.findOne({$or :[{$and: [{acl_rule:rule }, {userIDs: {$in: [u_id]}}]}, {$and: [{acl_rule: "admin"}, {userIDs: {$in: [u_id]}}]}]}, function (err, rule) {
                if (err || !rule) {
                    req.session.error = 'Access denied!';
                    res.send('noauth');
                    console.log("sorry, that's not in the domain_admin acl");
    //                return false;
                } else {
                    console.log("yep, that's in the domain_admin acl");
                    next();
    //                return true;
                }
            });
    //            next();
//        } else {
//            req.session.error = 'Access denied!';
//            res.send('noauth');
//        }
    }

    function uscene (req, res, next) { //check user id against acl, for scene writing
        var u_id = req.session.user._id;
        var req_u_id = req.params.user_id;
        var scene_id = req.params.scene_id.toString().replace(":", "");
        console.log("checkin " + u_id + " vs " + req_u_id + " for " + scene_id);
        if (u_id == req_u_id.toString().replace(":", "")) { //hrm.... dunno why the : needs trimming...
            db.acl.findOne({$and: [{"acl_rule": "write_scene_" + scene_id }, {"userIDs": {$in: [u_id]}}]}, function (err, rule) {
                if (err || !rule) {
                    req.session.error = 'Access denied!';
                    res.send('noauth');
                    console.log("sorry, that's not in the acl");
//                return false;
                } else {
                    console.log("yep, that's in the acl");
                    next();
//                return true;
                }
            });
//            next();
        } else {
            req.session.error = 'Access denied!';
            res.send('noauth');
        }
    }

    function getExtension(filename) {
      	var i = filename.lastIndexOf('.');
       	return (i < 0) ? '' : filename.substr(i);
	}
	
    app.get("/", function (req, res) {
           //send "Hello World" to the client as html
           res.send("Hello World!");
         });

        app.get("/copyall", function (req, res) {

        db.audio_items.find({}, function(err,audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                } else {
			
                	}
        	});
	});

    app.get( "/crossdomain.xml", onCrossDomainHandler )
    function onCrossDomainHandler( req, res ) {
        var xml = '<?xml version="1.0"?>\n<cross-domain-policy>\n';
        xml += '<allow-access-from domain="strr.us" to-ports="*"/>\n';
        xml += '<allow-access-from domain="mvmv.us" to-ports="*"/>\n';
        xml += '<allow-access-from domain="3dcasefiles.com" to-ports="*"/>\n';
        xml += '</cross-domain-policy>\n';

        req.setEncoding('ascii');
        res.writeHead( 200, {'Content-Type': 'text/xml'} );
        res.end( xml );
    };

  app.get("/amirite/:_id", function (req, res) {
    if (req.session.user) {
    console.log(JSON.stringify(req.session.user._id) + " " + req.params._id);
        if (JSON.stringify(req.session.user._id) == req.params._id) {

            console.log("Logged in: " + JSON.stringify(req.session.user));
            var resp = {};
            resp.auth = req.session.user.authLevel;
            resp.userName = req.session.user.userName;
            res.send(resp);


        } else {
           res.send("0");
        }
      } else {
             res.send("0");
      }       
    });

	app.get("/connectionCheck", function (req, res) {
		res.send("connected");
	});


  app.post("/logout", checkAppID, requiredAuthentication, function (req, res) {
        req.session.destroy();
        res.send("logged out");
        //res.redirect("/");
  });

  app.post("/authreq", checkAppID, function (req, res) {
        console.log('authRequest from: ' + req.body.uname);
        var currentDate = Math.floor(new Date().getTime()/1000);
        
        //if (1 == 1) {
        //no facebook login
        if (req.body.fbID != null || req.body.fbID != "noFacebookID" || req.body.fbID.length < 8  ) {

                db.users.findOne(
                { $or: [{userName: req.body.uname}, {email: req.body.umail}] }, //mongo-lian "OR" syntax...
                //password: req.body.upass},
                //{password:0}, 
                function(err, authUser) {
                if( err || !authUser) {
                        console.log("user not found");
                        res.send("user not found");
                        req.session.auth = "noauth";
                } else {
                    console.log("authuser[0] : " + JSON.stringify(authUser))
                        if (authUser !== null && authUser !== undefined && authUser.status == "validated") {

                        var pass = req.body.upass;
                        var hash = authUser.password;
                        console.log("hash = " + authUser.password);
                        bcrypt.compare(pass, hash, function(err, match) {  //check password vs hash
                                if (match) { 
                                req.session.user = authUser;
//                                res.send(req.session.sid);
                                res.cookie('_id', req.session.user._id, { maxAge: 900000, httpOnly: false});
                                res.json(req.session.user._id);
                                // req.session.auth = authUser[0]._id;
                                appAuth = authUser._id;
                                console.log("auth = " + JSON.stringify(req.session.sid));
                                } else {
                                console.log("auth fail");
                                req.session.auth = "noauth";
                                res.send("noauth");
                                }
                            });
                            } else {
                            console.log("user account not validated");
                            res.send("user account not validated");
                            req.session.auth = "noauth";
                            }
                      }
                });
            
            } else { //login with facebook
        console.log("tryna login with facebook ID: " + req.body.fbID);
        db.users.find(
        {facebookID: req.body.fbID},{deviceID:0, email:0, password:0}, function(err, authUser) {

            if (err || ! authUser) {    
                console.log("facebook user not found");
                res.json("error: " + err);
                db.users.save(
                    {type : "facebookUser",
                    userName : req.body.uName,          
                    facebookID : req.body.fbID}, function (err, saved){
                                if ( err || !saved ){
                                console.log("db error, message not saved"); 
                                } else  {
                                console.log("message saved to db");
                        var fbUser_id = saved._id.toString();
                        console.log("facebook userID: " + fbUser_id);
                        req.session.auth = fbUser_id;
                        res.json(fbUser_id);
                        }
                    });
                } else {
                console.log("facebook authenticated: " + authUser[0].userName);
                            res.json(authUser[0]._id);
                            req.session.auth = authUser[0]._id;
                            appAuth = authUser[0]._id;
                            console.log("auth = " + req.session.auth);  
                }
            });
            
            }
            
        });
        


    app.get('/validate/:auth_id', function (req, res) {
                console.log("tryna validate...");
                //var u_id = new BSON.ObjectID(req.params.auth_id); 
                 var timestamp = Math.round(Date.now() / 1000);
                db.users.findOne({ validationHash : req.params.auth_id}, function (err, user) {
                  if (err || !user) {
                          console.log("error getting user: " + err);
                          } else {
                          db.users.update( { _id: user._id }, { $set: { status: 'validated' }});
                          console.log("validated user " + req.params.auth_id);
                          res.send("Thanks " + user.userName + ", your address has been validated! Click <a href=\"http://servicemedia.net/#/login\">here</a> to login.");
                          }
                        });
              });

//    app.get('/profile/makehimlikeuntoagod',  function (req, res) {
//        console.log("req" + req);
//        db.acl.update(
//            { acl_rule: "admin" },
//            { $push: { userIDs: "5150540ab038969c24000008" } }
//        );
//        res.send('done');
//    });
    app.get('/makedomainadmin/:domain/:_id',  checkAppID, requiredAuthentication, admin, function (req, res) {
        console.log(" makedomainadmin req" + req)
        var u_id = new BSON.ObjectID(req.params._id);
        db.users.update(
            { "_id": u_id },
            {$set: { "authLevel" : "domain_admin_" + req.params.domain }}, function (err, done) {
                if (err | !done) {
                    console.log("proobalert");
                    res.send("proobalert");
                } else {
                    db.acl.update(
                        { acl_rule: "domain_admin_" + req.params.domain }, { $push: { 'userIDs': req.params._id }}, {upsert : true},  function (err, saved) {
                            if (err || !saved) {
                                console.log("prooblemo");
                                res.send('prooblemo');
                            } else {
//                                db.acl.update({ 'acl_rule': "domain_admin_" + req.params.domain},{ $push: { 'userIDs': req.params._id } });
                                console.log("ok saved acl");
                            }
                            console.log("gold");
                            res.send('gold');
                        });

                }
            }
        );

    });


    app.get('/createdomain/:domain', checkAppID, requiredAuthentication, admin, function (req, res) {
        db.domains.save({"domain": req.params.domain, "domainStatus": "active", "dateCreated": new Date()}, function (err, domain) {
            if (err | !domain) {
                res.send("no domain for you");
            } else {
                res.json(domain);
            }
        });
    });

    app.get('/create_app/:domain/:appname', checkAppID, requiredAuthentication, domainadmin, function (req, res) {
        db.apps.save({"appname": req.params.appname, "appStatus": "active", "domain": req.params.domain, "dateCreated": new Date()}, function (err, app) {
            if (err | !app) {
                res.send("no app for you");
            } else {
                res.json(app);

            }
        });
    });


    app.get('/domain/:domain', checkAppID, requiredAuthentication, domainadmin, function (req, res) {
        db.domains.findOne({"domain": req.params.domain}, function (err, domain) {
            if (err | !domain) {
                res.send("no domain for you");
            } else {
                db.apps.find({"domain": req.params.domain}, function(err,apps) {
                    if (err || !apps) {
                        console.log("no apps for you!");
                        res.json(domain);
                    } else {
                        domain.apps = apps;
                        res.json(domain);
                    }
                })
            }
        });
    });

    app.get('/domain/:appID', checkAppID, requiredAuthentication, domainadmin, function (req, res) {
        db.apps.find({"app": req.params.appID}, function (err, app) {
            if (err | !users) {
                res.send("no apps");
            } else {
                res.json(app);
            }
        });
    });

    app.get('/allusers/', checkAppID, requiredAuthentication, admin, function (req, res) {
        console.log("tryna get users");
        db.users.find({}, function (err, users) {
            if (err | !users) {
                res.send("wtf! no users!?!?!");
            } else {
                res.json(users);
            }
        });
    });

    app.get('/alldomains/', checkAppID, requiredAuthentication, admin, function (req, res) {
        console.log("tryna get domains");
        db.domains.find({}, function (err, users) {
            if (err | !users) {
                res.send("wtf! no domains!?!?!");
            } else {
                res.json(users);
            }
        });
    });

    app.get('/profile/:_id', checkAppID, requiredAuthentication, usercheck, function (req, res) {

//       if (amirite("admin", req.session.user._id)) { //check the acl

           console.log("tryna profile...");
           var u_id = new BSON.ObjectID(req.params._id);
           db.users.findOne({"_id": u_id}, function (err, user) {
               if (err || !user) {
                   console.log("error getting user: " + err);
               } else {
                   profileResponse = user;
                   profileResponse.activity = {};
                   profileResponse.scores = {};
                   profileResponse.purchases = {};
                   console.log("user profile for " + req.params._id);

                   async.waterfall([
                           function (callback) {
                               db.activity.find({"userID": req.params._id}, function (err, activities) {
                                   if (err || !activities) {
                                       console.log("no activities");
//                                      res.json(profileResponse);
                                       callback();
                                   } else {
                                       console.log("user activitiesw: " + JSON.stringify(activities));
                                       profileResponse.activity = activities;
                                       callback();
                                   }
                               });
                           },
                           function (callback) {
                               db.scores.find({"userID": req.params._id}, function (err, scores) {
                                   if (err || !scores) {
                                       console.log("no scores");
//                                      res.json(profileResponse);
                                       callback();
                                   } else {
                                       console.log("user scores: " + JSON.stringify(scores));
                                       profileResponse.scores = scores;
                                       callback();
                                   }
                               });

                           },
                           function (callback) {
                               db.purchases.find({"userID": req.params._id}, function (err, purchases) {
                                   if (err || !purchases) {
                                       console.log("no purchases");
//                                      res.json(profileResponse);
                                       callback();
                                   } else {
                                       console.log("user purchases: " + JSON.stringify(purchases));
                                       profileResponse.purchases = purchases;
                                       callback();
                                   }
                               });

                           }],
                       function (err, result) { // #last function, close async
                           res.json(profileResponse);
                           console.log("waterfall done: " + result);
                       }
                   );
               }
           });
//       } else {
//           res.send("noauth");
//       }
      });


    app.post('/update_profile/:_id', function (req, res) {
        var u_id = new BSON.ObjectID(req.params.auth_id);
        db.users.findOne({"_id": u_id}, function (err, user) {
            if (err || !user) {
                console.log("error getting user: " + err);

            } else {
                console.log("users authlevel : " + user.authLevel);

                db.users.update({ _id: o_id }, { $set: {
                    authLevel : req.body.authLevel
//                    profilePic : profilePic
                }});
            }
            //}
        });
    });

   app.post('/resetcheck', function (req, res) {
        console.log(req.body.hzch);
        db.users.findOne({"resetHash": req.body.hzch}, function (err, user) {
                if (err || !user) {
                        console.log("error getting user: " + err);
                    } else {
                         var timestamp = Math.round(Date.now() / 1000);
                         if (timestamp < user.resetTimestamp + 3600) { //expires in 1 hour!
                        console.log(user.resetTimestamp);
                        res.send("validlink");
                        } else {
                        console.log("expired link");
                        res.send("invalidlink");
                        }    
                    }
            });
   });

   app.post('/savepw', checkAppID, function (req, res){

                db.users.findOne({"resetHash": req.body.hzch}, function (err, user) {
                if (err || !user) {
                        console.log("error getting user: " + err);
                    } else {
                         var timestamp = Math.round(Date.now() / 1000);
                         if (timestamp < user.resetTimestamp + 3600) { //expires in 1 hour!
                        console.log(req.body.password);
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(req.body.password, salt, function(err, hash) {
                                db.users.update( { _id: user._id }, { $set: { resetHash: "", resetTimestamp: timestamp, password: hash}});
                            res.send("pwsaved");
                            });
                        });
                        } else {
                        console.log("expired link");
                        res.send("expiredlink")
                        }    
                        
                    }
            });
   });

   app.post('/resetpw', checkAppID, function (req, res) {

                console.log('reset request from: ' + req.body.email);
                // ws.send("authorized");
                var subject = "ServiceMedia Password Reset"
                var from = "polytropoi@gmail.com"
                var to = [req.body.email, "polytropoi@gmail.com"];
                var bcc = [];
                //var reset = "";
                var timestamp = Math.round(Date.now() / 1000);
                
                if (validator.isEmail(req.body.email) == true) {

                    db.users.findOne({"email": req.body.email}, function (err, user) {
                         if (err || !user) {
                          console.log("error getting user: " + err);
                          res.send("email address not found");
                          } else {

                            bcrypt.genSalt(3, function(err, salt) { //level3 easy, not a password itself
                            bcrypt.hash(timestamp.toString(), salt, function(err, hash) {
                                // reset = hash;
                                var cleanhash = validator.blacklist(hash, ['/','.','$']); //make it URL safe
                                db.users.update( { _id: user._id }, { $set: { resetHash: cleanhash, resetTimestamp: timestamp}});
                                var htmlbody = "<h3>ServiceMedia Password Reset</h3><hr><br>" +
                            "Click here to reset your password (link expires in 1 hour): </br>" +
                            "http://servicemedia.net/#/resetter/" + cleanhash;

                            ses.sendEmail( { 
                               Source: from, 
                               Destination: { ToAddresses: to, BccAddresses: bcc},
                               Message: {
                                   Subject: {
                                      Data: subject
                                   },
                                   Body: {
                                       Html: {
                                        Data: htmlbody
                                       }
                                    }
                               }
                            }
                            , function(err, data) {
                                if(err) throw err
                                    console.log('Email sent:');
                                    console.log(data);

                                    res.redirect("http://servicemedia.net");
                             });
                          });
                        });
                    }
                    });
                    } else {
                      res.send("invalid email address");
                    }
                });
/*
   app.get('/salt/:auth_id', function (req, res) {
                console.log("tryna salt...")
                var u_id = new BSON.ObjectID(req.params.auth_id); 
                db.users.findOne({"_id": u_id}, function (err, user) {
                  if (err || !user) {
                          console.log("error getting user: " + err);
                          } else {
                          bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash("buster", salt, function(err, hash) {
                                console.log("passhash " + hash);
                                db.users.update({"_id": u_id}, { $set: {password: hash }});
                            // Store hash in your password DB.
                                });
                            });

                          //bcrypt.compare
                        //  console.log("user profile for " + req.params.auth_id);
                        //  res.json(user);
                          }
                        });
              });    

   app.get('/hash/:pw', function (req, res) {
                console.log("tryna salt...")
                var u_id = new BSON.ObjectID(req.params.auth_id); 
                db.users.findOne({"_id": u_id}, function (err, user) {
                  if (err || !user) {
                          console.log("error getting user: " + err);
                          } else {
                          bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(user.password, salt, function(err, hash) {
                                console.log("passhash " + hash);
                            //db.users.update({"_id": u_id}, { $set: {password: hash }});
                            // Store hash in your password DB.
                                });
                            });

                        //  console.log("user profile for " + req.params.auth_id);
                        //  res.json(user);
                          }
                        });
              }); 
*/
    app.post('/newuser', checkAppID, function (req, res) {
//        $scope.user.domain = "servicmedia";
//        $scope.user.appid = "55b2ecf840edea7583000001";

                var appid = req.headers.appid;
                var domain = req.body.domain;
                console.log('newUser request from: ' + req.body.userName);
                // ws.send("authorized");
                if (req.body.userPass.length < 7) {  //weak
                     console.log("bad password");
                        res.send("badpassword");

                } else if (validator.isEmail(req.body.userEmail) == false) {  //check for valid email

                    console.log("bad email");
                        res.send("bad email");

                } else {

                db.users.findOne({userName: req.body.userName}, function(err, existingUserName) { //check if the username already exists
                    
                    if (err || !existingUserName) {  //should combine these queries into an "$or" //but then couldn't respond separately
                        
                        db.users.findOne({email: req.body.userEmail}, function(err, existingUserEmail) { //check if the email already exists

                        if (err || !existingUserEmail || req.body.userEmail == "polytropoi@gmail.com") {
                        
                        console.log('dinna find tha name');

                        var from = "polytropoi@gmail.com";

                        var timestamp = Math.round(Date.now() / 1000);
                        var ip = req.headers['x-forwarded-for'] || 
                                 req.connection.remoteAddress || 
                                 req.socket.remoteAddress ||
                                 req.connection.socket.remoteAddress;

                        bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.userPass, salt, function(err, hash) {
                        var cleanhash = validator.blacklist(hash, ['/','.','$']); //make it URL safe
                        

                        db.users.save(
                            {type : 'webuser',
                            status : 'unvalidated',
                            userName : req.body.userName,          
                            email : req.body.userEmail,
                            createDate : timestamp,
                            validationHash : cleanhash,
                            createIP : ip,
                            odomain : req.body.domain, //original domain
                            oappid : req.headers.appid.toString().replace(":", ""), //original app id
                            password : hash
                            },
                            function (err, newUser){
                                if ( err || !newUser ){
                                console.log("db error, new user not saved", err);
                                res.send("error");
                                } else  {
                                console.log("new user saved to db");
                                var user_id = newUser._id.toString();
                                console.log("userID: " + user_id);
                                req.session.auth = user_id;
                                req.session.user = newUser;
                                res.cookie('_id', user_id, { maxAge: 900000, httpOnly: false});
                                res.send(user_id);
                                    //send validation email
                                    
                                    htmlbody = "Welcome, " + req.body.userName + ".<a href=\"http://servicemedia.net/validate/" + cleanhash + "\"> click here to validate account</a>"
                                    ses.sendEmail({
                                     Source: from, 
                                     Destination: { ToAddresses: [req.body.userEmail, "polytropoi@gmail.com"] },
                                     Message: {
                                         Subject: {
                                            Data: domain + ' New User'
                                         },
                                         Body: {
                                             Html: {
                                              Data: htmlbody
                                               }
                                            }
                                          }
                                        }
                                        , function(err, data) {
                                            if(err) throw err
                                                console.log('Email sent:');
                                                console.log(data);

                                               
                                                //res.redirect("http://elnoise.com/#/login");
                                            });  
                                      }  
                                  });
                                });
                            });
                            } else {
                            console.log("that email already exists or something went wrong");
                            res.send("emailtaken");
                            }
                            });
                            } else {
                        console.log("that name is already taken or something went wrong");
                        res.send("nametaken");
                        }
                    });
                    }
                });


	app.get('/webplayer', function(req,res) {
		res.sendfile(__dirname + '/servicmedia.net/webplayer.html');
		console.log(req.session.auth);
	});
/*
        app.get('/addtypecodesall', function(req, req) {
                
          db.audio_items.find({}, function (err, audio_items) {

                if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                } else {

                        async.waterfall([
                        function(callback){ //randomize the returned array, takes a shake so async it...
                        console.log("get all mongoIDs...");
                        for (var i = 0; i < audio_items.length; i++) {
                        tempID = "";
                        tempID = audio_items[i]._id;
                        console.log(tempID); 
                        db.audio_items.update( { _id: tempID }, { $set: { item_type: "audio" }});     
                        }
                        callback(null);
                        },
                        function(callback){
                                               console.log("second step...");
                        callback(null);
                        }
                        ],

                        function(err, result) {
                        console.log("done");
                                }
                        
                        );              
                        }
                        });
                });

             */
    /*            
	app.get('/addstatuscodesall', function(req, req) {
		
	  db.audio_items.find({}, function (err, audio_items) {

                if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                } else {

                        async.waterfall([
                        function(callback){ //randomize the returned array, takes a shake so async it...
                        console.log("get all mongoIDs...");
                        for (var i = 0; i < audio_items.length; i++) {
                        tempID = "";
                        tempID = audio_items[i]._id;
                        console.log(tempID); 
                        db.audio_items.update( { _id: tempID }, { $set: { userID: "5150540ab038969c24000008", username: "polytropoi" }});     
                        }
                        callback(null);
                        },
	                function(callback){
			                       console.log("second step...");
                        callback(null);
                        }
                        ],

                        function(err, result) {
                        console.log("done");
                                }
                        
                        );              
                        }
                        });
                });
*/
/*
	DISABLED FOR SECURITY
	app.get('/addshortcodesall', function (req, res) {
	
		db.audio_items.find({}, function (err, audio_items) {

		if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                } else {

                        async.waterfall([
                        function(callback){ //randomize the returned array, takes a shake so async it...
                        console.log("get all mongoIDs...");
			for (var i = 0; i < audio_items.length; i++) {
			tempID = "";
                        newShortID = "";
			tempID = audio_items[i]._id;
			newShortID = shortId(tempID);
			console.log(tempID + " = " + newShortID); 
			db.audio_items.update( { _id: tempID }, { $set: { short_id: newShortID }});	
			}
                        callback(null);
                        },
			function(callback){
			console.log("second step...");
			callback(null);
			}
			],

			function(err, result) {
			console.log("done");
				}
			
			);		
			}
			});
		});


	//});


	app.get('removeaudio', function (req, res) {
	    db.audio_items.
	}

app.get('/addtagarraysall', function (req, res) {
    
        db.audio_items.find({}, function (err, audio_items) {

        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                } else {

                        async.waterfall([
                        function(callback){ //randomize the returned array, takes a shake so async it...
                        console.log("get all mongoIDs...");
                for (var i = 0; i < audio_items.length; i++) {
                var tempID = "";
                           
                tempID = audio_items[i]._id;
               // newShortID = shortId(tempID);
                console.log("updating " + tempID); 
                db.audio_items.update( { _id: tempID }, { $set: { tags: ['music', 'korkus'] }}); 
                }
                callback(null);
                            },
                function(callback){
                console.log("second step...");
                callback(null);
                }
                ],

                function(err, result) {
                console.log("done");
                    }
                
                );      
                }
            });
        });
*/
app.get('backupdata', function (req, res) {


});


//db.audio_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
      

app.get('/newaudiodata.json', checkAppID, requiredAuthentication,  function(req, res) {
	console.log('tryna return newaudiodata.json');
        db.audio_items.find({item_status: "public"}).sort({otimestamp: 1}).toArray( function(err,audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                        } else {

                        async.waterfall([

			function(callback){ //randomize the returned array, takes a shake so async it...
                        
			audio_items.splice(0,audio_items.length - maxItems); //truncate randomized array, take only last 20
                        audio_items.reverse();
			callback(null);
                        },
                        function(callback) { //add the signed URLs to the obj array
                        for (var i = 0; i < audio_items.length; i++) {
                        
                        var item_string_filename = JSON.stringify(audio_items[i].filename);
                        item_string_filename = item_string_filename.replace(/\"/g, "");
                        var item_string_filename_ext = getExtension(item_string_filename);
                        var expiration = new Date();
                        expiration.setMinutes(expiration.getMinutes() + 1000);
                        var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                        console.log(baseName);
                        var mp3Name = baseName + '.mp3';
                        var oggName = baseName + '.ogg';
                        var pngName = baseName + '.png';
                       // var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                       // var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                       // var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                        var urlMp3 = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + mp3Name, Expires: 60000});
                        var urlOgg = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + oggName, Expires: 60000});
                        var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + pngName, Expires: 60000});
                        audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                        audio_items[i].URLogg = urlOgg;
                        audio_items[i].URLpng = urlPng;

                        //audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                        //audio_items[i].URLogg = urlOgg;
                        //audio_items[i].URLpng = urlPng;
                            
                        }
                        console.log('tryna send ' + audio_items.length + 'audio_items ');
                        callback(null);
                        }],

                        function(err, result) { // #last function, close async
                        res.json(audio_items);
                        console.log("waterfall done: " + result);
                                        }
                                );
                        }
                });

        });

	app.get('/randomaudiodata.json', checkAppID, requiredAuthentication, function(req, res) {
        console.log('tryna return randomaudiodata.json');
	db.audio_items.find({item_status: "public"}, function(err,audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                        } else {
			
			async.waterfall([

			function(callback){ //randomize the returned array, takes a shake so async it...
			audio_items = Shuffle(audio_items);
			audio_items.splice(0,audio_items.length - maxItems); //truncate randomized array, take only last 20
                        callback(null);
			},

			function(callback) { //add the signed URLs to the obj array
             for (var i = 0; i < audio_items.length; i++) {
			
			         var item_string_filename = JSON.stringify(audio_items[i].filename);
                        item_string_filename = item_string_filename.replace(/\"/g, "");
                        var item_string_filename_ext = getExtension(item_string_filename);
                        var expiration = new Date();
                        expiration.setMinutes(expiration.getMinutes() + 1000);
                        var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                        console.log(baseName);
                        var mp3Name = baseName + '.mp3';
                        var oggName = baseName + '.ogg';
                        var pngName = baseName + '.png';
                        //var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                        //var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                        //var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                        var urlMp3 = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + mp3Name, Expires: 60000});
                        var urlOgg = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + oggName, Expires: 60000});
                        var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + pngName, Expires: 60000});
                        audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                        audio_items[i].URLogg = urlOgg;
                        audio_items[i].URLpng = urlPng;
                        
			}
                	console.log('tryna send ' + audio_items.length + 'audio_items ');
			callback(null);
			}],

		        function(err, result) { // #last function, close async
        		res.json(audio_items);
			console.log("waterfall done: " + result);
        				}
				);	
			}		
                });

	});

    app.get('/playlist/:tag', function(req, res) {
        console.log('tryna return playlist: ' + req.params.tag);
    db.audio_items.find({tags: req.params.tag, item_status: "public"}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                        
                } else {
            
            async.waterfall([

            function(callback){ //randomize the returned array, takes a shake so async it...
            //audio_items = Shuffle(audio_items);
            //audio_items.splice(0,audio_items.length - maxItems); //truncate randomized array, take only last 20
                        callback(null);
            },

            function(callback) { //add the signed URLs to the obj array
             for (var i = 0; i < audio_items.length; i++) {
            
                     var item_string_filename = JSON.stringify(audio_items[i].filename);
                        item_string_filename = item_string_filename.replace(/\"/g, "");
                        var item_string_filename_ext = getExtension(item_string_filename);
                        var expiration = new Date();
                        expiration.setMinutes(expiration.getMinutes() + 1000);
                        var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                        console.log(baseName);
                        var mp3Name = baseName + '.mp3';
                        var oggName = baseName + '.ogg';
                        var pngName = baseName + '.png';
                        //var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                        //var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                        //var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                        var urlMp3 = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[0].userID, Key: audio_items[0]._id + "." + mp3Name, Expires: 60000});
                        var urlOgg = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[0].userID, Key: audio_items[0]._id + "." + oggName, Expires: 60000});
                        var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[0].userID, Key: audio_items[0]._id + "." + pngName, Expires: 60000});
                        audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                        audio_items[i].URLogg = urlOgg;
                        audio_items[i].URLpng = urlPng;
                        
            }
                    console.log('tryna send ' + audio_items.length + 'audio_items ');
            callback(null);
            }],

                function(err, result) { // #last function, close async
                res.json(audio_items);
            console.log("waterfall done: " + result);
                        }
                );  
            }       
                });

    });

    app.get('/audiofiles/:tag', function(req, res) {
        console.log('tryna return playlist: ' + req.params.tag);
        db.audio.find({tags: req.params.tag, item_status: "public"}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
            if (err || !audio_items) {
                console.log("error getting audio items: " + err);

            } else {

                async.waterfall([

                        function(callback){ //randomize the returned array, takes a shake so async it...
                            //audio_items = Shuffle(audio_items);
                            //audio_items.splice(0,audio_items.length - maxItems); //truncate randomized array, take only last 20
                            callback(null);
                        },

                        function(callback) { //add the signed URLs to the obj array
                            for (var i = 0; i < audio_items.length; i++) {

                                var item_string_filename = JSON.stringify(audio_items[i].filename);
                                item_string_filename = item_string_filename.replace(/\"/g, "");
                                var item_string_filename_ext = getExtension(item_string_filename);
                                var expiration = new Date();
                                expiration.setMinutes(expiration.getMinutes() + 1000);
                                var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                                console.log(baseName);
                                var mp3Name = baseName + '.mp3';
                                var oggName = baseName + '.ogg';
                                var pngName = baseName + '.png';
                                var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                                var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                                var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                                audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                                audio_items[i].URLogg = urlOgg;
                                audio_items[i].URLpng = urlPng;

                            }
                            console.log('tryna send ' + audio_items.length + 'audio_items ');
                            callback(null);
                        }],

                    function(err, result) { // #last function, close async
                        res.json(audio_items);
                        console.log("waterfall done: " + result);
                    }
                );
            }
        });

    });
	
    app.get('/audiolist/:tag', function(req, res) {
        console.log('tryna return playlist: ' + req.params.tag);
    db.audio_items.find({tags: req.params.tag, item_status: "public"}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                        
                } else {
            
                res.json(audio_items);
                console.log("returning audio_items tagged " + req.params.tag);
                        }
                });

    });

//    app.get('/useraudio/:u_id', checkAppID, requiredAuthentication, function(req, res) {
//        console.log('tryna return useraudios for: ' + req.params.u_id);
//    db.audio_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
//        if (err || !audio_items) {
//                console.log("error getting audio items: " + err);
//
//                } else {
//
//                res.json(audio_items);
//                console.log("returning audio_items for " + req.params.userName);
//                        }
//                });
//    });

    app.get('/userpics/:u_id', checkAppID, requiredAuthentication, function(req, res) {
        console.log('tryna return userpics for: ' + req.params.u_id);
        db.image_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, picture_items) {

            if (err || !picture_items) {
                console.log("error getting picture items: " + err);

                } else {
//                console.log("# " + picture_items.length);
                   for (var i = 0; i < picture_items.length; i++) {

                    var item_string_filename = JSON.stringify(picture_items[i].filename);
                        item_string_filename = item_string_filename.replace(/\"/g, "");
                    var item_string_filename_ext = getExtension(item_string_filename);
                    var expiration = new Date();
                        expiration.setMinutes(expiration.getMinutes() + 30);
                    var baseName = path.basename(item_string_filename, (item_string_filename_ext));
//                        console.log(baseName + "xxxxxxx");
                    var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                    var halfName = 'half.' + baseName + item_string_filename_ext;
                    var standardName = 'standard.' + baseName + item_string_filename_ext;

                    //var pngName = baseName + '.png';

                    var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                                    //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
                    picture_items[i].URLthumb = urlThumb; //jack in teh signed urls into the object array
                           //console.log("picture item: " + urlThumb, picture_items[0]);

                }

                res.json(picture_items);
                console.log("returning picture_items for " + req.params.u_id);
                        }
                });
    });

    app.get('/useraudio/:u_id', checkAppID, requiredAuthentication, function(req, res) {
        console.log('tryna return userpics for: ' + req.params.u_id);
        db.audio_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {

            if (err || !audio_items) {
                console.log("error getting picture items: " + err);

            } else {
                console.log("# " + audio_items.length);
                for (var i = 0; i < audio_items.length; i++) {

                    var item_string_filename = JSON.stringify(audio_items[i].filename);
                    item_string_filename = item_string_filename.replace(/\"/g, "");
                    var item_string_filename_ext = getExtension(item_string_filename);
                    var expiration = new Date();
                    expiration.setMinutes(expiration.getMinutes() + 30);
                    var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                    //console.log(baseName);
                    var pngName = baseName + '.png';
                    var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + pngName, Expires: 60000});
                    audio_items[i].audioWaveformPng = urlPng;
                    console.log()

                }

                res.json(audio_items);
//                console.log("returning audio_items for " + req.params.u_id);
            }
        });
    });

    app.get('/userobjs/:u_id', checkAppID, requiredAuthentication, function(req, res) {
        console.log('tryna return userobjs for: ' + req.params.u_id);
        db.obj_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, obj_items) {

            if (err || !obj_items) {
                console.log("error getting obj items: " + err);

            } else {
                console.log("# " + obj_items.length);
                for (var i = 0; i < obj_items.length; i++) {

                    var item_string_filename = JSON.stringify(obj_items[i].filename);
                    item_string_filename = item_string_filename.replace(/\"/g, "");
                    var item_string_filename_ext = getExtension(item_string_filename);
                    var expiration = new Date();
                    expiration.setMinutes(expiration.getMinutes() + 30);
                    var baseName = item_string_filename;
//                    var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                    console.log(baseName);
//                    var thumbName = 'thumb.' + baseName + item_string_filename_ext;
//                    var halfName = 'half.' + baseName + item_string_filename_ext;
//                    var standardName = 'standard.' + baseName + item_string_filename_ext;

                    //var pngName = baseName + '.png';

                    var objUrl = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + obj_items[i].userID, Key: obj_items[i]._id + "." + baseName, Expires: 6000}); //just send back thumbnail urls for list
                    //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
                    obj_items[i].objUrl = objUrl; //jack in teh signed urls into the object array
                    //console.log("picture item: " + urlThumb, picture_items[0]);

                }

                res.json(obj_items);
                console.log("returning obj_items for " + req.params.u_id);
            }
        });
    });

    app.get('/userpics', checkAppID, requiredAuthentication, function(req, res) {
        console.log('tryna return userpics for: ' + req.body.userID);
    db.image_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, picture_items) {
        if (err || !picture_items) {
                console.log("error getting picture items: " + err);
                        
                } else {

                   for (var i = 0; i < picture_items.length; i++) {

                var item_string_filename = JSON.stringify(picture_items[i].filename);
                    item_string_filename = item_string_filename.replace(/\"/g, "");
                var item_string_filename_ext = getExtension(item_string_filename);
                var expiration = new Date();
                    expiration.setMinutes(expiration.getMinutes() + 30);
                var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                    console.log(baseName);
                var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                var halfName = 'half.' + baseName + item_string_filename_ext;
                var standardName = 'standard.' + baseName + item_string_filename_ext;
                
                //var pngName = baseName + '.png';
                                
                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                                //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
                picture_items[i].URLthumb = urlThumb; //jack in teh signed urls into the object array
                
                }
            
                res.json(picture_items);
                console.log("returning picture_items for " + req.userID);
                        }
                });
    });

    app.get('/userpic/:p_id', checkAppID, requiredAuthentication, function(req, res) {

        console.log('tryna return userpic : ' + req.params.p_id);
        var pID = req.params.p_id;
        var o_id = new BSON.ObjectID(pID);  
        db.image_items.findOne({"_id": o_id}, function(err, picture_item) {
        if (err || !picture_item) {
                console.log("error getting picture items: " + err);
                        
                } else {

                //   for (var i = 0; i < picture_items.length; i++) {

                var item_string_filename = JSON.stringify(picture_item.filename);
                    item_string_filename = item_string_filename.replace(/\"/g, "");
                var item_string_filename_ext = getExtension(item_string_filename);
                var expiration = new Date();
                    expiration.setMinutes(expiration.getMinutes() + 30);
                var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                    console.log(baseName);
                var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                var halfName = 'half.' + baseName + item_string_filename_ext;
                var standardName = 'standard.' + baseName + item_string_filename_ext;
                
                //var pngName = baseName + '.png';
                                
                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + halfName, Expires: 6000}); //just send back thumbnail urls for list
                var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + standardName, Expires: 6000}); //just send back thumbnail urls for list
                                //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
                picture_item.URLthumb = urlThumb; //jack in teh signed urls into the object array
                picture_item.URLhalf = urlHalf;
                picture_item.URLstandard = urlStandard;
            
                res.json(picture_item);
                console.log("returning picture_item for " + picture_item);
                        }
                });
    });

    app.get('/userobj/:p_id', checkAppID, requiredAuthentication, function(req, res) {

        console.log('tryna return userpic : ' + req.params.p_id);
        var pID = req.params.p_id;
        var o_id = new BSON.ObjectID(pID);
        db.obj_items.findOne({"_id": o_id}, function(err, obj_item) {
            if (err || !obj_item) {
                console.log("error getting picture items: " + err);

            } else {

                //   for (var i = 0; i < picture_items.length; i++) {

                var item_string_filename = JSON.stringify(obj_item.filename);
                item_string_filename = item_string_filename.replace(/\"/g, "");
                var item_string_filename_ext = getExtension(item_string_filename);
                var expiration = new Date();
                expiration.setMinutes(expiration.getMinutes() + 30);
                var baseName = item_string_filename;
                console.log(baseName);

                //TODO screen scrape the obj from a webplayer?
//                var thumbName = 'thumb.' + baseName + item_string_filename_ext;
//                var halfName = 'half.' + baseName + item_string_filename_ext;
//                var standardName = 'standard.' + baseName + item_string_filename_ext;
//
//                //var pngName = baseName + '.png';
//
//                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
//                var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + halfName, Expires: 6000}); //just send back thumbnail urls for list
//                var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + standardName, Expires: 6000}); //just send back thumbnail urls for list
//                //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
//                picture_item.URLthumb = urlThumb; //jack in teh signed urls into the object array
//                picture_item.URLhalf = urlHalf;
//                picture_item.URLstandard = urlStandard;

                res.json(obj_item);
                console.log("returning obj_item for " + obj_item);
            }
        });
    });


    app.get('/useraudio/:username', function(req, res) {
        console.log('tryna return audiolist: ' + req.params.tag);
    db.audio_items.find({username: req.params.username}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                        
                } else {
            
                res.json(audio_items);
//                console.log("returning audio_items for " + req.params.userName);
                        }
                });
    });

	app.get('/audiodata.json', checkAppID, requiredAuthentication, function (req, res) {	
//	app.get("/audiodata.json", auth, function (req, res) {
    	db.audio_items.find({}, function(err,audio_items) {
      	if (err || !audio_items) {
      		console.log("error getting audio items: " + err);
      		//es.end(err);
	} else { //don't add urls for this one...
		//var audioJson = {};
		
	       // var audioJsonString = JSON.stringify(audio_items);
		//for (var i = 0; i < audio_items.length; i++) {
			//	var item_string_filename = JSON.stringify(audio_items[i].filenadf
			//	item_string_filename = item_string_filename.replace(/\"/g, "");
			//	var item_string_filename_ext = getExtension(item_string_filename); 	
			//	var item_string_title = JSON.stringify(audio_items[i].title);
			//	var item_string_artist = JSON.stringify(audio_items[i].artist);
			//	var item_string_album = JSON.stringify(audio_items[i].album);
			//	var item_string_user = JSON.stringify(audio_items[i].username);
			//	var expiration = new Date();
                	//	expiration.setMinutes(expiration.getMinutes() + 300);
				//var extension = path.extname(item_string_filename);
			//	var baseName = path.basename(item_string_filename, (item_string_filename_ext));
			//	console.log(baseName);
			//	var mp3Name = baseName + '.mp3'; 
			//	var oggName = baseName + '.ogg';
                        //      	var pngName = baseName + '.png';
			//	var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                      	//	var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                        //        var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
			//	audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
			//	audio_items[i].URLogg = urlOgg;
			//	audio_items[i].URLpng = urlPng;
		//	}
		
		console.log('tryna send audio_items...');
		res.json(audio_items);
	
			}
		});
	});

	app.get('/item_sc/:sid', function (req, res) {
		
		var shortID = req.params.sid;
		db.audio_items.find({ "short_id" : shortID}, function(err, audio_item) {
		        if (err || !audio_item) {
                                console.log("error getting audio items: " + err);
                        } else {
				var item_string_filename = JSON.stringify(audio_item[0].filename);
                                item_string_filename = item_string_filename.replace(/\"/g, "");
                                var item_string_filename_ext = getExtension(item_string_filename);
                                var expiration = new Date();
                                expiration.setMinutes(expiration.getMinutes() + 3);
                                var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                                console.log(baseName);
                                var mp3Name = baseName + '.mp3';
                                var oggName = baseName + '.ogg';
                                var pngName = baseName + '.png';
                                //var urlMp3 = knoxClient.signedUrl(audio_item[0]._id + "." + mp3Name, expiration);
                                //var urlOgg = knoxClient.signedUrl(audio_item[0]._id + "." + oggName, expiration);
                                //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);

                                var urlMp3 = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_item[0].userID, Key: audio_item[0]._id + "." + mp3Name, Expires: 6000});
                                var urlOgg = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_item[0].userID, Key: audio_item[0]._id + "." + oggName, Expires: 6000});
                                var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_item[0].userID, Key: audio_item[0]._id + "." + pngName, Expires: 6000});
                                audio_item[0].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                                audio_item[0].URLogg = urlOgg;
                                audio_item[0].URLpng = urlPng;
                                res.json(audio_item);
				}
			});
	});


	app.get('/audio/:id', function (req, res){
		var audioID = req.params.id;
		var o_id = new BSON.ObjectID(audioID);  //convert to BSON for searchie
		console.log('audioID requested : ' + audioID); 		
		db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
        		if (err || !audio_item) {
                		console.log("error getting audio items: " + err);
                     	} else {
				var item_string_filename = JSON.stringify(audio_item[0].filename);
                                item_string_filename = item_string_filename.replace(/\"/g, "");
                                var item_string_filename_ext = getExtension(item_string_filename);
				var expiration = new Date();
                                expiration.setMinutes(expiration.getMinutes() + 3);
				var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                                console.log(baseName);
                                var mp3Name = baseName + '.mp3';
                                var oggName = baseName + '.ogg';
                                var pngName = baseName + '.png';
                                //var urlMp3 = knoxClient.signedUrl(audio_item[0]._id + "." + mp3Name, expiration);
                                //var urlOgg = knoxClient.signedUrl(audio_item[0]._id + "." + oggName, expiration);
                                //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
                                var urlMp3 = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_item[0].userID, Key: audio_item[0]._id + "." + mp3Name, Expires: 6000});
                                var urlOgg = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_item[0].userID, Key: audio_item[0]._id + "." + oggName, Expires: 6000});
                                var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_item[0].userID, Key: audio_item[0]._id + "." + pngName, Expires: 6000});
                                audio_item[0].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                                audio_item[0].URLogg = urlOgg;
                                audio_item[0].URLpng = urlPng;
				res.json(audio_item);
			}
		});
	});

    app.post('/gen_short_code', checkAppID, requiredAuthentication, function (req, res) {
        console.log(req.params);
        var audioID = req.params.id;
                var o_id = new BSON.ObjectID(audioID);  //convert to BSON for searchie
                console.log('audioID requested : ' + audioID);
                db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
                        if (err || !audio_item && audio_item.short_id == null) {
                                console.log("error getting audio items: " + err);
                        } else {
            console.log("tryna update " + req.params.id + " to status " + req.params.item_status);
            db.audio_items.update( { _id: o_id }, { $set: { item_status: req.params.item_status }});    
            }
        });
    });

	app.post('/update/:_id', checkAppID, requiredAuthentication, function (req, res) {
		console.log(req.params._id);
		
            var o_id = new BSON.ObjectID(req.params._id);  //convert to BSON for searchie
            console.log('audioID requested : ' + req.body._id);
            db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
                    if (err || !audio_item) {
                    console.log("error getting audio items: " + err);
                    } else {
			console.log("tryna update " + req.body._id + " to status " + req.body.item_status);
			db.audio_items.update( { _id: o_id }, { $set: { item_status: req.body.item_status,
                                                            tags: req.body.tags,
                                                            alt_title: req.body.alt_title,
                                                            alt_artist: req.body.alt_artist,
                                                            alt_album: req.body.alt_album        
                                                                                             }});   	
			}
		});
	});

    app.get('/itemkeys/:_id', function (req, res) { //return keys for specific item id

            console.log(req.params._id);
            var o_id = new BSON.ObjectID(req.params._id); 
            db.audio_item_keys.find({ "keyAudioItemID" : req.params._id}, function(err, itemKeys) {
            if (err || !itemKeys) {
                console.log("cain't get no itemKeys... " + err);    
            } else {

                for (var i = 0; i < itemKeys.length; i++) {

                if (itemKeys[i].keyType == 2) {
                var item_string_filename = JSON.stringify(itemKeys[i].filename);
                    item_string_filename = item_string_filename.replace(/\"/g, "");
                var item_string_filename_ext = getExtension(item_string_filename);
                var expiration = new Date();
                    expiration.setMinutes(expiration.getMinutes() + 30);
                var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                    console.log(baseName);
                var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                var halfName = 'half.' + baseName + item_string_filename_ext;
                var standardName = 'standard.' + baseName + item_string_filename_ext;
                
                //var pngName = baseName + '.png';
                                
               // var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'elnoise1.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                                //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
               // itemKeys[i].URLthumb = urlThumb; 
               //jack in teh signed urls into the object array
                                
                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + itemKeys[i].userID, Key: itemKeys[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + itemKeys[i].userID, Key: itemKeys[i]._id + "." + halfName, Expires: 6000}); //just send back thumbnail urls for list
                var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + itemKeys[i].userID, Key: itemKeys[i]._id + "." + standardName, Expires: 6000}); //just send back thumbnail urls for list
                               
                itemKeys[i].URLthumb = urlThumb; //jack in teh signed urls into the object array
                itemKeys[i].URLhalf = urlHalf;
                itemKeys[i].URLstandard = urlStandard;  

                    }
                }
                console.log(JSON.stringify(itemKeys));
                res.json(itemKeys);
            }
            });
    });

  

//	app.post('/useritemkeys', function (req, res) {  //return the keys saved by this user, req. happens after login
//		var uID = req.body.userID;
//		console.log("tryna get itemkeys for userID: " + uID);
//		//var u_id = new BSON.ObjectID(uID);
//		db.audio_item_keys.find({ "keyUserID" : uID}, function(err, itemKeys) {
//			if (err || !itemKeys) {
//				console.log("cain't get no itemKeys... " + err);
//			} else {
//				console.log(JSON.stringify(itemKeys));
//				res.json(itemKeys);
//			}
//		});
//	});
//
//  app.post('/itemkeys', function (req, res) {  //return the keys saved by this user, req. happens after login
//    var uID = req.body.audioItemID;
//    console.log("tryna get itemkeys for audioItemID: " + uID);
//    //var u_id = new BSON.ObjectID(uID);
//    db.audio_item_keys.find({ "keyAudioItemID" : uID}, function(err, itemKeys) {
//      if (err || !itemKeys) {
//        console.log("cain't get no itemKeys... " + err);
//      } else {
//        console.log(JSON.stringify(itemKeys));
//        res.json(itemKeys);
//      }
//    });
//  });
//
//  app.post('/itemkeyspublic', function (req, res) {  //return the keys saved by this user, req. happens after login
//    var uID = req.body.userID;
//    console.log("tryna get itemkeys for userID: " + uID);
//    //var u_id = new BSON.ObjectID(uID);
//    db.audio_item_keys.find({ "keyUserID" : uID}, function(err, itemKeys) {
//      if (err || !itemKeys) {
//        console.log("cain't get no itemKeys... " + err);
//      } else {
//        console.log(JSON.stringify(itemKeys));
//        res.json(itemKeys);
//      }
//    });
//  });

	app.post('/savedaudioitems', function (req, res) { //return audio items, referenced by keys in above method (when saved playlist selected)
		console.log("tryna savekeys");
        if (req.session.auth != "noauth") {
		console.log(req.body);
                var jObj = JSON.parse(req.body.json);
		//console.log(jObj[0]);
		var audioIDs = new Array();
		jObj.audioItemIDs.forEach(function(item, index) {
			var a_id = new BSON.ObjectID(item); //convert to binary to search by _id beloiw
			audioIDs.push(a_id); //populate array that can be fed to mongo find below
			});
		console.log("first audioID: " + audioIDs[0]);
		
		//db.audio_items.find({_id: { $in: audioIDs[0] } }, function(err,audio_items) {
		db.audio_items.find({_id: { $in: audioIDs } }, function(err,audio_items) {
        	if (err || !audio_items) {
                	console.log("error getting audio items: " + err);
                        	} else {
			console.log(JSON.stringify(audio_items));
			//res.json(audio_items);
			async.waterfall([

                        function(callback){ //randomize the returned array, takes a shake so async it...
                        audio_items = Shuffle(audio_items);
                        audio_items.splice(0,audio_items.length - maxItems); //truncate randomized array, take only last 20
                        callback(null);
                        },

                        function(callback) { //add the signed URLs to the obj array
                        for (var i = 0; i < audio_items.length; i++) {
                        var item_string_filename = JSON.stringify(audio_items[i].filename);
                        item_string_filename = item_string_filename.replace(/\"/g, "");
                        var item_string_filename_ext = getExtension(item_string_filename);
                        var expiration = new Date();
                        expiration.setMinutes(expiration.getMinutes() + 1000);
                        var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                        console.log(baseName);
                        var mp3Name = baseName + '.mp3';
                        var oggName = baseName + '.ogg';
                        var pngName = baseName + '.png';
                        var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                        var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                        var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                        audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                        audio_items[i].URLogg = urlOgg;
                        audio_items[i].URLpng = urlPng;
                        }
                        console.log('tryna send ' + audio_items.length + 'audio_items ');
                        callback(null);
                        }],

                        function(err, result) { // #last function, close async
                        res.json(audio_items);
                        console.log("waterfall done: " + result);
                                        }
                                );
  
			}
		});
		}
	});


	app.post('/savekeysall', checkAppID, requiredAuthentication, function (req, res) { //save item keys set oon client
	
	console.log("tryna savekeys");
	if (req.session.auth != "noauth") {
		//console.log(req.session.auth);
		console.log(req.body);
		//var jObj = JSON.parse(req.body.json);
		//var itemKeys =  JSON.parse(keysJson.itemKeys);
		console.log("itemKeys: " + JSON.stringify(jObj.itemKeys));
		//var saveKeysFunction = 
		//res.json(JSON.stringify(jObj));
	// for (var i = 0; i < itemKeys.length; i++) {
   //  	jObj.itemKeys.forEach(function(item, index) {
			console.log(JSON.stringify(item.keyString));	
//		});
//	/*
//		var saveKeyFunction = function (itemKey, callback) {

		db.audio_item_keys.save(
                	req.body.json,	
                	function (err, saved) {
                	if (err || !saved) {
               	 	} else {
                	var key_id = saved._id.toString();
                	console.log('new key id: ' + key_id);
  //              	callback();
                  res.send(key_id)
	           			}
               	});
	
			}
		/*
		async.forEach(Object.keys(jObj),saveKeyFunction,function(err){
			console.log("async #");
		}, function(err) {console.log("DONE SAVING KEYS");});
		*/	
	});
	
app.post('/savekeys', checkAppID, requiredAuthentication, function (req, res) { //save item keys set oon client
  
  console.log("tryna savekeys");
  if (req.session.auth != "noauth") {
    //console.log(req.session.auth);
    console.log(req.body);
    var jObj = JSON.parse(req.body.json);
    console.log("itemKeys: " + JSON.stringify(jObj.itemKeys));

      jObj.itemKeys.forEach(function(item, index) {
      console.log(JSON.stringify(item.keyString));  

    db.audio_item_keys.save(
                  {keyType : item.keyType,
                  keyUserID : item.keyUserID,
                  keyAudioItemID : item.keyAudioItemID,
      keyContentID : item.keyContentID,
                  keyTime : item.keyTime,
      keySample : item.keySample,
      keyString : item.keyString},  
                  function (err, saved) {
                  if (err || !saved) {
                  } else {
                  var key_id = saved._id.toString();
                  console.log('new key id: ' + key_id);
  //                callback();
                  res.send(key_id)
        }
                  });
      });
      }
 
  });

	app.post('/savekey', checkAppID, requiredAuthentication, function (req, res) {

	//if (req.session.auth != "noauth") { //maybe check if uid is valid? 
    var jObj = JSON.parse(req.body.json);

        db.audio_item_keys.save(
                  {keyType : jObj.keyType,
                  keyUserID : jObj.keyUserID,
                  keyAudioItemID : jObj.keyAudioItemID,
                  keyContentID : jObj.keyContentID,
                  keyTime : jObj.keyTime,
                  keySample : jObj.keySample,
                  keyString : jObj.keyString},  
              function (err, saved) {
                  if (err || !saved) {
                  } else {
                  var key_id = saved._id.toString();
                  console.log('new key id: ' + key_id);
  //                callback();
                  res.send(key_id)
                   }
              });
  });
/*
	db.audio_item_keys.save(
		{user_id : "1",
		audio_item_id : req.body.audio_item_id,
		key_time : req.body.key_time,
		key_string : req.body.key_string},
		function (err, saved) {
		if (err || !saved) {
		} else {
		var key_id = saved._id.toString();
		console.log('new key id: ' + key_id);
		}		
		});
	*/

  app.post('/delete_key', checkAppID, requiredAuthentication, function (req, res) {
      console.log("tryna delete key: " + req.body.keyID);
      var o_id = new BSON.ObjectID(req.body.keyID);
      db.audio_item_keys.remove( { "_id" : o_id }, 1 );
                                      res.send("deleted");

  });

    app.post('/update_key', checkAppID, requiredAuthentication, function (req, res) {
      console.log("tryna delete key: " + req.body.keyID);
      var o_id = new BSON.ObjectID(req.body.keyID);
      //db.audio_item_keys.remove( { "_id" : o_id }, 1 );
        //                              res.send("deleted");

      db.audio_item_keys.update( { _id: o_id }, { $set: { keyString: req.body.keyText,
                                                            keySample: parseInt(req.body.keySample),
                                                            keyTime: parseFloat(req.body.keyTime)
                                                          }
                                                }, function (err, rezponse){
                                                if (err || !rezponse) {
                                                console.log("error updating item key: " + err);
                                                res.send(err);
                                                } else {
                                                console.log("item key updated: " + req.body.keyID);
                                                res.send("item key updated");
                                                  }
                                                });                                     
  
  });
///////////////
app.get('/pathinfo',  checkAppID, requiredAuthentication, function (req, res) { //get default path info

    console.log(req.params._id);
    var o_id = new BSON.ObjectID(req.params._id);
    db.paths.find({}, function(err, paths) {
        if (err || !paths) {
            console.log("cain't get no paths... " + err);
        } else {
            console.log(JSON.stringify(paths));
            res.json(paths);
        }
    });
});

app.get('/upaths/:_id',  checkAppID, requiredAuthentication, function (req, res) { //get default path info

    console.log("tryna get userpaths: ",req.params._id);
    var o_id = new BSON.ObjectID(req.params._id);
    db.paths.find({ "user_id" : req.params._id}, function(err, paths) {
        if (err || !paths) {
            console.log("cain't get no paths... " + err);
        } else {
            console.log(JSON.stringify(paths));
            res.json(paths);
        }
    });
});

app.get('/upath/:u_id/:p_id',  checkAppID, requiredAuthentication, function (req, res) { //get default path info

    console.log("tryna get path: ", req.params.p_id);
    var _id = new BSON.ObjectID(req.params.p_id);
    db.paths.find({ _id : _id}, function(err, paths) {
        if (err || !paths) {
            console.log("cain't get no paths... " + err);
        } else {
            console.log(JSON.stringify(paths));
            res.send(paths);
        }
    });
});

app.post('/score', checkAppID, requiredAuthentication, function (req, res) {
console.log("tryna post scores");

    db.scores.save(req.body, function (err, saved) {
        if ( err || !saved ) {
            console.log('score not saved..');
            res.send("nilch");
        } else {
            var item_id = saved._id.toString();
            console.log('new score id: ' + item_id);
            res.send(item_id);
        }
    });
});
app.get('/scores/:u_id',  checkAppID, requiredAuthentication, function (req, res) {

    console.log("tryna get scores for: ", req.params.u_id);
    //var _id = new BSON.ObjectID(req.params.u_id);
    var appid = req.headers.appid.toString().replace(":", "");
    db.scores.find({$and : [{userID : req.params.u_id}, {appID : appid}]}, function(err, scores) {
        if (err || !scores) {
            console.log("cain't get no scores... " + err);
        } else {
//            console.log(JSON.stringify(scores));
            var scoresResponse = {};

            scoresResponse.scores = scores;
            res.json(scoresResponse);
        }
    });
});

app.post('/purchase', checkAppID, requiredAuthentication, function (req, res) {
    console.log("tryna post purchase");
    db.purchases.save(req.body, function (err, saved) {
        if ( err || !saved ) {
            console.log('purchase not saved..');
            res.send("nilch");
        } else {
            var item_id = saved._id.toString();
            console.log('new score id: ' + item_id);
            res.send(item_id);
        }
    });
});

app.get('/purchases/:u_id',  checkAppID, requiredAuthentication, function (req, res) {

    console.log("tryna get purchases for: ", req.params.u_id);
    //var _id = new BSON.ObjectID(req.params.u_id);
    var appid = req.headers.appid.toString().replace(":", "");
    db.purchases.find({$and : [{userID : req.params.u_id}, {appID : appid}]}, function(err, purchases) {
        if (err || !purchases) {
            console.log("cain't get no scores... " + err);
            res.send(err);
        } else {
//            console.log(JSON.stringify(scores));
            var purchasesResponse = {};
            purchasesResponse.purchases = purchases;
            res.json(purchasesResponse);
        }
    });
});

app.post('/activity', checkAppID, requiredAuthentication, function (req, res) {
    console.log("tryna post scores");
    db.activity.save(req.body, function (err, saved) {
        if ( err || !saved ) {
            console.log('score not saved..');
            res.send("nilch");
        } else {
            var item_id = saved._id.toString();
            console.log('new score id: ' + item_id);
            res.send(item_id);
        }
    });
});

app.get('/activities/:u_id',  checkAppID, requiredAuthentication, function (req, res) {

    console.log("tryna get activities for: ", req.params.u_id);
    //var _id = new BSON.ObjectID(req.params.u_id);
    var appid = req.headers.appid.toString().replace(":", "");
    db.activity.find({$and : [{userID : req.params.u_id}, {appID : appid}]}, function(err, activities) {
        if (err || !activities) {
            console.log("cain't get no activities... " + err);
            res.send(err);
        } else {
            console.log(JSON.stringify(activities));
            var activitiesResponse = {};
            activitiesResponse.activities = activities;
            res.json(activitiesResponse);
        }
    });
});

app.post('/newpath', checkAppID, requiredAuthentication, function (req, res) {

      db.paths.save(req.body, function (err, saved) {
          if ( err || !saved ) {
              console.log('path not saved..');
              res.send("nilch");
          } else {
              var item_id = saved._id.toString();
              console.log('new path id: ' + item_id);
              res.send(item_id);

          }
      });

  });

    app.post('/update_path/:_id', checkAppID, requiredAuthentication, function (req, res) {
        console.log(req.params._id);

        var o_id = new BSON.ObjectID(req.body._id);  //convert to BSON for searchie
        console.log('path requested : ' + req.body._id);
        db.paths.find({ "_id" : o_id}, function(err, path) {
            if (err || !path) {
                console.log("error getting path items: " + err);
            } else {
                console.log("tryna update path " + req.body._id);
                db.paths.update( { "_id": o_id }, { $set: {

                    pathUserID : req.body.user_id,
                    pathNumber : req.body.pathNumber,
                      pathTitle : req.body.pathTitle,
                    pathMeaning : req.body.pathMeaning,
                    pathAttribution : req.body.pathAttribution,
                    pathColor1 : req.body.pathColor1,
                    pathColor2 : req.body.pathColor2,

                    pathMapPictureID : req.body.pathMapPictureID,
                      pathPictureID : req.body.pathPictureID,
                      pathArcanumNumber : req.body.pathArcanumNumber,
                      pathArcanumTitle : req.body.pathArcanumTitle,
                      pathArcanumPictureID : req.body.pathArcanumPictureID,
                      pathTriggerAudioID : req.body.pathTriggerAudioID,
                    pathSpokenAudioID : req.body.pathSpokenAudioID,
                    pathBackgroundAudioID : req.body.pathBackgroundAudioID,
                    pathEnvironmentAudioID : req.body.pathEnvironmentAudioID,
                      pathKeynote : req.body.pathKeynote,
                      pathDescription : req.body.pathDescription,
                      pathText : req.body.pathText}
                });
            } if (err) {res.send(error)} else {res.send("updated " + new Date())}
        });
    });

///////////////
app.get('/sceneinfo',  checkAppID, requiredAuthentication, function (req, res) { //get default scene info

    console.log(req.params._id);
    var o_id = new BSON.ObjectID(req.params._id);
    db.scenes.find({}, function(err, scenes) {
        if (err || !scenes) {
            console.log("cain't get no paths... " + err);
        } else {
            console.log(JSON.stringify(scenes));
            res.json(scenes);
        }
    });
});

app.get('/uscenes/:_id',  checkAppID, requiredAuthentication, usercheck, function (req, res) { //get scenes for this user

    console.log("tryna get user scenes: ",req.params._id);
    var o_id = new BSON.ObjectID(req.params._id);
    var scenesResponse = {};

    db.scenes.find({ "user_id" : req.params._id}, { sceneTitle: 1, short_id: 1, sceneLastUpdate: 1 },  function(err, scenes) {
        if (err || !scenes) {
            console.log("cain't get no scenes... " + err);
            res.send("noscenes");
        } else { //should externalize

//            async.each(scenes,
//                // 2nd param is the function that each item is passed to
//                function (scene, callbackz) {
//                 db.acl.save(
//                        { acl_rule: "read_scene_" + scene._id },  function (err, saved) {
//                            if (err || !saved) {
//                            } else {
//                                db.acl.update({ 'acl_rule': "read_scene_" + scene._id},{ $push: { 'userIDs': req.params._id } });
//                                console.log("ok saved acl");
//                            }
//                        });
//                 db.acl.save(
//                            { 'acl_rule': "write_scene_" + scene._id }, function (err, saved) {
//                                if (err || !saved) {
//                                } else {
//                                    db.acl.update({ 'acl_rule': "write_scene_" + scene._id },{ $push: { 'userIDs': req.params._id } });
//                                    console.log("ok saved acl");
//                                }
//                            });
//                    var sceneTmp = {};

//                    for(var key in scene) {
////                        var value = objects[key];
//                        if (key != "sceneTitle" && key != "scene_id") {
//                            delete key;
//                        }
//
//                    }
//                    callbackz();
//
//            }, function(err) {
//                // if any of the file processing produced an error, err would equal that error
//                if (err) {
//                    // One of the iterations produced an error.
//                    // All processing will now stop.
//                    console.log('A file failed to process');
////                        callback(null, postcards);
//                } else {
//                    console.log('All files have been processed successfully');
//
//                }
//            });

            console.log(JSON.stringify(scenes));
            res.json(scenes);
        }
    });
});

app.get('/uscene/:user_id/:scene_id',  checkAppID, requiredAuthentication, uscene, function (req, res) { //view for updating scene for this user


    console.log("tryna get scene " + req.params.scene_id);
    var sceneID = req.params.scene_id.toString().replace(":", "");
    var o_id = new ObjectId.createFromHexString(sceneID);

    console.log("tryna get scene: " + sceneID);
    db.scenes.findOne({ _id : o_id}, function(err, scene) {
        if (err || !scene) {
            console.log("cain't get no scene... " + err);
        } else {
//            console.log(JSON.stringify(scenes));

            if (scene.sceneWebLinks != null && scene.sceneWebLinks.length > 0) {
                for (var i = 0; i < scene.sceneWebLinks.length; i++) { //refresh themz
                    console.log("sceneWebLink id: " + scene.sceneWebLinks[i].link_id);
                    var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: scene.sceneWebLinks[i].link_id + ".thumb.jpg", Expires: 6000});
                    var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: scene.sceneWebLinks[i].link_id + ".half.jpg", Expires: 6000});
                    var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: scene.sceneWebLinks[i].link_id + ".standard.jpg", Expires: 6000});
                    scene.sceneWebLinks[i].urlThumb = urlThumb;
                    scene.sceneWebLinks[i].urlHalf = urlHalf;
                    scene.sceneWebLinks[i].urlStandard = urlStandard;

                }



            }

            if (scene.scenePostcards != null && scene.scenePostcards.length > 0) {
                var postcards = [];
//                            for (var i = 0; i < sceneResponse.scenePostcards.length; i++) { //refresh themz
                async.each (scene.scenePostcards, function (postcardID, callbackz) {
//                                console.log("scenepostcard id: " + sceneResponse.scenePostcards[i]);
//                    console.log("scenepostcard id: " + postcardID);
                    var oo_id = new BSON.ObjectID(postcardID);
                    db.image_items.findOne({"_id": oo_id}, function (err, picture_item) {
                        if (err || !picture_item) {
                            console.log("error getting picture items: " + err);
//                                        callback(err);
//                                        callback(null);
                            callbackz();
                        } else {
                            var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
                                Key: picture_item._id + ".thumb." + picture_item.filename, Expires: 6000});
                            var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
                                Key: picture_item._id + ".half." + picture_item.filename, Expires: 6000});

                            var postcard = {};
                            postcard.userID = picture_item.userID;
                            postcard._id = picture_item._id;
                            postcard.sceneID = scene._id;
                            postcard.sceneShortID = scene.short_id;
                            postcard.urlThumb = urlThumb;
                            postcard.urlHalf = urlHalf;
                            postcards.push(postcard);
//                            console.log("pushing postcard: " + JSON.stringify(postcard));
                            callbackz();
                        }

                    });

                }, function(err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('A file failed to process');
//                        callback(null, postcards);
                    } else {
                        console.log('All files have been processed successfully');
//                        callback(null, postcards);
//                                        };
                        scene.postcards = postcards;
                        res.send(scene);
                    }
                });
//                scene.postcards = [];
//
//                for (var i = 0; i < scene.scenePostcards.length; i++) { //refresh themz
//                    console.log("scenepostcard id: " + scene.scenePostcards[i]);
//                    var oo_id = new BSON.ObjectID(scene.scenePostcards[i]);
//                    db.image_items.findOne({"_id": oo_id}, function (err, picture_item) {
//                        if (err || !picture_item) {
//                            console.log("error getting picture items: " + err);
//                        } else {
//                            var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
//                                Key: picture_item._id + ".thumb." + picture_item.filename, Expires: 6000});
//                            var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
//                                Key: picture_item._id + ".half." + picture_item.filename, Expires: 6000});
//
//                            var postcard = {};
//                            postcard.userID = picture_item.userID;
//                            postcard._id = picture_item._id;
//                            postcard.sceneID = picture_item.postcardForScene;
//                            postcard.urlThumb = urlThumb;
//                            postcard.urlHalf = urlHalf;
//
//                            scene.postcards.push(postcard);
//                            console.log("pushing postcard: " + JSON.stringify(postcard));
//                        }
//                    });
//                }
//            console.log(JSON.stringify(scene));

            } else {
                res.send(scene);
            }
        }
    });
});

app.get('/availablescenes/:_id', checkAppID, requiredAuthentication, function (req, res) {



//    if (amirite(req.body.userID)) {


//        if (req.body.userID == req.cookie._id) { //cheap session check...
//            console.log("private scenes for userID " + req.params._id);
        var availableScenesResponse = {};
        var availableScenes = [];
        availableScenesResponse.availableScenes = availableScenes;

                        //mongolian "OR" syntax...
        db.scenes.find( {$or: [{ "user_id": req.params._id}, { sceneShareWithPublic: true }]}, function (err, scenes) {
            if (err || !scenes) {
                console.log("cain't get no scenes... " + err)

            } else {
//                console.log("gotsome scenes: " + scenes);
                async.each(scenes,
                    // 2nd param is the function that each item is passed to
                    function (scene, callback) {
//                        console.log(JSON.stringify(scene));
                        // Call an asynchronous function, often a save() to DB
//            scene.someAsyncCall(function () {
                        // Async call is done, alert via callback
                        if (scene.scenePostcards != null && scene.scenePostcards.length > 0) {
//                        db.image_items.find({postcardForScene: scene.short_id}).sort({otimestamp: -1}).limit(maxItems).toArray(function (err, picture_items) {
                            var oo_id = new BSON.ObjectID(scene.scenePostcards[0]); //TODO randomize? or ensure latest?  or use assigned default?
                            db.image_items.findOne({"_id": oo_id}, function (err, picture_item) {

                                if (err || !picture_item || picture_item.length == 0) {
                                    console.log("error getting picture items: " + err);

                                } else {
//                                console.log("# " + picture_items.length);
//                                    for (var i = 0; i < 1; i++) {

                                        var item_string_filename = JSON.stringify(picture_item.filename);
                                        item_string_filename = item_string_filename.replace(/\"/g, "");
                                        var item_string_filename_ext = getExtension(item_string_filename);
                                        var expiration = new Date();
                                        expiration.setMinutes(expiration.getMinutes() + 30);
                                        var baseName = path.basename(item_string_filename, (item_string_filename_ext));
//                                    console.log(baseName);
                                        var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                                        var halfName = 'half.' + baseName + item_string_filename_ext;
                                        var standardName = 'standard.' + baseName + item_string_filename_ext;

//                            var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                                        var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + halfName, Expires: 6000}); //just send back thumbnail urls for list
                                        var availableScene = {
                                            sceneTitle: scene.sceneTitle,
                                            sceneKey: scene.short_id,
                                            sceneStatus: scene.sceneShareWithPublic ? "public" : "private",
                                            sceneOwner: scene.userName,
                                            scenePostcardHalf: urlHalf
                                        };
                                    availableScenesResponse.availableScenes.push(availableScene);
                                    }
//                        console.log("publicScene: " + publicScene);

//                        console.log("publicScenesResponse :" + JSON.stringify(publicScenesResponse));
//                            publicScenes.push(publicScene);
//                                }

                                callback();
                            });
                        } else {

                        callback();
                        }
                    },
                    // 3rd param is the function to call when everything's done
                    function (err) {
                        // All tasks are done now
//            doSomethingOnceAllAreDone();
                console.log("availableScenesResponse :" + JSON.stringify(availableScenesResponse));
                        res.send(availableScenesResponse);
                    }
                );
            }

        });
//    } else {
//        res.send("noauth");
//
//    }
//    }
});


app.get('/publicscenes', function (req, res) { //deprecated, see available scenes above...
    var availableScenesResponse = {};
    var availableScenes = [];
    availableScenesResponse.availableScenes = availableScenes;


    db.scenes.find({ sceneShareWithPublic: true }, function (err, scenes) {
    if (err || !scenes) {
        console.log("cain't get no scenes... " + err)

    } else {
        async.each(scenes,
            // 2nd param is the function that each item is passed to
            function (scene, callback) {
                // Call an asynchronous function, often a save() to DB
    //            scene.someAsyncCall(function () {
                // Async call is done, alert via callback
                if (scene.scenePostcards != null && scene.scenePostcards.length > 0) {
//                        db.image_items.find({postcardForScene: scene.short_id}).sort({otimestamp: -1}).limit(maxItems).toArray(function (err, picture_items) {
                    var oo_id = new BSON.ObjectID(scene.scenePostcards[0]); //TODO randomize? or ensure latest?  or use assigned default?
                    db.image_items.findOne({"_id": oo_id}, function (err, picture_item) {

                        if (err || !picture_item || picture_item.length == 0) {
                            console.log("error getting picture items: " + err);

                        } else {
//                                console.log("# " + picture_items.length);
//                                    for (var i = 0; i < 1; i++) {

                            var item_string_filename = JSON.stringify(picture_item.filename);
                            item_string_filename = item_string_filename.replace(/\"/g, "");
                            var item_string_filename_ext = getExtension(item_string_filename);
                            var expiration = new Date();
                            expiration.setMinutes(expiration.getMinutes() + 30);
                            var baseName = path.basename(item_string_filename, (item_string_filename_ext));
//                                    console.log(baseName);
                            var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                            var halfName = 'half.' + baseName + item_string_filename_ext;
                            var standardName = 'standard.' + baseName + item_string_filename_ext;

//                            var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                            var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + halfName, Expires: 6000}); //just send back thumbnail urls for list
                            var availableScene = {
                                sceneTitle: scene.sceneTitle,
                                sceneKey: scene.short_id,
                                sceneStatus: scene.sceneShareWithPublic ? "public" : "private",
                                sceneOwner: scene.userName,
                                scenePostcardHalf: urlHalf
                            };

                        }
//                        console.log("publicScene: " + publicScene);
                        availableScenesResponse.availableScenes.push(availableScene);
//                        console.log("publicScenesResponse :" + JSON.stringify(publicScenesResponse));
//                            publicScenes.push(publicScene);
//                                }

                        callback();
                    });
                } else {

                    callback();
                }
            },
            // 3rd param is the function to call when everything's done
            function (err) {
                // All tasks are done now
//            doSomethingOnceAllAreDone();
//                console.log("publicScenesResponse :" + JSON.stringify(publicScenesResponse));
                res.send(availableScenesResponse);
            }
        );
    }

    });
});


//    async.waterfall([
//
//    function (callback) {
//        db.scenes.find({ sceneShareWithPublic: true}, function (err, scenes) {
//                if (err || !scenes) {
//                    console.log("cain't get no scenes... " + err)
////                    callback(null);
//                } else {
//                console.log("gots scenes: " + scenes.length);
//                    callback(null, scenes);
//                }
//
//            });
//
//    },
//
//    function (scenes, callback) {
//                //            console.log(JSON.stringify(scenes));
//                //            res.json(scenes);
//
//        scenes.forEach(function (scene) {
//
//                    console.log("getting pics for " + scene.short_id);
//                    //                db.image_items.find({postcardForScene: scene.short_id}, function (err, images) {
//                    db.image_items.find({postcardForScene: scene.short_id}).sort({otimestamp: -1}).limit(maxItems).toArray(function (err, picture_items) {
//
//                        if (err || !picture_items || picture_items.length == 0) {
//                            console.log("error getting picture items: " + err);
//
//                        } else {
//                            console.log("# " + picture_items.length);
//                            for (var i = 0; i < 1; i++) {
//
//                                var item_string_filename = JSON.stringify(picture_items[i].filename);
//                                item_string_filename = item_string_filename.replace(/\"/g, "");
//                                var item_string_filename_ext = getExtension(item_string_filename);
//                                var expiration = new Date();
//                                expiration.setMinutes(expiration.getMinutes() + 30);
//                                var baseName = path.basename(item_string_filename, (item_string_filename_ext));
//                                console.log(baseName);
//                                var thumbName = 'thumb.' + baseName + item_string_filename_ext;
//                                var halfName = 'half.' + baseName + item_string_filename_ext;
//                                var standardName = 'standard.' + baseName + item_string_filename_ext;
//
//                                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
//                                var publicScene = {
//                                    sceneOwner: scene.userName,
//                                    sceneKey: scene.short_id,
//                                    sceneThumb: urlThumb
//                                };
//
//                            }
//                        console.log("publicScene: " + publicScene);
//                            publicScenesResponse.publicScenes.push(publicScene);
//                        console.log("publicScenesResponse :" + JSON.stringify(publicScenesResponse));
//                        }
//
//                    });
//                callback(null, publicScenesResponse);
//                });
//
//
//            }
////    }
////
////        });
//////        res.send(JSON.stringify(publicScenesResponse));
////
////
////        console.log("public scene: " + JSON.stringify(publicScenesResponse));
////
////        },
////            function(pscenes, callback) {  //gen a short code and insert //not for picss
////
////                callback(null,pscenes);
////            }
//
//
//        ], //end async flow
//
//        function(err, result) { // #last function, close async
//            console.log("waterfall done: " + JSON.stringify(result));
//            //  res.redirect('/upload.html');
//            res.json(result);
//        }
//    );

//});

    app.post('/newscene', checkAppID, requiredAuthentication, function (req, res) {

        var newScene = req.body;
//        newScene.sceneOwner_id = req.session.user._id;
//        newScene.sceneOwnerName = req.session.user.username;
    db.scenes.save(req.body, function (err, saved) {
        if ( err || !saved ) {
            console.log('scene not saved..');
            res.send("nilch");
        } else {
            var item_id = saved._id.toString();
            console.log('new scene id: ' + item_id);
            tempID = "";
            newShortID = "";
            tempID = item_id;
            newShortID = shortId(tempID);
            var o_id = new BSON.ObjectID(tempID);
            console.log(tempID + " = " + newShortID);
            db.scenes.update( { _id: o_id }, { $set: { short_id: newShortID }});

            db.acl.save(
                    { acl_rule: "read_scene_" + saved._id },  function (err, acl) {
                        if (err || !acl) {
                        } else {
                            db.acl.update({ 'acl_rule': "read_scene_" + saved._id},{ $push: { 'userIDs': req.session.user._id } });
                            console.log("ok saved acl");
                        }
                    });
            db.acl.save(
                        { 'acl_rule': "write_scene_" + saved._id }, function (err, acl) {
                            if (err || !acl) {
                            } else {
                                db.acl.update({ 'acl_rule': "write_scene_" + saved._id },{ $push: { 'userIDs': req.session.user._id } });
                                console.log("ok saved acl");
                            }
                        });


            res.send(item_id);

            }
        });

    });

    app.post('/delete_scene/:_id', checkAppID, requiredAuthentication, function (req, res) {
        console.log("tryna delete key: " + req.body._id);
        var o_id = new BSON.ObjectID(req.body._id);
        db.scenes.remove( { "_id" : o_id }, 1 );
        res.send("deleted");

    });


    app.post('/weblink/', checkAppID, requiredAuthentication, function (req, res) {

        console.log("req.header: " + req.headers);
        console.log("checkin weblink: " + req.body.link_url);
        var lurl = "";
        lurl = req.body.link_url;
        db.weblinks.find({ link_url : lurl}, function(err, links) {
            if (err) {
                console.log("error getting link items: " + err);
            } else if (!links || links.Length == 0 || links[0] == undefined || links[0] == "") {
                console.log("no link items found");
                db.weblinks.save(req.body, function (err, savedlink) {
                    if (err || !savedlink) {
                        console.log('link not saved..');
                        res.send("nilch");
                    } else {

                        var weblinkParams = {
                                'steps': {
                                    'extract': {
                                        'robot': '/html/convert',
                                        'url' : req.body.link_url
                                    }
                                },
                                'template_id': '3129d73016dc11e5bc305b7a5c3e7a99',
                                'fields' : { 'link_id' : savedlink._id,
                                            'user_id' : req.session.user._id
                                }
                            };

                            transloadClient.send(weblinkParams, function(ok) {
                                console.log('Success: ' + JSON.stringify(ok));
                                if (ok != null && ok != undefined) {
                                    var dateNow = Date.now();
                                    db.weblinks.update({"_id": savedlink._id}, { $set: {"render_date": dateNow}});
                                }
                            }, function(err) {
                                console.log('Error: ' + JSON.stringify(err));
//                                res.send(err);
                            });
                        }
                    var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: savedlink._id + ".thumb.jpg", Expires: 6000});
                    var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: savedlink._id + ".half.jpg", Expires: 6000});
                    var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: savedlink._id + ".standard.jpg", Expires: 6000});
                    savedlink.urlThumb = urlThumb;
                    savedlink.urlHalf = urlHalf;
                    savedlink.urlStandard = urlStandard;
                    res.send(savedlink);
                });
            } else {
                var weblinkParams = {
                    'steps': {
                        'extract': {
                            'robot': '/html/convert',
                            'url' : req.body.link_url
                        }
                    },
                    'template_id': '3129d73016dc11e5bc305b7a5c3e7a99',
                    'fields' : { 'link_id' : links[0]._id,
                        'user_id' : req.session.user._id
                    }
                };

                transloadClient.send(weblinkParams, function(ok) {
                    console.log('Success: ' + JSON.stringify(ok));
                    if (ok != null && ok != undefined) {
                        var dateNow = Date.now();
                        db.weblinks.update({"_id": links[0]._id}, { $set: {"render_date": dateNow}});
                    }
                }, function(err) {
                    console.log('Error: ' + JSON.stringify(err));
                });
                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: links[0]._id + ".thumb.jpg", Expires: 6000});
                var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: links[0]._id + ".half.jpg", Expires: 6000});
                var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: links[0]._id + ".standard.jpg", Expires: 6000});
                links[0].urlThumb = urlThumb;
                links[0].urlHalf = urlHalf;
                links[0].urlStandard = urlStandard;
                res.send(links[0]);
            }
        });
    });

    //app.get('/weblink')
    app.post('/update_scene/:_id', checkAppID, requiredAuthentication, function (req, res) {

        console.log("req.header: " + JSON.stringify(req.headers));
        console.log(req.params._id);
        var lastUpdateTimestamp = new Date();
        var o_id = new BSON.ObjectID(req.body._id);  //convert to BSON for searchie
        console.log('path requested : ' + req.body._id);
        db.scenes.find({ "_id" : o_id}, function(err, scene) {
            if (err || !scene) {
                console.log("error getting path items: " + err);
            } else {

                console.log("tryna update path " + req.body._id);

                db.scenes.update( { "_id": o_id }, { $set: {
                    sceneDomain : req.body.sceneDomain,
//                    sceneUserName : scene.sceneUserName != null ? scene.sceneUserName : "",
                    sceneNumber : req.body.sceneNumber,
                    sceneTitle : req.body.sceneTitle,
                    sceneShareWithPublic : req.body.sceneShareWithPublic != null ? req.body.sceneShareWithPublic : false,
                    sceneShareWithUsers : req.body.sceneShareWithUsers != null ? req.body.sceneShareWithUsers : "",
                    sceneEnvironment : req.body.sceneEnvironment != null ? req.body.sceneEnvironment : {},
                    sceneRandomizeColors : req.body.sceneRandomizeColors != null ? req.body.sceneRandomizeColors : false,
                    sceneTweakColors : req.body.sceneTweakColors != null ? req.body.sceneTweakColors : false,
                    sceneColorizeSky : req.body.sceneColorizeSky != null ? req.body.sceneColorizeSky : false,
                    sceneScatterMeshes : req.body.sceneScatterMeshes != null ? req.body.sceneScatterMeshes : false,
                    sceneScatterMeshLayers : req.body.sceneScatterMeshLayers != null ? req.body.sceneScatterMeshLayers : {},
                    sceneScatterObjectLayers : req.body.sceneScatterObjectLayers != null ? req.body.sceneScatterObjectLayers : {},
                    sceneScatterObjects : req.body.sceneScatterObjects != null ? req.body.sceneScatterObjects : false,
                    sceneShowViewportMeshes : req.body.sceneShowViewportMeshes != null ? req.body.sceneShowViewportMeshes : false,
                    sceneShowViewportObjects : req.body.sceneShowViewportObjects != null ? req.body.sceneShowViewportObjects : false,
                    sceneViewportMeshLayers : req.body.sceneViewportMeshLayers != null ? req.body.sceneViewportMeshLayers : {},
                    sceneViewportObjectLayers : req.body.sceneViewportObjectLayers != null ? req.body.sceneViewportObjectLayers : {},
                    sceneUseTargetObject : req.body.sceneUseTargetObject != null ? req.body.sceneUseTargetObject : false,
                    sceneTargetObjectHeading : req.body.sceneTargetObjectHeading != null ? req.body.sceneTargetObjectHeading : 0,
                    sceneTargetObject : req.body.sceneTargetObject,
                    sceneTargetEvent : req.body.sceneTargetEvent,
                    sceneTargetText : req.body.sceneTargetText  != null ? req.body.sceneTargetText : "",
                    sceneNextScene : req.body.sceneNextScene != null ? req.body.sceneNextScene : "",
                    scenePreviousScene : req.body.scenePreviousScene,
                    sceneUseDynamicSky : req.body.sceneUseDynamicSky != null ? req.body.sceneUseDynamicSky : false,
                    sceneUseCameraBackground : req.body.sceneUseCameraBackground != null ? req.body.sceneUseCameraBackground : false,
                    sceneCameraOrientToPath : req.body.sceneCameraOrientToPath  != null ? req.body.sceneCameraOrientToPath : false,
                    sceneCameraPath : req.body.sceneCameraPath != null ? req.body.sceneCameraPath : "Random",
                    sceneUseSkybox : req.body.sceneUseSkybox != null ? req.body.sceneUseSkybox : false,
                    sceneSkybox : req.body.sceneSkybox,
                    sceneUseGlobalFog : req.body.sceneUseGlobalFog != null ? req.body.sceneUseGlobalFog : false,
                    sceneRenderFloorPlane : req.body.sceneRenderFloorPlane != null ? req.body.sceneRenderFloorPlane : false,
                    sceneUseFloorPlane : req.body.sceneUseFloorPlane != null ? req.body.sceneUseFloorPlane : false,
                    sceneUseEnvironment : req.body.sceneUseEnvironment != null ? req.body.sceneUseEnvironment : false,
                    sceneUseTerrain : req.body.sceneUseTerrain != null ? req.body.sceneUseTerrain : false,
                    sceneUseHeightmap : req.body.sceneUseHeightmap != null ? req.body.sceneUseHeightmap : false,
                    sceneHeightmap : req.body.sceneHeightmap,
                    sceneRestrictToLocation : req.body.sceneRestrictToLocation != null ? req.body.sceneRestrictToLocation : false,
                    sceneLocationRange : req.body.sceneLocationRange,
                    sceneLatitude : req.body.sceneLatitude != null ? req.body.sceneLatitude : "",
                    sceneLongitude : req.body.sceneLongitude != null ? req.body.sceneLongitude : "",
                    sceneUseSimpleWater : req.body.sceneUseSimpleWater != null ? req.body.sceneUseSimpleWater : false,
                    sceneUseOcean : req.body.sceneUseOcean != null ? req.body.sceneUseOcean : false,
                    sceneUseFancyWater : req.body.sceneUseFancyWater != null ? req.body.sceneUseFancyWater : false,
                    sceneTime: req.body.sceneTime,
                    sceneTimescale: req.body.sceneTimescale,
                    sceneWeather: req.body.sceneWeather,
                    sceneSeason: req.body.sceneSeason,
                    scenePictures : req.body.scenePictures, //array of IDs only
                    sceneWebLinks : req.body.sceneWebLinks, //custom object
                    sceneColor1 : req.body.sceneColor1,
                    sceneColor2 : req.body.sceneColor2,
                    sceneUseStreetMap : req.body.sceneUseStreetMap  != null ? req.body.sceneUseStreetMap : false,
                    sceneUseSatelliteMap : req.body.sceneUseSatelliteMap  != null ? req.body.sceneUseSatelliteMap : false,
                    sceneUseHybridMap : req.body.sceneUseHybridMap  != null ? req.body.sceneUseHybridMap : false,
                    sceneEmulateGPS : req.body.sceneEmulateGPS  != null ? req.body.sceneEmulateGPS : false,
                    sceneTriggerAudioID : req.body.sceneTriggerAudioID,
//                    sceneAudioID : req.body.sceneAudioID,
                    sceneAmbientAudioID : req.body.sceneAmbientAudioID,
                    scenePrimaryAudioID : req.body.scenePrimaryAudioID,
                    sceneLoopPrimaryAudio : req.body.sceneLoopPrimaryAudio != null ? req.body.sceneLoopPrimaryAudio : false,
                    sceneAutoplayPrimaryAudio : req.body.sceneAutoplayPrimaryAudio != null ? req.body.sceneAutoplayPrimaryAudio : false,
                    scenePrimaryAudioTriggerEvents : req.body.scenePrimaryAudioTriggerEvents != null ? req.body.scenePrimaryAudioTriggerEvents : false,
//                    sceneAmbientAudio2ID : req.body.sceneAmbientAudio2ID,
                    sceneKeynote : req.body.sceneKeynote,
                    sceneDescription : req.body.sceneDescription,
                    sceneText : req.body.sceneText,
                    sceneTextLoop : req.body.sceneTextLoop != null ? req.body.sceneTextLoop : false,
                    sceneTextAudioSync : req.body.sceneTextAudioSync != null ? req.body.sceneTextAudioSync : false,
                    sceneLastUpdate : lastUpdateTimestamp

//                    sceneTextOptions : req.body.sceneTextOptions
                    }
                });
            } if (err) {res.send(err)} else {res.send("updated " + new Date())}
        });
    });

    app.get('/sceneloc/:key', function (req, res){

        resObj = {};

        db.scenes.find({ "short_id" : req.params.key}, function(err, scenes) {
            if (err || !scenes) {
                console.log("cain't get no scenes... " + err);
            } else {
                resObj.sceneLatitude = scenes[0].sceneLatitude;
                resObj.sceneLongitude = scenes[0].sceneLongitude;
                resObj.sceneLocationRange = scenes[0].sceneLocationRange;
//                console.log(JSON.stringify(scenes));
                res.json(resObj);
            }
        });

    });

    app.get('/seq/:_seqID', function (req, res) {
        console.log("tryna get sequence");
        var pathNumbers = [];
        var pathSequence = [];
        db.paths.find({}, function (err, paths) {
            if (err || !paths) {
                console.log("no paths found ", err);
            } else {
                paths.forEach(function (path) {

                    pathNumbers.push(parseInt(path.pathNumber));
                    pathNumbers.sort(function(a, b){return a-b});
                });
                paths.forEach(function (path) {
                    for (var i = 0; i < pathNumbers.length; i++) {
                        if (pathNumbers[i] = path.pathNumber) {
                            pathSequence.push(path._id);
                            break;
                        }
                    }
                });
            }

         //   pathSequence.sort(function(a, b){return a-b});
            console.log("pathSequence", pathSequence);
            res.json(pathSequence);
        });



    });

    //return a short code that will be unique for the spec'd type (scene, pic, audio)
    app.get('/newshortcode/:type', checkAppID, requiredAuthentication, function (req, res) {


    });

    //check uniqueness and websafeness (can be used as path) of title for the spec'd type, return bool
    app.get('/checktitle/:type', checkAppID, requiredAuthentication, function (req, res) {


    });
//
//    app.get('/updatesceneusernames', checkAppID, requiredAuthentication, function (req, res) {
//
//
//        db.scenes.find({ }, function (err, scenes) {
//            if (err || !scenes) {
//                console.log("cain't get no scenes... " + err)
//
//            } else {
//                async.each(scenes,
//                    // 2nd param is the function that each item is passed to
//                    function (scene, callback) {
//
//
//                            var oo_id = new BSON.ObjectID(scene.user_id); //TODO randomize? or ensure latest?  or use assigned default?
//                            db.users.findOne({"_id": oo_id}, function (err, user) {
//
//                                  db.scenes.update()
//
////                                if (err || !picture_item || picture_item.length == 0) {
////                                    console.log("error getting picture items: " + err);
////
////                                } else {
////
////                                    var item_string_filename = JSON.stringify(picture_item.filename);
////                                    item_string_filename = item_string_filename.replace(/\"/g, "");
////                                    var item_string_filename_ext = getExtension(item_string_filename);
////                                    var expiration = new Date();
////                                    expiration.setMinutes(expiration.getMinutes() + 30);
////                                    var baseName = path.basename(item_string_filename, (item_string_filename_ext));
//////                                    console.log(baseName);
////                                    var thumbName = 'thumb.' + baseName + item_string_filename_ext;
////                                    var halfName = 'half.' + baseName + item_string_filename_ext;
////                                    var standardName = 'standard.' + baseName + item_string_filename_ext;
////
//////                            var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
////                                    var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID, Key: picture_item._id + "." + halfName, Expires: 6000}); //just send back thumbnail urls for list
////                                    var availableScene = {
////                                        sceneTitle: scene.sceneTitle,
////                                        sceneKey: scene.short_id,
////                                        sceneStatus: scene.sceneShareWithPublic ? "public" : "private",
////                                        sceneOwner: scene.userName,
////                                        scenePostcardHalf: urlHalf
//                                    });
//
////                                }
////                        console.log("publicScene: " + publicScene);
////                                availableScenesResponse.availableScenes.push(availableScene);
////                        console.log("publicScenesResponse :" + JSON.stringify(publicScenesResponse));
////                            publicScenes.push(publicScene);
////                                }
//
//                                callback();
//                            });
////                        } else {
////
////                            callback();
////
////                        }
////                    });
//    });

    app.get('/scene/:_id', function (req, res) { //TODO lock down w/ checkAppID, requiredAuthentication

        console.log("tryna get scene id: ", req.params._id);
        var audioResponse = {};
        var pictureResponse = {};
        var postcardResponse = {};
        var sceneResponse = {};
        var requestedPictureItems = [];
        var requestedAudioItems = [];
     sceneResponse.audio = [];
     sceneResponse.pictures = [];
     sceneResponse.postcards = [];

        async.waterfall([

                    function (callback) {
//                        var o_id = new BSON.ObjectID(req.params._id);
                        db.scenes.find({$or: [{ sceneTitle: req.params._id },
                                                { short_id : req.params._id }]},
                                                function (err, sceneData) { //fetch the path info by title TODO: urlsafe string

                                if (err || !sceneData || !sceneData.length) {
                                console.log("error getting scene data by title: " + err);
                                callback(err);
                            } else { //make arrays of the pics and audio items
//                                console.log("scene by title: ", sceneData);
                                sceneData[0].scenePictures.forEach(function (picture){
                                    var p_id = new BSON.ObjectID(picture); //convert to binary to search by _id beloiw
                                    requestedPictureItems.push(p_id); //populate array
                                });

                                requestedAudioItems = [ BSON.ObjectID(sceneData[0].sceneTriggerAudioID), BSON.ObjectID(sceneData[0].sceneAmbientAudioID), BSON.ObjectID(sceneData[0].scenePrimaryAudioID)];

                                sceneResponse = sceneData[0];
                                callback(null);
                            }

                        });

                    },
//
//                    function (nScenes, callback) { //try shortcode
//                        console.log("tryn get scene data with shortcode");
//                        if (!nScenes || !nScenes.length) {
//                        var shortID = req.params._id;
//                        db.scenes.find({ "short_id" : shortID}, function(err, sceneData) {
//                            if (err || !sceneData || !sceneData.length || sceneData == undefined) {
//                                console.log("error getting scenedata by shortcode: " + err);
//                                callback("", err);
//                            } else {
////                                console.log("scene by shortcode: ", sceneData);
//                                sceneData[0].scenePictures.forEach(function (picture) {
//                                    var p_id = new BSON.ObjectID(picture); //convert to binary to search by _id beloiw
//                                    requestedPictureItems.push(p_id); //populate array
//                                });
//
//                                requestedAudioItems = [ BSON.ObjectID(sceneData[0].sceneTriggerAudioID), BSON.ObjectID(sceneData[0].sceneAmbientAudioID), BSON.ObjectID(sceneData[0].scenePrimaryAudioID)];
//                                sceneResponse = sceneData[0];
//                                callback(null, sceneData);
//                            }
//                        });
//                        } else {
//                            //sceneResponse = nScenes[0];
////                                pathResponse.audio = [];
////                                pathResponse.pictures = [];
//                            callback(null, nScenes);
//
//                        }
//                    },
//
//                    function (nScenes, callback) { //if it didn't find it above, try the mongoID
//                        if (!nScenes || !nScenes.length) {
//
//                            //var o_id = new BSON.ObjectID(req.params._id);
//                            console.log("tryna get by mongo: " + req.params._id);
//
//                            if (Buffer.byteLength(req.params._id) == 24 || Buffer.byteLength(req.params._id) == 12) {
//                               // var o_id = new BSON.ObjectID(req.params._id);
//                                db.scenes.find({ _id: ObjectId(req.params._id) }, function (err, sceneData) { //fetch the path info
//                                    if (err || !sceneData || !sceneData.length) {
//                                        console.log("error getting scene items: " + err);
//                                        callback(err);
//                                    } else {
//                                        console.log("scene by ID: " + sceneData);
//                                        sceneData[0].scenePictures.forEach(function (picture){
//                                            var p_id = new BSON.ObjectID(picture); //convert to binary to search by _id beloiw
//                                            requestedPictureItems.push(p_id); //populate array
//                                        });
//
//                                        requestedAudioItems = [ BSON.ObjectID(sceneData[0].sceneTriggerAudioID), BSON.ObjectID(sceneData[0].sceneAmbientAudioID), BSON.ObjectID(sceneData[0].scenePrimaryAudioID)];
//                                        sceneResponse = sceneData[0];
//                                        callback(null);
//                                    }
//
//                                });
//                            } else {
//                                callback("bad input");
//                            }
//                        } else {
//                            //sceneResponse = nScenes[0];
////                                pathResponse.audio = [];
////                                pathResponse.pictures = [];
//                            callback(null);
//
//                        }
//                    },


                    function (callback) { //update link pic URLs //TODO check for freshness, and rescrape if needed
                        if (sceneResponse.sceneWebLinks != null && sceneResponse.sceneWebLinks.length > 0) {
                            for (var i = 0; i < sceneResponse.sceneWebLinks.length; i++) {
//                                console.log("sceneWebLink id: " + sceneResponse.sceneWebLinks[i].link_id);
                                var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: sceneResponse.sceneWebLinks[i].link_id + ".thumb.jpg", Expires: 6000});
                                var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: sceneResponse.sceneWebLinks[i].link_id + ".half.jpg", Expires: 6000});
                                var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.web', Key: sceneResponse.sceneWebLinks[i].link_id + ".standard.jpg", Expires: 6000});
                                sceneResponse.sceneWebLinks[i].urlThumb = urlThumb;
                                sceneResponse.sceneWebLinks[i].urlHalf = urlHalf;
                                sceneResponse.sceneWebLinks[i].urlStandard = urlStandard;

                            }
                        }
                        callback(null);
                    },

                    function (callback) { //fethc audio items

                        db.audio_items.find({_id: {$in: requestedAudioItems }}, function (err, audio_items)
                        {
                            if (err || !audio_items) {
                                console.log("error getting audio items: " + err);
                                callback(null);
                            } else {

                                callback(null, audio_items) //send them along
                            }
                        });
                    },

                    function(audio_items, callback) { //add the signed URLs to the obj array
                        for (var i = 0; i < audio_items.length; i++) {
                        //    console.log("audio_item: ", audio_items[i]);
                            var item_string_filename = JSON.stringify(audio_items[i].filename);
                            item_string_filename = item_string_filename.replace(/\"/g, "");
                            var item_string_filename_ext = getExtension(item_string_filename);
                            var expiration = new Date();
                            expiration.setMinutes(expiration.getMinutes() + 1000);
                            var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                            //console.log(baseName);
                            var mp3Name = baseName + '.mp3';
                            var oggName = baseName + '.ogg';
                            var pngName = baseName + '.png';
//                            var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
//                            var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
//                            var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                            var urlMp3 = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + mp3Name, Expires: 60000});
                            var urlOgg = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + oggName, Expires: 60000});
                            var urlPng = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + audio_items[i].userID, Key: audio_items[i]._id + "." + pngName, Expires: 60000});
//                            audio_items.URLmp3 = urlMp3; //jack in teh signed urls into the object array
                            audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                            audio_items[i].URLogg = urlOgg;
                            audio_items[i].URLpng = urlPng;
                            if (audio_items[i].tags.length < 1) {audio_items[i].tags = [""]}


                            //pathResponse.audio.push(urlMp3, urlOgg, urlPng);

                        }

                     //   console.log('tryna send ' + audio_items);
                        audioResponse = audio_items;
                        sceneResponse.audio = audioResponse;
//                        console.log("audio", audioResponse);
                        callback(null, audio_items);
                    },



                    function(audioStuff, callback) { //return the pic items
                     //   console.log("audioStuff ", audioStuff);
                        db.image_items.find({_id: {$in: requestedPictureItems }}, function (err, pic_items)
                        {
                            if (err || !pic_items) {
                              //  console.log("error getting picture items: " + err);
                                callback(null);
                            } else {
                                callback(null, pic_items)
                            }
                        });
//                        callback(null);
                    },

                    function (picture_items, callback) {
                        for (var i = 0; i < picture_items.length; i++) {
                        //    console.log("picture_item: ", picture_items[i]);
                            var item_string_filename = JSON.stringify(picture_items[i].filename);
                            item_string_filename = item_string_filename.replace(/\"/g, "");
                            var item_string_filename_ext = getExtension(item_string_filename);
                            var expiration = new Date();
                            expiration.setMinutes(expiration.getMinutes() + 1000);
                            var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                            //console.log(baseName);
                            var thumbName = 'thumb.' + baseName + item_string_filename_ext;
                            var quarterName = 'quarter.' + baseName + item_string_filename_ext;
                            var halfName = 'half.' + baseName + item_string_filename_ext;
                            var standardName = 'standard.' + baseName + item_string_filename_ext;

                            var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + thumbName, Expires: 6000}); //just send back thumbnail urls for list
                            var urlQuarter = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + quarterName, Expires: 6000});
                            var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + halfName, Expires: 6000});
                            var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_items[i].userID, Key: picture_items[i]._id + "." + standardName, Expires: 6000});
                            //var urlPng = knoxClient.signedUrl(audio_item[0]._id + "." + pngName, expiration);
                            picture_items[i].urlThumb = urlThumb; //jack in teh signed urls into the object array
                            picture_items[i].urlQuarter = urlQuarter; //jack in teh signed urls into the object array
                            picture_items[i].urlHalf = urlHalf; //jack in teh signed urls into the object array
                            picture_items[i].urlStandard = urlStandard; //jack in teh signed urls into the object array
                            if (picture_items[i].hasAlphaChannel == null) {picture_items[i].hasAlphaChannel = false}
                            //pathResponse.path.pictures.push(urlThumb, urlQuarter, urlHalf, urlStandard);
                            if (picture_items[i].tags.length < 1) {picture_items.tags = [""]}
                        }

//                        console.log('tryna send ' + pictr);
                        pictureResponse = picture_items ;
//                        console.log("pictures: ", pictureResponse)
//                        pathResponse.pictures = picture_items;
                        callback(null);

                    },
                    function (callback) {
                        var postcards = [];
                        if (sceneResponse.scenePostcards != null && sceneResponse.scenePostcards.length > 0) {
//                            sceneResponse.postcards = [];

//                            for (var i = 0; i < sceneResponse.scenePostcards.length; i++) { //refresh themz
                                async.each (sceneResponse.scenePostcards, function (postcardID, callbackz) { //nested async-ery!
//                                console.log("scenepostcard id: " + sceneResponse.scenePostcards[i]);
//                                    console.log("scenepostcard id: " + postcardID);
                                var oo_id = new BSON.ObjectID(postcardID);
                                db.image_items.findOne({"_id": oo_id}, function (err, picture_item) {
                                    if (err || !picture_item) {
                                        console.log("error getting picture items: " + err);
//                                        callback(err);
//                                        callback(null);
                                        callbackz();
                                    } else {
                                        var urlThumb = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
                                            Key: picture_item._id + ".thumb." + picture_item.filename, Expires: 6000});
                                        var urlHalf = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
                                            Key: picture_item._id + ".half." + picture_item.filename, Expires: 6000});
                                        var urlStandard = s3.getSignedUrl('getObject', {Bucket: 'servicemedia.' + picture_item.userID,
                                            Key: picture_item._id + ".standard." + picture_item.filename, Expires: 6000});

                                        var postcard = {};
                                        postcard.userID = picture_item.userID;
                                        postcard._id = picture_item._id;
                                        postcard.sceneID = picture_item.postcardForScene;
                                        postcard.urlThumb = urlThumb;
                                        postcard.urlHalf = urlHalf;
                                        postcard.urlStandard = urlStandard;
                                        postcards.push(postcard);
//                                        console.log("pushing postcard: " + JSON.stringify(postcard));
                                        callbackz();
                                    }

                                });

                            }, function(err) {
                                    // if any of the file processing produced an error, err would equal that error
                                    if (err) {
                                        // One of the iterations produced an error.
                                        // All processing will now stop.
                                        console.log('A file failed to process');
                                        callback(null, postcards);
                                    } else {
                                        console.log('All files have been processed successfully');
                                        callback(null, postcards);
//                                        };
                                    }
                                });

//                        postcardResponse = postcards;

                        } else {
//                      callback(null);
                            callback(null, postcards);
                        }
                    },



                    function (postcardResponse, callback) {
//                        console.log("postcardResponse : " + postcardResponse);
                        sceneResponse.audio = audioResponse;
                        sceneResponse.pictures = pictureResponse;
                        sceneResponse.postcards = postcardResponse;
                        callback(null);
                    },

                function (callback) { //inject username, last step (since only id is in scene doc)

                    if ((sceneResponse.userName == null || sceneResponse.userName.length < 1) && sceneResponse.user_id.length > 10) {

                        var oo_id = new BSON.ObjectID(sceneResponse.user_id);
                        db.users.findOne({_id: oo_id}, function (err, user) {
                            if (!err || user != null) {
                                console.log("tryna inject usrname: " + user.userName);
                                sceneResponse.userName = user.userName;
                                callback(null);
                            }
                        });

                    } else  {
                        callback(null);
                    }
                }

                ],
                function (err, result) { // #last function, close async
                    res.json(sceneResponse);
                    console.log("waterfall done: " + result);
                }
            );
//            });
        });

app.post('/delete_path', checkAppID, requiredAuthentication, function (req, res) {
    console.log("tryna delete key: " + req.body._id);
    var o_id = new BSON.ObjectID(req.body._id);
    db.paths.remove( { "_id" : o_id }, 1 );
    res.send("deleted");

});
//
//  app.post('/savepath', checkAppID, requiredAuthentication, function (req, res) {

          //if (req.session.auth != "noauth") { //maybe check if uid is valid?
            //console.log(req.body);
          //var jObj = JSON.parse(req.body);

//          db.paths.save(
//              {   pathUserID : jObj.user._id,
//                  pathNumber : jObj.pathNumber,
//                  pathTitle : jObj.pathTitle,
//                  pathTolPictureID : jObj.pathTolPictureID,
//                  pathPictureID : jObj.pathPictureID,
//                  symbolKey : jObj.symbolKey,
//                  symbolTitle : jObj.symbolTitle,
//                  symbolPictureID : jObj.symbolPictureID,
//                  arcanumNumber : jObj.arcanumNumber,
//                  arcanumTitle : jObj.arcanumTitle,
//                  arcanumPictureID : jObj.arcanumPictureID,
//                  pathAudioID : jObj.pathAudioID,
//                  pathKeynote : jObj.pathKeynote,
//                  pathDescription : jObj.pathDescription,
////                  pathText : jObj.pathText},
//            db.paths.save ( jObj,
//
//              function (err, saved) {
//                  if (err || !saved) {
//                  } else {
//                      var key_id = saved._id.toString();
//                      console.log('new key id: ' + key_id);
//                      //                callback();
//                      res.send(key_id)
//                  }
//              });
//      });

  app.post('/share_scene/:_id', checkAppID, requiredAuthentication, function (req, res) {
      console.log("share node: " + req.body._id + " wmail: " + req.body.sceneShareWith);

//      var o_id = new BSON.ObjectID(req.body._id);
//      db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
//            if (err || !audio_item) {
//            console.log("error getting audio items: " + err);
//            } else {
//                console.log('reset request from: ' + req.body.user.user_email);
                // ws.send("authorized");
                var subject = "Space/Time RailRoad ticket to " + req.body.sceneTitle;
                var from = "polytropoi@gmail.com";
                var to = [req.body.sceneShareWith];
                var bcc = [];
                //var reset = "";
                var timestamp = Math.round(Date.now() / 1000);
                
                if (validator.isEmail(req.body.sceneShareWith) == true) {
                    var htmlbody = req.session.user.userName + " has shared a guest pass on the Space/Time RailRoad with you!</h3><hr><br>" +
                    "Click here to access the scene: </br>" + "http://strr.us/?scene=" + req.body.short_id +

                        "<br> Get the updated Android App here:  http://spacetimerailroad.com/strr.apk " +
                        "<br> Get the updated Windows 64bit app here :  http://spacetimerailroad.com/strr_windows.zip " +
                        "<br> Get the updated OSX app here :  http://spacetimerailroad.com/strr.apk " +


                        "<br> Scene Title: " + req.body.sceneTitle +
                            "<br> Scene Key: " + req.body.short_id;

                    ses.sendEmail( { 
                       Source: from, 
                       Destination: { ToAddresses: to, BccAddresses: bcc},
                       Message: {
                           Subject: {
                              Data: subject
                           },
                           Body: {
                               Html: {
                                Data: htmlbody
                               }
                            }
                       }
                    }
                    , function(err, data) {
                        if(err) throw err
                            console.log('Email sent:');
                            console.log(data);
                            res.send("Email sent");
                           // res.redirect("http://elnoise.com/#/play/" + audio_item[0].short_id);
                     });
                  
                      } else {
                      res.send("invalid email address");
                    }
//                    }
//                });
  });

/*
    app.post('/delete_this_item/:itemID', auth, function(req, res) {  //later...

        var fname = req.body.filename;
        //
        knoxClient.deleteMultiple([itemID + '.' + fname + '.png', [itemID + '.' + fname + + '.png', itemID + '.' + fname + + '.ogg'], function(err, res){
            if (err != null) {
                console.log("error deleting " + itemID + " :" + err);
                res.send(err);
            } else {
                console.log('deletion successful: ' + res);
                res.send(res);
            }
         });
    }
*/
    app.post('/update_pic/:_id', checkAppID, requiredAuthentication, function (req, res) {
        console.log(req.params._id);
        
            var o_id = new BSON.ObjectID(req.params._id);  //convert to BSON for searchie
            console.log('pic requested : ' + req.body._id);
            db.image_items.find({ "_id" : o_id}, function(err, pic_item) {
                    if (err || !pic_item) {
                    console.log("error getting audio items: " + err);
                    } else {
            console.log("tryna update " + req.body._id + " to status " + req.body.item_status);
            db.image_items.update( { _id: o_id }, { $set: { item_status: req.body.item_status,
                                                            tags: req.body.tags,
                                                            title: req.body.title,
                                                            orientation: req.body.orientation,
                                                            hasAlphaChannel: req.body.hasAlphaChannel,
                                                            captionUpper: req.body.captionUpper,
                                                            captionLower: req.body.captionLower
                                                                                             }});       
             } if (err) {res.send(error)} else {res.send("updated " + new Date())}
        });
    });


    app.post('/update_obj/:_id', checkAppID, requiredAuthentication, function (req, res) {
        console.log(req.params._id);

        var o_id = new BSON.ObjectID(req.params._id);  //convert to BSON for searchie
        console.log('pic requested : ' + req.body._id);
        db.obj_items.find({ "_id" : o_id}, function(err, obj_item) {
            if (err || !obj_item) {
                console.log("error getting audio items: " + err);
            } else {
                console.log("tryna update " + req.body._id + " to status " + req.body.item_status);
                db.obj_items.update( { _id: o_id }, { $set: { item_status: req.body.item_status,
                    tags: req.body.tags,
                    title: req.body.title
                }});
            } if (err) {res.send(error)} else {res.send("updated " + new Date())}
        });
    });

    app.post('/update_audio/:_id', checkAppID, requiredAuthentication, function (req, res) {
        console.log(req.params._id);
        
            var o_id = new BSON.ObjectID(req.params._id);  //convert to BSON for searchie
            console.log('audioID requested : ' + req.body._id);
            db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
                    if (err || !audio_item) {
                    console.log("error getting audio items: " + err);
                    } else {
            console.log("tryna update " + req.body._id + " to status " + req.body.item_status);
            db.audio_items.update( { _id: o_id }, { $set: { item_status: req.body.item_status,
                                                            tags: req.body.tags,
                                                            user_groups: req.body.user_groups,
                                                            alt_title: req.body.alt_title,
                                                            alt_artist: req.body.alt_artist,
                                                            alt_source: req.body.alt_album        
                                                                                             }});       
             } if (err) {res.send(error)} else {res.send("updated " + new Date())}
        });
    });

    app.get('/audioitems/:tag', checkAppID, requiredAuthentication, function(req, res) {
        console.log('tryna return playlist: ' + req.params.tag);
    db.audio.find({tags: req.params.tag, item_status: "public"}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, audio_items) {
        if (err || !audio_items) {
                console.log("error getting audio items: " + err);
                        
                } else {

            async.waterfall([

            function(callback){ //randomize the returned array, takes a shake so async it...
            //audio_items = Shuffle(audio_items);
            //audio_items.splice(0,audio_items.length - maxItems); //truncate randomized array, take only last 20
                        callback(null);
            },

            function(callback) { //add the signed URLs to the obj array
             for (var i = 0; i < audio_items.length; i++) {

                     var item_string_filename = JSON.stringify(audio_items[i].filename);
                        item_string_filename = item_string_filename.replace(/\"/g, "");
                        var item_string_filename_ext = getExtension(item_string_filename);
                        var expiration = new Date();
                        expiration.setMinutes(expiration.getMinutes() + 1000);
                        var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                        console.log(baseName);
                        var mp3Name = baseName + '.mp3';
                        var oggName = baseName + '.ogg';
                        var pngName = baseName + '.png';
                        var urlMp3 = knoxClient.signedUrl(audio_items[i]._id + "." + mp3Name, expiration);
                        var urlOgg = knoxClient.signedUrl(audio_items[i]._id + "." + oggName, expiration);
                        var urlPng = knoxClient.signedUrl(audio_items[i]._id + "." + pngName, expiration);
                        audio_items[i].URLmp3 = urlMp3; //jack in teh signed urls into the object array
                        audio_items[i].URLogg = urlOgg;
                        audio_items[i].URLpng = urlPng;

            }
                    console.log('tryna send ' + audio_items.length + 'audio_items ');
            callback(null);
            }],

                function(err, result) { // #last function, close async
                res.json(audio_items);
            console.log("waterfall done: " + result);
                        }
                );
            }
                });

    });


app.post('/delete_audio/', checkAppID, requiredAuthentication, function (req, res){

        console.log('tryna delete audioID : ' + req.body._id);      
        var audio_id = req.body._id;
        var o_id = new BSON.ObjectID(audio_id);  //convert to BSON for searchie
        
        db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
                if (err || !audio_item) {
                        console.log("error getting picture item: " + err);
                        } else {
                            var item_string_filename = audio_item[0].filename;
                            item_string_filename = item_string_filename.replace(/\"/g, "");
                            var item_string_filename_ext = getExtension(item_string_filename);
                            var baseName = path.basename(item_string_filename, (item_string_filename_ext));
                            console.log(baseName);
                            var pngName = baseName + ".png";
                            var mp3Name = baseName + ".mp3";
                            var oggName = baseName + ".ogg";

                            var params = {
                              Bucket: 'servicemedia.' + req.session.user._id, // required
                              Delete: { // required
                                Objects: [ // required
                                  {
                                    Key: item_string_filename // required
                                  },
                                  {
                                    Key: audio_item[0]._id + "." + pngName // required
                                  },
                                  {
                                    Key: audio_item[0]._id + "." + mp3Name // required
                                  },
                                  {
                                    Key: audio_item[0]._id + "." + oggName // required
                                  }
                                  // ... more items ...
                                ],
                                Quiet: true || false,
                              }
                              //MFA: 'STRING_VALUE',
                            };
                            
                            s3.deleteObjects(params, function(err, data) {
                              if (err) {
                                console.log(err, err.stack);
                                res.send(err);
                                 // an error occurred
                              } 
                              else {    
                                      console.log(data);
                                      db.audio_items.remove( { "_id" : o_id }, 1 );
                                      res.send("deleted");
                                        // successful response
                                    }
                            });
                            
                            //knoxClient.deleteMultiple([item_string_filename, audio_item[0]._id + "." + pngName, audio_item[0]._id + "." + mp3Name, audio_item[0]._id + "." + oggName], function(err, delres){
                             //   if (err) {
                               //     console.log(err);
                                //} else {
                                 //   db.audio.remove( { "_id" : o_id }, 1 );
                                  //  res.send("deleted");
                                }
                            });
    });

app.post('/delete_picture/', checkAppID, requiredAuthentication, function (req, res){
    console.log(req.body);

    console.log('tryna delete pictureID : ' + req.body._id);
    var pic_id = req.body._id;
    var o_id = new BSON.ObjectID(pic_id);  //convert to BSON for searchie

    db.image_items.find({ "_id" : o_id}, function(err, pic_item) {
        if (err || !pic_item) {
            console.log("error getting picture item: " + err);
        } else {
            var item_string_filename = pic_item[0].filename;
            item_string_filename = item_string_filename.replace(/\"/g, "");
            var item_string_filename_ext = getExtension(item_string_filename);
            var baseName = path.basename(item_string_filename, (item_string_filename_ext));
            console.log(baseName);
            var thumbName = 'thumb.' + baseName + item_string_filename_ext;
            var halfName = 'half.' + baseName + item_string_filename_ext;
            var quarterName = 'quarter.' + baseName + item_string_filename_ext;
            var standardName = 'standard.' + baseName + item_string_filename_ext;

            var params = {
                Bucket: 'servicemedia.' + req.session.user._id, // required
                Delete: { // required
                    Objects: [ // required
                        {
                            Key: item_string_filename // required
                        },
                        {
                            Key: pic_item[0]._id + "." + thumbName // required
                        },
                        {
                            Key: pic_item[0]._id + "." + quarterName // required
                        },
                        {
                            Key: pic_item[0]._id + "." + halfName // required
                        },
                        {
                            Key: pic_item[0]._id + "." + standardName // required
                        }
                        // ... more items ...
                    ],
                    Quiet: true || false,
                }
                //MFA: 'STRING_VALUE',
            };

            s3.deleteObjects(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    res.send(err);
                    // an error occurred
                }

//                knoxClient.deleteMultiple([item_string_filename, pic_item[0]._id + "." + thumbName, pic_item[0]._id + "." + halfName, pic_item[0]._id + "." + quarterName, pic_item[0]._id + "." + standardName], function(err, delres){
//                if (err) {
//                    console.log(err);
//                }
                else {
                    db.image_items.remove( { "_id" : o_id }, 1 );
                    res.send("deleted");
                }
            });

        }
    });
});


app.post('/uploadaudio', checkAppID, requiredAuthentication, function (req, res) {
    /*
        req.files.audio_upload.on('progress', function(bytesReceived, bytesExpected) {
        console.log(((bytesReceived / bytesExpected)*100) + "% uploaded");
        res.send(((bytesReceived / bytesExpected)*100) + "% uploaded");
        });
        req.files.audio_upload.on('end', function() {
        console.log(req.files);
        res.send("upload complete, now processing...");
        });
    */

    console.log("tryna upload...");
        
        var returnString = "";
            var uName = req.body.username;
            var uPass = req.body.userpass;
                var expires = new Date();
                expires.setMinutes(expires.getMinutes() + 30);
            var ts = Math.round(Date.now() / 1000); 
            var fname = req.files.audio_upload.name;
            var fsize = req.files.audio_upload.size;
        console.log("filename: " + fname);
            var fpath = req.files.audio_upload.path;
        var parsedTags = {};
        //var item_id = "";

    async.waterfall([ //flow control for functions below, do one at a time, and pass vars to next as needed
    
    function(callback) { //check for proper extensions
    var fname_ext = getExtension(fname); 
    console.log("extension of " + fname + "is " + fname_ext);
    if (fname_ext === ".ogg" || fname_ext === ".mp3" || fname_ext === ".aiff" || fname_ext === ".aif" || fname_ext === ".wav" ) {
        callback(null);
        } else {
        callback(err);
        res.send("bad file");
        }
    },

//
//    function(callback) { //#1 - parse ID3 tags if available
//        var fname_ext = getExtension(fname);
//        if (fname_ext === ".mp3") {
//        var parser = new mm(fs.createReadStream(fpath));
//        parser.on('metadata', function (result) {
//            parsedTags = result;
//            console.log("parsed file result: " + parsedTags);
//            callback(null, parsedTags);
//            });
//        } else {
//            parsedTags = "";
//            callback(null, parsedTags);
//            }
//
//    },
    
//    function(pTags, callback){ //#2 assign fields and parsed tags
//    if (pTags != null && pTags != undefined) {
//        //res.json(JSON.stringify(pTags.title.toString()));
//        callback("fakeid3tags");
//        } else if (fname != null && fname.length > 2) {
//        res.json(JSON.stringify(fname));
//        } else {
//        res.json(JSON.stringify("no name"));
//        }
//    },


    function(callback) { //check that we gotsa bucket with this user's id
        
       // var bucketFolder = 'elnoise1/' + req.session.user._id + '/';

        var bucketFolder = 'servicemedia.' + req.session.user._id;
        console.log("butcketFOlder: " + bucketFolder);
        s3.headBucket({Bucket:bucketFolder},function(err,data){
          if(err){
              s3.createBucket({Bucket:bucketFolder},function(err2,data){
                if (err2){ 
                  console.log(err2);
                  callback(err2);
                } else {
                  console.log("bucket creation");
                  callback(null, bucketFolder);
                }
              });
           } else {
               console.log("Bucket exists and we have access");
               callback(null, bucketFolder);
           }
        });

        },


    function(theBucketFolder, callback) { //upload orig file to s3
        //knoxClient.putFile(fpath, fname, function(err, rez) { //just use userid  here, audioID added at transloadit
        //console.log(fname + ' ' + knoxClient.putFile.progress);
      var stream = fs.createReadStream(fpath);
       var data = {Bucket: theBucketFolder, Key: fname, Body: stream};
       console.log("orignal file to: " + data);
        s3.putObject(data, function(err, data) {
          if (err) {
            console.log("Error uploading data: ", err);
            callback(err);
          } else {
            console.log("Successfully uploaded data to " + theBucketFolder);
            callback(null, 'uploaded orig file');
          }
        
        //});        
        //console.log(knoxClient.putFile.progress);                    
       // if (200 === rez.statusCode) {
         //           console.log(rez);
        //    callback(null, 'uploaded orig file');   
          //   console.log("Successfully uploaded data to theBucketFolder/myKey");
           // } else {
            
             //   }
            });
        },

    function(arg1, callback) { //#3 save data to mongo, get object ID

        var itemTitle = "";

//        if (parsedTags == ""  || parsedTags.title.length < 3 || parsedTags.title === null || parsedTags.title === undefined ) {
            itemTitle = fname;
//        } else {
//            itemTitle = parsedTags.title.toString();
//        }

    db.audio_items.save(
        {type : "uploadedUserAudio",
                userID : req.session.user._id,
                username : req.session.user.userName,
                title : itemTitle,
//                artist : (parsedTags != "") ? parsedTags.artist.toString() : "",
//                album : (parsedTags != "") ? parsedTags.album.toString() : "",
//                year : (parsedTags != "") ? parsedTags.year.toString() : "",
            artist : "",
                album :  "",
                year :  "",
         filename : fname,
        item_type : 'audio',
        //alt_title : req.files.audio_upload.title,
        //alt_artist : req.files.audio_upload.artist,
        //alt_album : req.files.audio_upload.album,
         tags: req.body.tags,
        item_status: "private",
        otimestamp : ts,
        ofilesize : fsize}, 
        function (err, saved) {
            if ( err || !saved ) {
            console.log('audio item not saved..');
            callback (err);
            } else {
            var item_id = saved._id.toString();
            console.log('new item id: ' + item_id);
            callback(null,item_id);
                }
            }
        );
    },

        function (itemID, callback) { //if the clip has a tag, stick it's id in the appropriate scene.slot

//        var theTags = new Array();
            var theTags = JSON.parse(req.body.tags);
            for (var i in theTags) {
                console.log("checking tags: " + theTags[i]);
                if (theTags[i].search("_primary") != -1) {
                    var shortID = theTags[i].substring(0, 6);
                    console.log("tryna update scene " + shortID);
                    db.scenes.update({short_id: shortID}, {$set: {scenePrimaryAudioID: itemID}} );
                }
                if (theTags[i].search("_ambient") != -1) {
                    var shortID = theTags[i].substring(0, 6);
                    console.log("tryna update scene " + shortID);
                    db.scenes.update({short_id: shortID}, {$set: {sceneAmbientAudioID: itemID}} );
                }
                if (theTags[i].search("_trigger") != -1) {
                    var shortID = theTags[i].substring(0, 6);
                    console.log("tryna update scene " + shortID);
                    db.scenes.update({short_id: shortID}, {$set: {sceneTriggerAudioID: itemID}} );
                }
            };
            callback(null, itemID)
        },
    
    function(itemID, callback) {//get a URL of the original file now in s3, to send down the line       
         var bucketFolder = 'servicemedia.' + req.session.user._id;
        //var tempURL = knoxClient.signedUrl(fname, expires);
        var params = {Bucket: bucketFolder, Key: fname };
        
        s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
          console.log(err);
          callback(err);
          } else {
            console.log("The URL is", url);
            callback(null, url, itemID);
          }
        });

      //if (tempURL != null || tempURL.length > 10) {  
        //    console.log("gotsa url: " + tempURL);
        //callback(null, tempURL, itemID); 
        //} else {
        //callback("can't get signed URL...");
        //}
        },

    function(tUrl, iID, callback) { //send to transloadit..
        console.log("transcodeAudioURL request: " + tUrl);
        var encodeAudioUrlParams = {
                steps: {
            ':original': {
                robot: '/http/import',
                url : tUrl
                }
            },
            'template_id': '84da9df057e311e4bdecf5e543756029',
            'fields' : { audio_item_id : iID,
                         user_id : req.session.user._id 
                       }
        };

        transloadClient.send(encodeAudioUrlParams, function(ok) {
                console.log('Success: ' + JSON.stringify(ok));
                }, function(err) {
            console.log('Error: ' + JSON.stringify(err));
                    callback(err);
            });
        callback(null, iID);

        },
        
    function(itemID2, callback) {  //gen a short code and insert

            tempID = "";
            newShortID = "";
            tempID = itemID2;
            newShortID = shortId(tempID);
            var o_id = new BSON.ObjectID(tempID);
            console.log(tempID + " = " + newShortID); 
            db.audio_items.update( { _id: o_id }, { $set: { short_id: newShortID }});
                    callback(null,tempID);
            }
          

    ], //end async flow

    function(err, result) { // #last function, close async
        console.log("waterfall done: " + result);
    //  res.redirect('/upload.html');
//        res.send(result);
        }
      );  
    }); //end app.post /upload


app.post('/uploadpicture', checkAppID, requiredAuthentication, function (req, res) {

    console.log("uploadpicture headers: " + JSON.stringify(req.headers));

        var returnString = "";
//            var uName = req.body.username;
//            var uPass = req.body.userpass;
            var type = req.body.pictype;
            var userID = req.body.userID;
            var sceneID = req.body.sceneID;
//            var tags = req.body.tags;
            var expires = new Date();
            expires.setMinutes(expires.getMinutes() + 30);
            var ts = Math.round(Date.now() / 1000);

            var fname = req.files.picture_upload.name.toLowerCase();
            fname =  fname.replace(/ /g, "_");
            var fsize = req.files.picture_upload.size;
            console.log("filename: " + fname);
            var fpath = req.files.picture_upload.path;
        var parsedTags = {};
        //var item_id = "";

    async.waterfall([ //flow control for functions below, do one at a time, and pass vars to next as needed
    
    function(callback) { //check for proper extensions
    var fname_ext = getExtension(fname); 
    console.log("extension of " + fname + "is " + fname_ext);
    if (fname_ext === ".jpeg" || fname_ext === ".jpg" || fname_ext === ".JPG" || fname_ext === ".png" || fname_ext === ".gif") {
        callback(null);
        } else {
        callback(error);
        res.end("bad file");
        }
    },

/*
    function(callback) { //#1 - parse ID3 tags if available
        var parser = new mm(fs.createReadStream(fpath));
        parser.on('metadata', function (result) {
        parsedTags = result;
    console.log(result);
    callback(null, parsedTags); 
        }); 
    },
    
    function(pTags, callback){ //#2 assign fields and parsed tags
    if (pTags != null && pTags != undefined) {  
        //res.json(JSON.stringify(pTags.title.toString()));
        callback();
        } else if (fname != null && fname.length > 2) { 
        res.json(JSON.stringify(fname));
        } else {
        res.json(JSON.stringify("no name"));
        }
    },
*/

    function(callback) { //check that we gotsa bucket for this user
      

        var bucketFolder = 'servicemedia.' + req.session.user._id;
        console.log(bucketFolder);
        s3.headBucket({Bucket:bucketFolder},function(err,data){
          if(err){
              s3.createBucket({Bucket:bucketFolder},function(err2,data){
                if (err2){ 
                  console.log(err2);
                  callback(err2);
                } else {
                  console.log("bucket creation");
                  callback(null, bucketFolder);
                }
              });
           } else {
               console.log("Bucket exists and we have access");
               callback(null, bucketFolder);
           }
        });

        },


    function(theBucketFolder, callback) { //upload orig file to s3

      var stream = fs.createReadStream(fpath);
       var data = {Bucket: theBucketFolder, Key: fname, Body: stream};
       console.log("orignal file to: " + data);
        s3.putObject(data, function(err, data) {
          if (err) {
            console.log("Error uploading data: ", err);
            callback(err);
          } else {
            console.log("Successfully uploaded data to " + theBucketFolder);
            callback(null, 'uploaded orig file');
          }
  
            });
        },

    function(arg1, callback) { //#3 save data to mongo, get object ID

        var itemTitle = "";

    db.image_items.save(
        {type : "uploadedUserPicture",
                userID : req.session.user._id,
                username : req.session.user.userName,
                title : "",

                filename : fname,
                item_type : 'picture',
        //alt_title : req.files.audio_upload.title,
        //alt_artist : req.files.audio_upload.artist,
        //alt_album : req.files.audio_upload.album,
         tags: req.body.tags,
        item_status: "private",
        postcardForScene : req.body.postcardForScene,
        otimestamp : ts,
        ofilesize : fsize}, 
        function (err, saved) {
            if ( err || !saved ) {
            console.log('picture not saved..');
            callback (err);
            } else {
            var item_id = saved._id.toString();
            console.log('new item id: ' + item_id);
            callback(null,item_id);
                }
            }
        );
    },

    function (itemID, callback) { //if the pic has a scenepic tag, stick it's id in the appropriate scene

//        var theTags = new Array();
        var theTags = JSON.parse(req.body.tags);
        for (var i in theTags) {
            console.log("checking tags: " + theTags[i]);
            if (theTags[i].search("_scenepic") != -1) {
                var shortID = theTags[i].substring(0, 6);
                console.log("tryna update scene " + shortID);
                db.scenes.update({short_id: shortID}, {$push: {scenePictures: itemID}} );
            }
            if (theTags[i].search("_postcard") != -1) {
                var shortID = theTags[i].substring(0, 6);
                console.log("tryna update scene " + shortID);
                db.scenes.update({short_id: shortID}, {$push: {scenePostcards: itemID}} );
            }
        };
        callback(null, itemID)
    },

    function(itemID, callback) {//get a URL of the original file now in s3, to send down the line
         var bucketFolder = 'servicemedia.' + req.session.user._id;
        //var tempURL = knoxClient.signedUrl(fname, expires);
        var params = {Bucket: bucketFolder, Key: fname };
        
        s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
          console.log(err);
          callback(err);
          } else {
            console.log("The URL is", url);
            callback(null, url, itemID);
          }
        });

      //if (tempURL != null || tempURL.length > 10) {  
        //    console.log("gotsa url: " + tempURL);
        //callback(null, tempURL, itemID); 
        //} else {
        //callback("can't get signed URL...");
        //}
        },

    function(tUrl, iID, callback) { //send to transloadit..
        console.log("transcodePictureURL request: " + tUrl);
        var encodePictureUrlParams = {
                steps: {
            ':original': {
                robot: '/http/import',
                url : tUrl
                }
            },
            'template_id': '4a12663057e311e4afbe07e1c982c8ee',
            'fields' : { image_item_id : iID,
                         user_id : req.session.user._id 
                       }
        };
        transloadClient.send(encodePictureUrlParams, function(ok) {
                console.log('Success: ' + JSON.stringify(ok));
                }, function(err) {
            console.log('Error: ' + JSON.stringify(err));
                    callback(err);
            });
        callback(null, iID);
    
        },
        
    function(itemID2, callback) {  //gen a short code and insert //not for picss
        /*
            tempID = "";
            newShortID = "";
            tempID = itemID2;
            newShortID = shortId(tempID);
            var o_id = new BSON.ObjectID(tempID);
            console.log(tempID + " = " + newShortID); 
            db.audio_items.update( { _id: o_id }, { $set: { short_id: newShortID }});
          */
                    callback(null,itemID2);
                }
          

    ], //end async flow

    function(err, result) { // #last function, close async
        console.log("waterfall done: " + result);
    //  res.redirect('/upload.html');
        res.end(result);
        }
      );  
    }); //end app.post /upload


app.post('/uploadobject', checkAppID, requiredAuthentication, function (req, res) {


    console.log("tryna upload obj");

    var returnString = "";
    var uName = req.body.username;
    var uPass = req.body.userpass;
    var expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);
    var ts = Math.round(Date.now() / 1000);
    var fname = req.files.obj_upload.name;
    fname =  fname.replace(/ /g, "_");
    var fsize = req.files.obj_upload.size;
    console.log("filename: " + fname);
    var fpath = req.files.obj_upload.path;
    var parsedTags = {};
    //var item_id = "";

    async.waterfall([ //flow control for functions below, do one at a time, and pass vars to next as needed

            function(callback) { //check for proper extensions
                var fname_ext = getExtension(fname);
                console.log("extension of " + fname + "is " + fname_ext);
                if (fname_ext === ".obj") {
                    callback(null);
                } else {
                    callback(err);
                    res.send("bad file");
                }
            },

            function(callback) { //check that we gotsa bucket with this user's


                var bucketFolder = 'servicemedia.' + req.session.user._id;
                console.log(bucketFolder);
                s3.headBucket({Bucket:bucketFolder},function(err,data){
                    if(err){
                        s3.createBucket({Bucket:bucketFolder},function(err2,data){
                            if (err2){
                                console.log(err2);
                                callback(err2);
                            } else {
                                console.log("bucket creation");
                                callback(null, bucketFolder);
                            }
                        });
                    } else {
                        console.log("Bucket exists and we have access");
                        callback(null, bucketFolder);
                    }
                });

            },


//            function(theBucketFolder, callback) { //upload orig file to s3
//
//                var stream = fs.createReadStream(fpath);
//                var data = {Bucket: theBucketFolder, Key: fname, Body: stream};
//                console.log("orignal file to: " + data);
//                s3.putObject(data, function(err, data) {
//                    if (err) {
//                        console.log("Error uploading data: ", err);
//                        callback(err);
//                    } else {
//                        console.log("Successfully uploaded data to " + theBucketFolder);
//                        callback(null, 'uploaded orig file');
//                    }
//
//                });
//            },

            function(bucket, callback) { //#3 save data to mongo, get object ID

                var itemTitle = "";

                db.obj_items.save(
                    {type : "uploadedObj",
                        userID : req.session.user._id,
                        username : req.session.user.userName,
                        title : "",
                        filename : fname,
                        item_type : 'obj',
                        //alt_title : req.files.audio_upload.title,
                        //alt_artist : req.files.audio_upload.artist,
                        //alt_album : req.files.audio_upload.album,
                        tags: [],
                        item_status: "private",
                        otimestamp : ts,
                        ofilesize : fsize},
                    function (err, saved) {
                        if ( err || !saved ) {
                            console.log('obj not saved..');
                            callback (err);
                        } else {
                            var item_id = saved._id.toString();
                            console.log('new item id: ' + item_id);
                            callback(null,bucket,item_id);
                        }
                    }
                );
            },

            function(theBucketFolder, item_id, callback) { //upload orig file to s3

                var stream = fs.createReadStream(fpath);
                var data = {Bucket: theBucketFolder, Key: item_id + "." + fname, Body: stream};
                console.log("orignal file to: " + data);
                s3.putObject(data, function(err, data) {
                    if (err) {
                        console.log("Error uploading data: ", err);
                        callback(err);
                    } else {
                        console.log("Successfully uploaded data to " + theBucketFolder);
                        callback(null, item_id);
                    }

                });
            },

//            function(itemID, callback) {//get a URL of the original file now in s3, to send down the line
//                var bucketFolder = 'servicemedia.' + req.session.user._id;
//                //var tempURL = knoxClient.signedUrl(fname, expires);
//                var params = {Bucket: bucketFolder, Key: item_id + "." + fname };
//
//                s3.getSignedUrl('getObject', params, function (err, url) {
//                    if (err) {
//                        console.log(err);
//                        callback(err);
//                    } else {
//                        console.log("The URL is", url);
//                        callback(null, url, itemID);
//                    }
//                });
//
//                //if (tempURL != null || tempURL.length > 10) {
//                //    console.log("gotsa url: " + tempURL);
//                //callback(null, tempURL, itemID);
//                //} else {
//                //callback("can't get signed URL...");
//                //}
//            },



//            function(url, itemID2, callback) {  //gen a short code and insert //not for picss
//                /*
//                 tempID = "";
//                 newShortID = "";
//                 tempID = itemID2;
//                 newShortID = shortId(tempID);
//                 var o_id = new BSON.ObjectID(tempID);
//                 console.log(tempID + " = " + newShortID);
//                 db.audio_items.update( { _id: o_id }, { $set: { short_id: newShortID }});
//                 */
//                callback(null,url);
//            }


        ], //end async flow

        function(err, result) { // #last function, close async
            console.log("waterfall done: " + result);
            //  res.redirect('/upload.html');
            res.send(result);
        }
    );
}); //end app.post /upload


function Shuffle(o) {
                  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                        return o;
                        };

function getExtension(filename) {
   	 	var i = filename.lastIndexOf('.');
 	   	return (i < 0) ? '' : filename.substr(i);
		}

