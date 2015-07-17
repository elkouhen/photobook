/**
 * Module dependencies.
 */

var flash = require('connect-flash');
var express = require('express');
var photos = require('./routes/photos');
var users = require('./routes/users');
var http = require('http');
var path = require('path');
var fs = require('fs');
var MongoUtils = require('./helpers/mongo_utils');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser({
    uploadDir: '/tmp/uploads'
}));
app.use(express.session({
    secret: 'keyboard cat'
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public/dist')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.users(db)
	    .findOne({
		username: username
	    }, {}, function (err, data) {

		db.close();

		if (err) {
		    
		    return done(null, false, {
			message: 'Incorrect username.'
		    });
		}

		if (data) {

		    var user = {
			username: data.username,
			password: data.password,
			role: data.role
		    };

		    
		    return done(null, user);
		} else {
		    return done(null, false, {
			message: 'Incorrect username.'
		    });
		}
	    });
    });
});

passport.use(new LocalStrategy(function (username, password, done) {

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.users(db)
	    .findOne({
		username: username
	    }, {}, function (err, data) {

		db.close();

		if (err) {
		    return done(null, false, {
			message: 'Incorrect username.'
		    });
		}

		if (data && data.password === password) {

		    var user = {
			username: data.username,
			password: data.password,
			role: data.role
		    };

		    return done(null, user);
		} else {
		    return done(null, false, {
			message: 'Incorrect username.'
		    });
		}
	    });
    });
}));

app.post('/connect',
	 passport.authenticate('local', {
	     successRedirect: '/photobook/index.html#/photos',
	     failureRedirect: '/photobook/index.html#/login/err',
	     failureFlash: true
	 }));

app.get('/disconnect', function (req, res) {
    console.log('disconnect');
    req.logout();

    req.session.destroy(function () {
	res.redirect('/');
    });
});

app.get('/photos', photos.photos);
app.get('/photos/count', photos.photos_count);
app.get('/photos/page/:page', photos.photos_page);
app.get('/photos/nom/:name', photos.photos_nom);
app.get('/photos/imageid/:imageId', photos.photos_imageid);
app.delete('/photos/imageid/:imageId', photos.delete_photos_imageid);
app.post('/photos/upload', photos.upload);
app.post('/comments', photos.comments);

app.get('/images/id/:imageId', photos.images_byid);
app.get('/images/filename/:filename', photos.images_byfilename);

app.get('/role', users.role);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
