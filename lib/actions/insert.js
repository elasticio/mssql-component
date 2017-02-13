/*eslint no-invalid-this: 0*/
'use strict';
const eioUtils = require('elasticio-node').messages;
const co = require('co');
const common = require('../common');
const cosql = require('co-mssql');

let connection, pstmt;

const VARS_REGEXP = /(@[\w_$][\d\w_$]*)/g;

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
  const sql = cfg.query;
  console.log('Will execute query=%s', sql);
  const vars = sql.match(VARS_REGEXP);
  const keys = Object.keys(msg.body);
  console.log('Found following prepared statement variables=%j', vars);
  console.log('Found following keys on the message.body=%j', keys);
  return co(function* gen() {
    if (!pstmt) {
      console.log('Constructing prepared statement sql=%s', sql);
      pstmt = new cosql.PreparedStatement(connection);
      for(const key of keys) {
        //pstmt.input(key, msg.body[key]);
        pstmt.input(key, cosql.Int);
      }
      yield pstmt.prepare(sql);
      console.log('Completed preparing statement');
    }
    pstmt.on('recordset', (r) => console.log(r));
    console.log('Executing statement completed');
    yield pstmt.execute(msg.body);
    console.log('Execution completed');
    this.emit('data', msg);
    this.emit('end');
  }.bind(this));
}

module.exports.process = processAction;
module.exports.init = common.init((con) => { connection = con});
