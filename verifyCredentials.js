'use strict';
const co = require('co');
const sql = require('co-mssql');

// This function will be called by the platform to verify credentials
module.exports = function verifyCredentials(credentials, cb) {
  console.log('Credentials passed for verification %j', credentials);
  co(function*() {
    console.log('Connecting to the database');
    var connection = new sql.Connection(credentials.uri);
    yield connection.connect();
    console.log('Verification completed successfully');
    yield connection.close();
    cb(null, {verified: true});
  }).catch(err => {
    console.log('Error occurred', err.stack || err);
    cb(err , {verified: false});
  });
};
