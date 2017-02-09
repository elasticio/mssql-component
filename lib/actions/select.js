'use strict';
const eioUtils = require('elasticio-node').messages;
const co = require('co');
const cosql = require('co-mssql');

let connection;

/**
 * This function will be called on component initialization
 *
 * @param cfg
 */
function init(cfg) {
  const conString = cfg.uri;
  return co(function* gen() {
    console.log('Connecting to the database uri=%s', conString);
    connection = new cosql.Connection(conString);
    yield connection.connect();
  });
}

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
  const sql = cfg.query;
  const isBatch = cfg.batch || false;
  return co(function*() {
    const request = new sql.Request(connection);
    request.stream = true;

    request.on('row', (row) => {
      this.emit('data', eioUtils.newMessageWithBody(row));
    });

    request.on('error', (err) => {
      this.emit('error', err);
    });

    request.on('done', (affected) => {
      console.log('Fetching done, affected=%s', affected);
      this.emit('end');
    });
    // Run it
    request.query(sql);
  }.bind(this));
}

module.exports.process = processAction;
