// We need to 'require' the                                                                                                                            
// // following modules                                                                                                                    
 var express = require("express")

 , http = require("http")
 , path = require("path")
 , validator = require('validator')
 , async = require('async')
 , mongo = require('mongodb')
 , bcrypt = require('bcrypt');

app = express();

var whitelist = ['unityapp', 'servicemedia.net', ];
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
  var databaseUrl = "your database connection string";
  var collections = ["acl", "auth_req", "domains", "apps", "users", "scores", "activity", "purchases"];
  var db = require("mongojs").connect(databaseUrl, collections);
  var BSON = mongo.BSONPure;

  var maxItems = 1000;




  var appAuth = "noauth";

    http.createServer(app).listen(8092, function(){

	console.log("Express server listening on port 8092");
    });

  function requiredAuthentication(req, res, next) {  //simple check of the session info, like a nice web page
    console.log("headers: " + JSON.stringify(req.headers));
    if (req.session.user) {
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

        //is there such a rule, and is this user id in it's userIDs array?
        console.log("lookin for u_id :" + u_id + " in " + acl_rule);
            db.acl.findOne({$and: [{acl_rule: acl_rule}, {userIDs: {$in: [u_id]}}]}, function (err, rule) {
                if (err || !rule) {
                    //req.session.error = 'Access denied!';
                    //res.send('noauth');
                    console.log("sorry, that's not in the acl");
                    return false;
                } else {
                    console.log("yep, that's in the acl");
                    return true;
                }
            });
    }

    function admin (req, res, next) { //check user id against acl
        var u_id = req.session.user._id;
//        console.log("lookin for u_id :" + u_id + " in " + acl_rule);
        db.acl.findOne({$and: [{acl_rule: "admin"}, {userIDs: {$in: [u_id]}}]}, function (err, rule) {
            if (err || !rule) {
                req.session.error = 'Access denied!';
                res.send('noauth');
                console.log("sorry, that's not in the acl");

            } else {
                console.log("yep, that's in the acl");
                        next();
            }
        });
    }

    function usercheck (req, res, next) { //gotsta beez owner of requested resource
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
//        if (u_id == req_u_id.toString().replace(":", "")) { //hrm.... must trim the :
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
                }
            });
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
                } else {
                    console.log("yep, that's in the acl");
                    next();
                }
            });
        } else {
            req.session.error = 'Access denied!';
            res.send('noauth');
        }
    }

    function getExtension(filename) {
      	var i = filename.lastIndexOf('.');
       	return (i < 0) ? '' : filename.substr(i);
	}
	
    app.get("/", function (req, res) {  //test
           res.send("Hello World!");
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

  app.get("/amirite/:_id", function (req, res) {  //used for checking webpage authentication
    if (req.session.user) {
    console.log(JSON.stringify(req.session.user._id) + " " + req.params._id);
        if (req.session.user._id == req.params._id) {
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
        console.log('authRequest from: ' + req.body.uname + " " + req.body.umail);
        var currentDate = Math.floor(new Date().getTime()/1000);
        
        //if (1 == 1) {
        //no facebook login
        if (req.body.fbID != null || req.body.fbID != "noFacebookID" || req.body.fbID.length < 8  ) {

            var un_query = {userName: req.body.uname};
            var em_query = {email: req.body.umail};

                db.users.find(
                { $or: [un_query, em_query] }, //mongo-lian "OR" syntax...
                function(err, authUser) {
                if( err || !authUser) {
                        console.log("user not found");
                        res.send("user not found");
                        req.session.auth = "noauth";
                } else {
                    console.log("found " + authUser.length + " users like dat");
                    authUserIndex = 0;
                    for (var i = 0; i < authUser.length; i++) {
                        if (authUser[i].userName == req.body.uname) { //only for cases where multiple accounts on one email, match on the name
                            authUserIndex = i;
                        }
                    }
                    console.log("authuser: " + JSON.stringify(authUser[authUserIndex]));
                        if (authUser[authUserIndex] !== null && authUser[authUserIndex] !== undefined && authUser[authUserIndex].status == "validated") {
//                            (req.body.uname.length > 2 && req.body.uname == authUser[0].userName) && (req.body.umail.length > 6 && req.body.umail == authUser[0].email)) {
                        var pass = req.body.upass;
                        var hash = authUser[authUserIndex].password;
                        console.log("hash = " + authUser[authUserIndex].password);
                        bcrypt.compare(pass, hash, function(err, match) {  //check password vs hash
                                if (match) { 
                                req.session.user = authUser[authUserIndex];
                                res.cookie('_id', req.session.user._id, { maxAge: 900000, httpOnly: false});
                                var authResp = req.session.user._id + "~" + req.session.user.userName;
                                res.json(authResp);
                                // req.session.auth = authUser[0]._id;
                                appAuth = authUser[authUserIndex]._id;
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

//       if (amirite("admin", req.session.user._id)) { //check the acl //nah

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

    app.post('/newuser', checkAppID, function (req, res) {

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
                        res.send("validation email sent");
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



///!!!DANGER!!!
//app.get('/scoresremove/:appid',  function (req, res) { //get default path info
//
//    console.log("nuke all score data for this application!: ", req.params.appid);
////    var _id = new BSON.ObjectID(req.params.p_id);
//    db.scores.remove({appID : req.params.appid}, function (err, saved) {
//        if (err || !saved) {
//            console.log('nuke fail');
//            res.send("nuke fail");
//        } else {
//
//            console.log('nuked');
//            res.send("nuked");
//        }
//    });
//});

    app.post('/score', checkAppID, requiredAuthentication, function (req, res) {
    console.log("tryna post scores");

        var scorePost = {
            scoreType : req.body.scoreType,
            scoreDateTime : new Date(),
            scoreInt : parseInt(req.body.scoreInt),
            userID : req.body.userID,
            userName : req.body.userName,
            appID : req.body.appID,
            domain : req.body.domain
        };
        console.log("tryna post score: " + scorePost);
        db.scores.save(scorePost, function (err, saved) {
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

    app.get('/totalscores/:appid', function (req, res) {

        var appid = req.params.appid.toString().replace(":", "");

        console.log("tryna get total user scores for app: " + appid);

        var scoresResponse = {};
        var appScores = {};

        async.waterfall([

                function (callback) { //get all scores for this app
                    db.scores.find({appID : appid}, function(err, scores) {
                        if (err || !scores) {
                            console.log("cain't get no scores... " + err);
                            callback(err);
                        } else {

                            appScores = scores;
                            console.log("scores: " + JSON.stringify(appScores));
                            callback(null, scores);
                        }

                    });
                }, //pull unique userIDs
                function (userScores, callback) {
                    var items = userScores;
                    var uids = [];
                    var lookup = {};
                    for (var item, i = 0; item = items[i++];) {
                        var uid = item.userID;
                        if (!(uid in lookup)) {
                            lookup[uid] = 1;
                            uids.push(uid);
                        }
                    }
                    console.log(JSON.stringify(uids));
                    callback(null, userScores, uids);
                }, //loop through again to aggregate scores for each user
                function (scores, uids, callback) {
                    var totalscores = [];
                    async.each (uids, function (uid, callbackz) {
                        var uscores = {};
                        var scoretemp = 0;
                        for (var entry in appScores) {
                            if (uid == appScores[entry].userID) {
                                scoretemp = scoretemp + parseInt(appScores[entry].score);
                            }
                        }
                        uscores.user = uid;
                        uscores.scoreTotal = scoretemp;
                        totalscores.push(uscores);
                        callbackz();
                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            console.log('A file failed to process');
                            callbackz(err);
                        } else {
                            console.log('All files have been processed successfully');
                            scoresResponse.topscores = topscores;
                            callback(null);
                        }
                    });
                }

            ], //end of async.waterfall
            function (err, result) { // #last function, close async
                res.json(scoresResponse);
                console.log("waterfall done: " + result);
            })
    });

    app.get('/topscores/:appid', function (req, res) {

        console.log("tryna get scores for: ", req.params.u_id);
        //var _id = new BSON.ObjectID(req.params.u_id);
        var appid = req.params.appid.toString().replace(":", "");
        db.scores.find({appID : appid}, { userName: 1, scoreType: 1, scoreDateTime: 1, scoreInt: 1, _id:0 }, function(err, scores) {
            if (err || !scores) {
                console.log("cain't get no scores... " + err);
            } else {
    //            console.log(JSON.stringify(scores));
                var scoresResponse = {};
                scores.sort(function(a, b) {
                    return b.scoreInt - a.scoreInt;
                });
                scoresResponse.scores = scores;
                res.json(scoresResponse);
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


    app.get('/activitytotals/:appid', function (req, res) {

        var appid = req.params.appid.toString().replace(":", "");

        console.log("tryna get total user scores for app: " + appid);

        var scoresResponse = {};
        var appScores = {};

        async.waterfall([

                function (callback) { //get all scores for this app
                    db.scores.find({appID : appid}, function(err, activities) {
                        if (err || !scores) {
                            console.log("cain't get no scores... " + err);
                            callback(err);
                        } else {

                            appScores = scores;
                            console.log("scores: " + JSON.stringify(appScores));
                            callback(null, scores);
                        }

                    });
                }, //pull unique userIDs
                function (userScores, callback) {
                    var items = userScores;
                    var uids = [];
                    var lookup = {};
                    for (var item, i = 0; item = items[i++];) {
                        var uid = item.userID;
                        if (!(uid in lookup)) {
                            lookup[uid] = 1;
                            uids.push(uid);
                        }
                    }
                    console.log(JSON.stringify(uids));
                    callback(null, userScores, uids);
                }, //loop through again to aggregate scores for each user
                function (scores, uids, callback) {
                    var totalscores = [];
                    async.each (uids, function (uid, callbackz) {
                        var uscores = {};
                        var scoretemp = 0;
                        for (var entry in appScores) {
                            if (uid == appScores[entry].userID) {
                                scoretemp = scoretemp + parseInt(appScores[entry].score);
                            }
                        }
                        uscores.user = uid;
                        uscores.scoreTotal = scoretemp;
                        totalscores.push(uscores);
                        callbackz();
                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            console.log('A file failed to process');
                            callbackz(err);
                        } else {
                            console.log('All files have been processed successfully');
                            scoresResponse.topscores = topscores;
                            callback(null);
                        }
                    });
                }

            ], //end of async.waterfall
            function (err, result) { // #last function, close async
                res.json(scoresResponse);
                console.log("waterfall done: " + result);
            })
    });

