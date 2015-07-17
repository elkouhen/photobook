'use strict'; 

var MongoClient = require('mongodb').MongoClient;

var mongo_url = 'mongodb://localhost:27017/photobook';

exports.photos = function (db) {
    return db.collection('photos');
};

exports.users = function (db) {
    return db.collection('comptes');
};

exports.files = function (db) {
    return db.collection('fs.files');
};

exports.gridfs = function (db) {
    return db.gridfs;
};

exports.mongoConnectRunClose = function (callback) {
    MongoClient.connect(mongo_url, function (err, db) {
        if (err) {
            console.log(err);
        } else {
            callback(db);
        }
    });
};