var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var GridStore = require('mongodb').GridStore;
var Grid = require('mongodb').Grid;
var fs = require("fs");
var MongoUtils = require('../helpers/mongo_utils');

//app.get('/photos', photos.photos);
exports.photos = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return; 
    }

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.photos(db).find({}, {})
	    .toArray(function (err, items) {

		db.close(); 

		if (err) {
		    console.log(err); 
		    res.send(500); 
		    return; 
		}

		res.send(JSON.stringify(items));		
	    });
    });
};

//app.get('/photos/count', photos.photos_count);
exports.photos_count = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return; 
    }

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.photos(db).count({}, function (err, data) {
	    
	    db.close();

	    if (err) {
		console.log(err);
		res.send(500); 
		return; 
	    }

	    res.setHeader('Content-Type', 'text/plain');
	    res.send(200, data + '');
	});
    });
};

// app.get('/photos/page/:page', photos.photos_page);
exports.photos_page = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var pageId = req.params.page;

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.photos(db)
	    .find({}, {})
	    .sort({
		photoId: 1
	    })
	    .skip(9 * pageId).limit(9).toArray(function (err, items) {

		db.close();
		
		if (err) {
		    console.log(err); 
		    res.send(500); 
		    return; 
		}

		res.send(JSON.stringify(items));
	    });
    });
};

// app.get('/photos/nom/:name', photos.photos_nom);
exports.photos_nom = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var photoName = req.params.name;

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.photos(db)
	    .find({
		name: photoName
	    }, {})
	    .toArray(function (err, items) {

		db.close();

		if (err) {
		    console.log(err); 
		    res.send(500); 
		    return; 
		}

		res.send(JSON.stringify(items));
	    });
    });
};

// app.get('/photos/imageid/:imageId', photos.photos_imageid);
exports.photos_imageid = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var photoId = req.params.imageId;

    MongoUtils.mongoConnectRunClose(function (db) {
	MongoUtils.photos(db)
	    .find({
		img: photoId
	    }, {})
	    .toArray(function (err, items) {

		db.close(); 

		if (err) {
		    console.log(err); 
		    res.send(500); 
		    return; 
		}

		res.send(JSON.stringify(items));
	    });
    });
};

// app.delete('/photos/imageid/:imageId', photos.delete_photos_imageid);
exports.delete_photos_imageid = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var photoId = req.params.imageId;

    MongoUtils.mongoConnectRunClose(function (db) {

	MongoUtils.photos(db)
	    .remove({
		img: ObjectID(photoId)
	    }, function (err) {
		if (err){
		    
		    db.close(); 
		    res.send(500); 
		    return;
		}

		var grid = new Grid(db, 'fs');
		
		grid.delete(ObjectID(photoId), function (err2) {
		    
		    db.close(); 
		    
		    if (err2) {
			console.log(err);
			res.send(500); 
			return; 
		    }
		});
		
		
		res.send('');
	    });	
    });
};



// app.get('/images/id/:imageId', photos.images_byid);
exports.images_byid = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var photoId = req.params.imageId;

    MongoUtils.mongoConnectRunClose(function (db) {

	var grid = new Grid(db, 'fs');

	grid.get(ObjectID(photoId), function (err, data) {

	    db.close(); 

	    if (err) {
		console.log(err);
		res.send(500); 
		return; 
	    }
	    
	    res.set('Content-Type', 'image/jpg');
	    res.send(data);
	});
    });
};

// app.get('/images/filename/:filename', photos.images_byfilename);
exports.images_byfilename = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var filename = req.params.filename;

    if (!filename) {
	res.send('');
    }

    MongoUtils.mongoConnectRunClose(function (db) {

	MongoUtils.files(db)
	    .findOne({
		filename: filename
	    }, {}, function (err, data) {

		if (err) {
		    db.close(); 
		    return; 
		}
		
		var grid = new Grid(db, 'fs');

		grid.get(data._id, function (err2, data2) {
		    
		    db.close();

		    if (err) {
			console.log(err); 
			res.send(500); 
			return; 
		    }
		    
		    res.set('Content-Type', 'image/jpg');
		    res.send(data2);
		});
	    });
    });
};

// post("/photos/upload") {
// app.get('/photos/upload', photos.upload);
exports.upload = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var index = 0;

    var filename = req.files['uploadfile'];

    var localPath = filename.path;

    fs.readFile(localPath, function (err, data) {
	if (err) throw err;

	var date = new Date();
	var dateString = date.getFullYear() + '' + date.getMonth() + '' + date.getDate();

	MongoUtils.mongoConnectRunClose(function (db) {

	    var grid = new Grid(db, 'fs');

	    grid.put(data, {
		content_type: 'image/jpg',
		filename: filename.name
	    }, function (err, fileInfo) {
		
		if (err) {
		    db.close(); 
		    console.log(err); 
		    res.send(500); 
		    return; 
		}

		var clean = filename.name.replace('(', '');

		clean = clean.replace(')', '');
		clean = clean.replace('Large', '');
		clean = clean.replace('.jpg', '');
		clean = clean.replace('.JPG', '');
		clean = clean.replace(/^\D+/g, '');

		var photoId = dateString + '' + parseInt(filename.name);

		var photo = {
		    date: new Date(),
		    comment: [{
			text: clean,
			author: req.user.username, 
			date : new Date()
		    }],
		    img: fileInfo._id,
		    filename: filename.name,
		    photoId: photoId
		};

		MongoUtils.photos(db).insert(photo, function (err) {

		    db.close(); 
		    res.redirect("/index.html#/telechargement");
		});
	    });
	});
    });
};

// app.post('/photos/comments', photos.comments);
exports.comments = function (req, res) {

    if (!req.isAuthenticated()) {
	res.send(401, '');
	return;
    }

    var body = req.body;

    var img = body.img;

    var comment = body.comment;

    MongoUtils.mongoConnectRunClose(function (db) {

	MongoUtils.photos(db)
	    .update({
		img: ObjectID(img)
	    }, {
		$addToSet: {
		    comment: {
			text: comment,
			author: req.user.username
		    }
		}
	    }, function () {
		
		db.close(); 
		res.send(200);
	    });
    });
};
