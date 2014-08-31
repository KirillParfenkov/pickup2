var express = require('express'),
	connect = require('connect'),
	nconf = require('nconf'),
	serveStatic = require('serve-static'),
	async = require('async'),
	bodyParser = require('body-parser'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	UserDao = require('./modules/user-dao'),
	RoutDao = require('./modules/rout-dao');

// custom
var userDao = UserDao();
userDao.connect(function( err ) {
	//if (err) throw err;
	console.log( 'user dao started!' );
});

var routDao = RoutDao();
routDao.connect(function( err ) {
	//if (err) throw err;
	console.log( 'rout dao started!' );
});

function ensureAuthenticated( req, res, next ) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect( 302, '/login.html');
}

passport.use( new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function( email, password, done ) {

		var len = 256;
		var isCredNotReady = true;
		var sessionKey;

		userDao.authorize( email, password, function( err, loginUser ) {

			if ( err ) {
				return done( err );
			}

			if ( !loginUser ) {
				return done( null, false, { message: 'Incorrect credationls!' } );
			}

			return done( null, loginUser );
		});
	}
));

passport.serializeUser( function( user, done ) {

	var len = 256;
	var isCredNotReady = true;
	var sessionKey;

	while ( isCredNotReady ) {
		sessionKey = crypto.randomBytes(len).toString('hex');
		if ( sessions.indexOf(sessionKey) == -1 ) {
			isCredNotReady = false;
		}
	}

	sessions.push({id : sessionKey, user: user});

	done( null, sessionKey );
});

passport.deserializeUser( function( sessionKey, done ) {

	var sessionExist = false;
	var user;
	if ( sessionKey ) {
		for (var i = 0; i < sessions.length; i++) {
			if ( sessions[i].id == sessionKey ) {
				sessionExist = true;
				user = sessions[i].user;
				break;
			}
		}
	}

	if ( !sessionExist ) {
		done( null, false, { message: 'Incorrect credationls!' } );
	} else {
		done( null, user );
	}
});


var app = express();
var sessions = [];

nconf.argv().env().file({file: './config.json'});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use( serveStatic('public') );
app.use(passport.initialize());
app.use(passport.session());
app.post('/login', passport.authenticate( 'local', { successRedirect: '/', failureRedirect: '/login.html' }));


app.post('/api/user', function( req, res ) {

	if ( req.body.password != req.body.repairPassword ) {
		res.json( 200, { err : {
			type : "passwordNotEqual"
		}});
		return;
	} else if ( !req.body.password ) {
		res.json( 200, {
			err : {
				type : "passwordIsEmpty"
			}
		});
		return;
	} else if ( !req.body.name ) {
		res.json( 200, {
			err : {
				type : "nameIsEmpty"
			}
		});
		return;
	} else if ( !req.body.phone ) {
		res.json( 200, {
			err : {
				type : "phoneIsEmpty"
			}
		});
		return;
	}

	var user = {
		phone : req.body.phone,
		name : req.body.name,
		passport : req.body.password,
		info : req.body.info
	}
	userDao.insert( user, function( err, createdUser) {
		if ( err )  res.json( err );
		res.json( 200, createdUser );
	});
});

app.get('/api', function(req, res) {
	res.send(200, 'Api is runnig!');
});

app.listen(nconf.get('port'), function() {
	console.log('Server running at ' + nconf.get('port') + ' port');
});

app.get('/api/users', function( req, res ) {
	userDao.getList( function( err, users ) {
		res.json( 200, 	users );
	});
});

app.get('/api/user/:id', function( req, res ) {
	userDao.getById( req.params.id, function( err, user ) {
		if (err) console.log( err );
		res.json( 200, 	user );
	});
});

app.get('/api/routs', function(req, res) {
	routDao.getList( function( err, routs) {
		res.json( 200, routs );
	});
});

app.get('/api/rout/:id', function(req, res) {
	routDao.getById( req.params.id, function( err, rout ) {
		res.json( 200, rout );
	});
});
