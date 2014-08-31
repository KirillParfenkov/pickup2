var MongoClient = require('mongodb').MongoClient,
	nconf = require('nconf'),
	ObjectID = require('mongodb').ObjectID;
nconf.argv().env().file({file: './config.json'});

module.exports = function() {

	var ROUT_TABLE = "routs";

	return {

		conf : {
			host : nconf.get('db:host'),
			name : nconf.get('db:name'),
			port : nconf.get('db:port')
		},

		db : null,

		connect : function( finish ) {

			var conf = this.conf;
			var dao = this;

			MongoClient.connect('mongodb://' + conf.host + ':' +  conf.port + '/' + conf.name, function( err, db ) {
				//if (err) throw err;
				dao.db = db;
				finish( err );
			});
		},

		getById : function( routId, finish ) {
			var dao = this;
			var collection = this.db.collection( ROUT_TABLE );
			collection.findOne({_id: new ObjectID( routId )}, {userId : true, points : true, time: true, info: true}, function( err, rout ) {
				finish( err, rout );
			});
		},

		insert : function( user, finish ) {
			finish( user );
		},

		update : function( user, finish ) {
			finish( user );
		},

		delete : function( user, finish ) {
			finish();
		},

		getList : function( finish ) {
			var collection = this.db.collection( ROUT_TABLE );
			collection.find().toArray(function(err, results) {
				finish( err, results );	
			});
		},

		close : function() {
			dao.db.close();
		}
	}
}