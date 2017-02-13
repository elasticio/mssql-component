/*eslint no-invalid-this: 0*/
'use strict';
const eioUtils = require('elasticio-node').messages;
const co = require('co');
const cosql = require('co-mssql');
const common = require('../common');

let connection;

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
    const sql = cfg.query;
    console.log('Executing query=%s', sql);
    return co(function* gen() {
      const request = new cosql.Request(connection);
      request.stream = true;

      request.on('recordset', (recordset) => {
        console.log('Have got recordset metadata=%j', recordset);
      });

      request.on('row', (row) => {
        this.emit('data', eioUtils.newMessageWithBody(row));
      });

      request.on('error', (err) => {
        this.emit('error', err);
      });

      request.on('done', (affected) => {
        console.log('Query execution completed, affected=%s', affected);
        this.emit('end');
      });

      // Run it
      yield request.query(sql);
    }.bind(this));
}

module.exports.process = processAction;
module.exports.init = common.init((con) => { connection = con});
