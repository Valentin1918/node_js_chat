var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/node_js_chat';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  if(err) {throw err}

  console.log("Connected successfully to server");

  insertDocuments(db, function() {
    db.close();
  });
});


var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Remove a collection
  collection.remove({}, function(err, results){
    if(err) {throw err}

    collection.insert({a: 2}, function(err, docs) {
      var cursor = collection.find({a: 2});//method find return a cursor (object from where we can read the data). Cursor - "A pointer to the result set of a query. Clients can iterate through a cursor to retrieve results"
      cursor.toArray(function(err, result) {
        console.dir(result);
        callback(result);
      });
    });

    // Insert some documents
     /*collection.insertMany([
     {a : 1}, {a : 2}, {a : 3}
     ], function(err, result) {
     assert.equal(err, null);
     assert.equal(3, result.result.n);
     assert.equal(3, result.ops.length);
     console.log("Inserted 3 documents into the collection");
     callback(result);
     });*/

  });

};