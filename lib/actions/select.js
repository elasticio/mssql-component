/*eslint no-invalid-this: 0 no-console: 0*/
'use strict';
const eioUtils = require('elasticio-node').messages;
const co = require('co');
const cosql = require('co-mssql');

const LAST_POLL_PLACEHOLDER = "%%EIO_LAST_POLL%%";

let connection;

/**
 * This function will be called on component initialization
 *
 * @param cfg
 */
function init(cfg) {
    const conString = cfg.uri;
    return co(function* gen() {
        console.log('Connecting to the database');
        connection = new cosql.Connection(conString);
        connection.on('error', (err) => this.emit('error', err));
        yield connection.connect();
        console.log('Connection established');
    }.bind(this));
}

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg, snapshot) {
    const originalSql = cfg.query;
    const now = new Date().toISOString();
    // Last poll should come from Snapshot, if not it's beginning of time
    const lastPoll = snapshot?snapshot.lastPoll:null || new Date(0).toISOString();
    console.log('Last polling timestamp=%s', lastPoll);
    const sql = originalSql.split(LAST_POLL_PLACEHOLDER).join(lastPoll);
    console.log('Original query=%s', originalSql);
    console.log('Transformed query=%s', sql);
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
            this.emit('snapshot', {
                lastPoll: now
            });
            this.emit('end');
        });

        // Run it
        yield request.query(sql);
    }.bind(this));
}

module.exports.process = processAction;
module.exports.init = init;
