// We need to 'require' the                                                                                                                            
// // following modules                                                                                                                    
 var express = require("express")
// , cors = require('cors')
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

var whitelist = ['strr.us.s3.amazonaws.com', 'strr.us', 'elnoise.com', 'philosphersgarden.com', 'mvmv.us', 'servicemedia.net'];
var corsOptions = function (origin) {
    console.log("checking vs whitelist:" + origin);
    if ( whitelist.indexOf(origin) !== -1 ) {
        return true;
    } else {
        return false;
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
                res.header('Access-Control-Allow-Origin', 'kork.us');
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
        app.use(express.session({ secret: 'permanententropy',
            maxAge: 1000,
            httpOnly: false
        }));
        app.use(express.staticCache());
        app.use(app.router);      // not entirely necessary--will be automatically called with the first .get()
        //
    });

       // Create the http server and get it to listen on the specified port 8084                                                                                                                   
  var databaseUrl = "asterion:menatar@linus.mongohq.com:10093/servmed";
  var collections = ["auth_req", "users", "audio_items", "audio_item_keys", "image_items", "obj_items", "paths", "keys", "scenes"];
  var db = require("mongojs").connect(databaseUrl, collections);
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

  http.createServer(app).listen(8092, function(){
    
	console.log("Express server listening on port 8092");
                         });

  function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
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

            console.log("Logged in: " + req.session.user.userName);
            res.send(req.session.user.userName);
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


  app.post("/logout", requiredAuthentication, function (req, res) {
        req.session.destroy();
        res.send("logged out");
        //res.redirect("/");
  });

  app.post("/authreq", function (req, res) {
        console.log('authRequest from: ' + req.body.uname + " " + req.body.umail  + " " + req.body.upass);
        var currentDate = Math.floor(new Date().getTime()/1000);
        
        //if (1 == 1) {
        //no facebook login
        if (req.body.fbID != null || req.body.fbID != "noFacebookID" || req.body.fbID.length < 8  ) {

                db.users.find(
                { $or: [{userName: req.body.uname}, {email: req.body.uname}] }, //mongo-lian "OR" syntax...
                //password: req.body.upass},
                //{password:0}, 
                function(err, authUser) {
                if( err || !authUser) {
                        console.log("user not found");
                        res.send("user not found");
                        req.session.auth = "noauth";
                } else {

                        if (authUser[0].status !== "unvalidated") {
                        var pass = req.body.upass;
                        var hash = authUser[0].password;
                        console.log("hash = " + authUser[0].password);
                        bcrypt.compare(pass, hash, function(err, match) {  //check password vs hash
                                if (match) { 
                                req.session.user = authUser[0];
                                res.json(req.session.user._id);
                                // req.session.auth = authUser[0]._id;
                                appAuth = authUser[0]._id;
                                console.log("auth = " + JSON.stringify(req.session.user));
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


   app.get('/profile/:auth_id', requiredAuthentication, function (req, res) {
                console.log("tryna profile...");
                var u_id = new BSON.ObjectID(req.params.auth_id); 
                db.users.findOne({"_id": u_id}, function (err, user) {
                  if (err || !user) {
                          console.log("error getting user: " + err);
                          } else {
                          console.log("user profile for " + req.params.auth_id);
                          res.json(user);
                          }
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

   app.post('/savepw', function (req, res){

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

   app.post('/resetpw', function (req, res) {

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
    app.post('/newuser', function (req, res) {

                console.log('newUser request from: ' + req.body.userName);
                // ws.send("authorized");
                if (req.body.userPass.length < 7) {  //weak
                     console.log("bad password");
                        res.send("badpassword");

                } else if (validator.isEmail(req.body.userEmail) == false) {  //check for valid email

                    console.log("bad email");
                        res.send("bademail");

                } else {

                db.users.findOne({userName: req.body.userName}, function(err, existingUserName) { //check if the username already exists
                    
                    if (err || !existingUserName) {  //should combine these queries into an "$or"
                        
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
                            password : hash}, function (err, newUser){
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
                                            Data: 'ServiceMedia New User'
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
                        console.log("that name already exists or something went wrong");
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
      

app.get('/newaudiodata.json', requiredAuthentication,  function(req, res) {
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

	app.get('/randomaudiodata.json', requiredAuthentication, function(req, res) {
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

//    app.get('/useraudio/:u_id', requiredAuthentication, function(req, res) {
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

    app.get('/userpics/:u_id', requiredAuthentication, function(req, res) {
        console.log('tryna return userpics for: ' + req.params.u_id);
        db.image_items.find({userID: req.params.u_id}).sort({otimestamp: -1}).limit(maxItems).toArray( function(err, picture_items) {

            if (err || !picture_items) {
                console.log("error getting picture items: " + err);

                } else {
                console.log("# " + picture_items.length);
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
                       //console.log("picture item: " + urlThumb, picture_items[0]);

                }

                res.json(picture_items);
                console.log("returning picture_items for " + req.params.u_id);
                        }
                });
    });

    app.get('/useraudio/:u_id', requiredAuthentication, function(req, res) {
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
                console.log("returning audio_items for " + req.params.u_id);
            }
        });
    });

    app.get('/userobjs/:u_id', requiredAuthentication, function(req, res) {
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

    app.get('/userpics', requiredAuthentication, function(req, res) {
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

    app.get('/userpic/:p_id', requiredAuthentication, function(req, res) {

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

    app.get('/userobj/:p_id', requiredAuthentication, function(req, res) {

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
                console.log("returning audio_items for " + req.params.userName);
                        }
                });
    });

	app.get('/audiodata.json', requiredAuthentication, function (req, res) {	
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

    app.post('/gen_short_code', requiredAuthentication, function (req, res) {
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

	app.post('/update/:_id', requiredAuthentication, function (req, res) {
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

  

	app.post('/useritemkeys', function (req, res) {  //return the keys saved by this user, req. happens after login
		var uID = req.body.userID;
		console.log("tryna get itemkeys for userID: " + uID);
		//var u_id = new BSON.ObjectID(uID); 
		db.audio_item_keys.find({ "keyUserID" : uID}, function(err, itemKeys) {
			if (err || !itemKeys) {
				console.log("cain't get no itemKeys... " + err);	
			} else {
				console.log(JSON.stringify(itemKeys));
				res.json(itemKeys);
			}
		});
	});

  app.post('/itemkeys', function (req, res) {  //return the keys saved by this user, req. happens after login
    var uID = req.body.audioItemID;
    console.log("tryna get itemkeys for audioItemID: " + uID);
    //var u_id = new BSON.ObjectID(uID); 
    db.audio_item_keys.find({ "keyAudioItemID" : uID}, function(err, itemKeys) {
      if (err || !itemKeys) {
        console.log("cain't get no itemKeys... " + err);  
      } else {
        console.log(JSON.stringify(itemKeys));
        res.json(itemKeys);
      }
    });
  });

  app.post('/itemkeyspublic', function (req, res) {  //return the keys saved by this user, req. happens after login
    var uID = req.body.userID;
    console.log("tryna get itemkeys for userID: " + uID);
    //var u_id = new BSON.ObjectID(uID); 
    db.audio_item_keys.find({ "keyUserID" : uID}, function(err, itemKeys) {
      if (err || !itemKeys) {
        console.log("cain't get no itemKeys... " + err);  
      } else {
        console.log(JSON.stringify(itemKeys));
        res.json(itemKeys);
      }
    });
  });

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


	app.post('/savekeysall', requiredAuthentication, function (req, res) { //save item keys set oon client
	
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
	
app.post('/savekeys', requiredAuthentication, function (req, res) { //save item keys set oon client
  
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

	app.post('/savekey', requiredAuthentication, function (req, res) {

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

  app.post('/delete_key', requiredAuthentication, function (req, res) {
      console.log("tryna delete key: " + req.body.keyID);
      var o_id = new BSON.ObjectID(req.body.keyID);
      db.audio_item_keys.remove( { "_id" : o_id }, 1 );
                                      res.send("deleted");

  });

    app.post('/update_key', requiredAuthentication, function (req, res) {
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
app.get('/pathinfo',  requiredAuthentication, function (req, res) { //get default path info

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

app.get('/upaths/:_id',  requiredAuthentication, function (req, res) { //get default path info

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

app.get('/upath/:u_id/:p_id',  requiredAuthentication, function (req, res) { //get default path info

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

app.post('/newpath', requiredAuthentication, function (req, res) {

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

  }),

    app.post('/update_path/:_id', requiredAuthentication, function (req, res) {
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
app.get('/sceneinfo',  requiredAuthentication, function (req, res) { //get default scene info

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

app.get('/uscenes/:_id',  requiredAuthentication, function (req, res) { //get scenes for this user

    console.log("tryna get user scenes: ",req.params._id);
    var o_id = new BSON.ObjectID(req.params._id);
    db.scenes.find({ "user_id" : req.params._id}, function(err, scenes) {
        if (err || !scenes) {
            console.log("cain't get no scenes... " + err);
        } else {
            console.log(JSON.stringify(scenes));
            res.json(scenes);
        }
    });
});

app.get('/uscene/:user_id/:scene_id',  requiredAuthentication, function (req, res) { //get a specific scene for this user

    console.log("tryna get scene " + req.params.scene_id);
    var sceneID = req.params.scene_id.toString().replace(":", "");
    var o_id = new ObjectId.createFromHexString(sceneID);

    console.log("tryna get scene: " + sceneID);
    db.scenes.findOne({ _id : o_id}, function(err, scenes) {
        if (err || !scenes) {
            console.log("cain't get no scenes... " + err);
        } else {
            console.log(JSON.stringify(scenes));
            res.send(scenes);
        }
    });
});

app.post('/newscene', requiredAuthentication, function (req, res) {

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

            res.send(newShortID);

        }
    });

}),

    app.post('/delete_scene/:_id', requiredAuthentication, function (req, res) {
        console.log("tryna delete key: " + req.body._id);
        var o_id = new BSON.ObjectID(req.body._id);
        db.scenes.remove( { "_id" : o_id }, 1 );
        res.send("deleted");

    });

    app.post('/update_scene/:_id', requiredAuthentication, function (req, res) {
        console.log(req.params._id);

        var o_id = new BSON.ObjectID(req.body._id);  //convert to BSON for searchie
        console.log('path requested : ' + req.body._id);
        db.scenes.find({ "_id" : o_id}, function(err, scene) {
            if (err || !scene) {
                console.log("error getting path items: " + err);
            } else {
                console.log("tryna update path " + req.body._id);


                db.scenes.update( { "_id": o_id }, { $set: {
                    sceneDomain : req.body.sceneDomain,
                    sceneEnvironment : req.body.sceneEnvironment,
                    sceneRandomizeColors : req.body.sceneRandomizeColors,
                    sceneTweakColors : req.body.sceneTweakColors,
                    sceneColorizeSky : req.body.sceneColorizeSky,
                    sceneScatterMeshes : req.body.sceneScatterMeshes,
                    sceneScatterObjects : req.body.sceneScatterObjects,
                    sceneUseDynamicSky : req.body.sceneUseDynamicSky,
                    sceneUseSkybox : req.body.sceneUseSkybox,
                    sceneUseSimpleWater : req.body.sceneUseSimpleWater,
                    sceneUseOcean : req.body.sceneUseOcean,
                    sceneTime: req.body.sceneTime,
                    sceneTimescale: req.body.sceneTimescale,
                    sceneWeather: req.body.sceneWeather,
                    sceneSeason: req.body.sceneSeason,
                    scenePictures : req.body.scenePictures,
                    sceneNumber : req.body.sceneNumber,
                    sceneTitle : req.body.sceneTitle,
                    sceneColor1 : req.body.sceneColor1,
                    sceneColor2 : req.body.sceneColor2,
                    sceneTriggerAudioID : req.body.sceneTriggerAudioID,
                    sceneSpokenAudioID : req.body.sceneSpokenAudioID,
                    sceneBackgroundAudioID : req.body.sceneBackgroundAudioID,
                    sceneEnvironmentAudioID : req.body.sceneEnvironmentAudioID,
                    sceneKeynote : req.body.sceneKeynote,
                    sceneDescription : req.body.sceneDescription,
                    sceneText : req.body.sceneText }
                });
            } if (err) {res.send(error)} else {res.send("updated " + new Date())}
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
    app.get('/newshortcode/:type', requiredAuthentication, function (req, res) {


    });

    //check uniqueness and websafeness (can be used as path) of title for the spec'd type, return bool
    app.get('/checktitle/:type', requiredAuthentication, function (req, res) {


    });

    app.get('/scene/:_id', function (req, res) {

        console.log("tryna get scene id: ", req.params._id);
        var audioResponse = {};
        var pictureResponse = {};
        var sceneResponse = {};
        var requestedPictureItems = [];
        var requestedAudioItems = [];
     sceneResponse.audio = [];
     sceneResponse.pictures = [];

        async.waterfall([

                    function (callback) {
                        db.scenes.find({ sceneTitle: req.params._id }, function (err, sceneData) { //fetch the path info by title TODO: urlsafe string
                            if (err || !sceneData || !sceneData.length) {
                                console.log("error getting scene data by title: " + err);
                                callback("", err);
                            } else { //make arrays of the pics and audio items
                                console.log("scene by title: ", sceneData);
                                sceneData[0].scenePictures.forEach(function (picture){
                                    var p_id = new BSON.ObjectID(picture); //convert to binary to search by _id beloiw
                                    requestedPictureItems.push(p_id); //populate array
                                });

                                requestedAudioItems = [ BSON.ObjectID(sceneData[0].sceneTriggerAudioID), BSON.ObjectID(sceneData[0].sceneSpokenAudioID), BSON.ObjectID(sceneData[0].sceneBackgroundAudioID), BSON.ObjectID(sceneData[0].sceneEnvironmentAudioID) ];

                                sceneResponse = sceneData[0];
                                callback(null, sceneData);
                            }

                        });

                    },

                    function (nScenes, callback) { //try shortcode
                        if (!nScenes || !nScenes.length) {
                        var shortID = req.params._id;
                        db.scenes.find({ "short_id" : shortID}, function(err, sceneData) {
                            if (err || !sceneData || !sceneData.length || sceneData == undefined) {
                                console.log("error getting scenedata by shortcode: " + err);
                                callback("", err);
                            } else {
                                console.log("scene by shortcode: ", sceneData);
                                sceneData[0].scenePictures.forEach(function (picture) {
                                    var p_id = new BSON.ObjectID(picture); //convert to binary to search by _id beloiw
                                    requestedPictureItems.push(p_id); //populate array
                                });

                                requestedAudioItems = [ BSON.ObjectID(sceneData[0].sceneTriggerAudioID), BSON.ObjectID(sceneData[0].sceneSpokenAudioID), BSON.ObjectID(sceneData[0].sceneBackgroundAudioID), BSON.ObjectID(sceneData[0].sceneEnvironmentAudioID) ];

                                sceneResponse = sceneData[0];
                                callback(null, sceneData);
                            }
                        });
                        } else {
                            //sceneResponse = nScenes[0];
//                                pathResponse.audio = [];
//                                pathResponse.pictures = [];
                            callback(null, nScenes);

                        }
                    },

                    function (nScenes, callback) { //if it didn't find it above, try the mongoID
                        if (!nScenes || !nScenes.length) {

                            //var o_id = new BSON.ObjectID(req.params._id);
                            console.log("tryna get by mongo: " + req.params._id);

                            if (Buffer.byteLength(req.params._id) == 24 || Buffer.byteLength(req.params._id) == 12) {
                               // var o_id = new BSON.ObjectID(req.params._id);
                                db.scenes.find({ _id: ObjectId(req.params._id) }, function (err, sceneData) { //fetch the path info
                                    if (err || !sceneData || !sceneData.length) {
                                        console.log("error getting scene items: " + err);
                                        callback(err);
                                    } else {
                                        console.log("scene by ID: " + sceneData);
                                        sceneData[0].scenePictures.forEach(function (picture){
                                            var p_id = new BSON.ObjectID(picture); //convert to binary to search by _id beloiw
                                            requestedPictureItems.push(p_id); //populate array
                                        });

                                        requestedAudioItems = [ BSON.ObjectID(sceneData[0].sceneTriggerAudioID), BSON.ObjectID(sceneData[0].sceneSpokenAudioID), BSON.ObjectID(sceneData[0].sceneBackgroundAudioID), BSON.ObjectID(sceneData[0].sceneEnvironmentAudioID) ];

                                        sceneResponse = sceneData[0];
                                        callback(null);
                                    }

                                });
                            } else {
                                callback("bad input");
                            }
                        } else {
                            //sceneResponse = nScenes[0];
//                                pathResponse.audio = [];
//                                pathResponse.pictures = [];
                            callback(null);

                        }
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
                            //pathResponse.audio.push(urlMp3, urlOgg, urlPng);

                        }

                     //   console.log('tryna send ' + audio_items);
                        audioResponse = audio_items;
                        sceneResponse.audio = audioResponse;
//                        console.log("audio", audioResponse);
                        callback(null, audio_items);
                    },



                    function(audioStuff, callback) {
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
                            //pathResponse.path.pictures.push(urlThumb, urlQuarter, urlHalf, urlStandard);

                        }

//                        console.log('tryna send ' + pictr);
                        pictureResponse = picture_items ;
//                        console.log("pictures: ", pictureResponse)
//                        pathResponse.pictures = picture_items;
                        callback(null);

                    },

                    function (callback) {
                        sceneResponse.audio = audioResponse;
                        sceneResponse.pictures = pictureResponse;
                        callback(null);
                    }
                ],
                function (err, result) { // #last function, close async
                    res.json(sceneResponse);
                    console.log("waterfall done: " + result);
                }
            );
//            });
        });

app.post('/delete_path', requiredAuthentication, function (req, res) {
    console.log("tryna delete key: " + req.body._id);
    var o_id = new BSON.ObjectID(req.body._id);
    db.paths.remove( { "_id" : o_id }, 1 );
    res.send("deleted");

});
//
//  app.post('/savepath', requiredAuthentication, function (req, res) {

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

  app.post('/share_node', requiredAuthentication, function (req, res) {
      console.log("share node: " + req.body._id)
      var o_id = new BSON.ObjectID(req.body._id);
      db.audio_items.find({ "_id" : o_id}, function(err, audio_item) {
            if (err || !audio_item) {
            console.log("error getting audio items: " + err);
            } else {
                console.log('reset request from: ' + req.body.email);
                // ws.send("authorized");
                var subject = "ServiceMedia user " + req.session.user.userName + " has shared a node with you";
                var from = "polytropoi@gmail.com";
                var to = [req.body.email];
                var bcc = [];
                //var reset = "";
                var timestamp = Math.round(Date.now() / 1000);
                
                if (validator.isEmail(req.body.email) == true) {
                    var htmlbody = "<h3>ServiceMedia " + audio_item[0].short_id + "</h3><hr><br>" +
                    "Click here to access this node: </br>" + "http://servicemedia.net/#/play/" + audio_item[0].short_id;

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
                  }
                });                    
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
    app.post('/update_pic/:_id', requiredAuthentication, function (req, res) {
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
                                                            title: req.body.title
                                                                                             }});       
             } if (err) {res.send(error)} else {res.send("updated " + new Date())}
        });
    });


    app.post('/update_obj/:_id', requiredAuthentication, function (req, res) {
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

    app.post('/update_audio/:_id', requiredAuthentication, function (req, res) {
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

    app.get('/audioitems/:tag', requiredAuthentication, function(req, res) {
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


app.post('/delete_audio/', requiredAuthentication, function (req, res){

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

app.post('/delete_picture/', requiredAuthentication, function (req, res){
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


app.post('/uploadaudio', requiredAuthentication, function (req, res) {
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


    function(callback) { //check that we gotsa bucket with this user's id
        
       // var bucketFolder = 'elnoise1/' + req.session.user._id + '/';

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

        if (parsedTags.title.length < 3 || parsedTags.title === null || parsedTags.title === undefined ) {
            itemTitle = fname.substr(0, x.lastIndexOf('.'));
        } else {
            itemTitle = parsedTags.title.toString();
        }

    db.audio_items.save(
        {type : "uploadedUserAudio",
                userID : req.session.user._id,
                username : req.session.user.userName,
                title : itemTitle,
                artist : parsedTags.artist.toString(),
                album : parsedTags.album.toString(),
                year : parsedTags.year.toString(),
         filename : fname,
        item_type : 'audio',
        //alt_title : req.files.audio_upload.title,
        //alt_artist : req.files.audio_upload.artist,
        //alt_album : req.files.audio_upload.album,
         tags: [],
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
        res.send(result);
        }
      );  
    }); //end app.post /upload

app.post('/uploadpicture', requiredAuthentication, function (req, res) {


    console.log("tryna upload...");
        
        var returnString = "";
            var uName = req.body.username;
            var uPass = req.body.userpass;
                var expires = new Date();
                expires.setMinutes(expires.getMinutes() + 30);
            var ts = Math.round(Date.now() / 1000); 
            var fname = req.files.picture_upload.name;
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
    if (fname_ext === ".jpeg" || fname_ext === ".jpg" || fname_ext === ".png" || fname_ext === ".gif") {
        callback(null);
        } else {
        callback();
        res.send("bad file");
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
         tags: [],
        item_status: "private",
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
        res.send(result);
        }
      );  
    }); //end app.post /upload


app.post('/uploadobject', requiredAuthentication, function (req, res) {


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

