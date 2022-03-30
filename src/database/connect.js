const mongo = require("mongodb").MongoClient;

const { DB_URL } = require("../config/config");

let server = null;

const connect = (callback) => {
  mongo.connect(DB_URL, { useUnifiedTopology: true }, (err, db) => {
    if (err) {
      console.log(err);
      console.log("error connecting to database");
    } else {
      console.log("connected to database");
      server = db;
      callback();
    }
  });
};

function collection(value) {
  return server.db().collection(value);
}

function close() {
  server.close();
}

module.exports = {
  connect,
  collection,
  close,
};
