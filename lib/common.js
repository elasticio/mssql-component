'use strict';
const eioUtils = require('elasticio-node').messages;
const co = require('co');
const cosql = require('co-mssql');

/**
 * This function will be called on component initialization
 *
 * @param cfg
 */
function init(callback) {
  return function initConnection(cfg) {
    const conString = cfg.uri;
    return co(function* gen() {
      console.log('Connecting to the database uri=%s', conString);
      const connection = new cosql.Connection(conString);
      yield connection.connect();
      callback(connection);
    });
  }
}

module.exports.init = init;
