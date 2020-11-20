const eioUtils = require('elasticio-node').messages;
const co = require('co');
const cosql = require('co-mssql');
const logger = require('@elastic.io/component-logger')();

const LAST_POLL_PLACEHOLDER = '%%EIO_LAST_POLL%%';

let connection;

/**
 * This function will be called on component initialization
 *
 * @param cfg
 */
function init(cfg) {
  const conString = `mssql://${
    encodeURIComponent(cfg.username)
  }:${
    encodeURIComponent(cfg.password)
  }@${
    cfg.server
  }${(cfg.port) ? `:${cfg.port}` : ''
  }${(cfg.instance) ? `/${cfg.instance}` : ''
  }/${
    cfg.database
  }${(cfg.domain) ? `?domain=${cfg.domain}&encrypt=${cfg.encrypt}`
    : `?encrypt=${cfg.encrypt}`}`;
  return co(function* gen() {
    logger.info('Connecting to the database');
    connection = new cosql.Connection(conString);
    connection.on('error', err => this.emit('error', err));
    yield connection.connect();
    logger.info('Connection established');
  }.bind(this));
}

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg, snapshot = {}) {
  const originalSql = cfg.query || msg.body.query;
  const now = new Date().toISOString();
  // Last poll should come from Snapshot, if not it's beginning of time
  const lastPoll = snapshot.lastPoll || new Date(0).toISOString();
  this.logger.info('Last polling timestamp=%s', lastPoll);
  const sql = originalSql.split(LAST_POLL_PLACEHOLDER).join(lastPoll);
  this.logger.debug('Transformed query is ready');
  const that = this;
  return co(function* gen() {
    const request = new cosql.Request(connection);
    request.stream = true;

    request.on('recordset', () => {
      that.logger.trace('Have got recordset metadata');
    });

    request.on('row', (row) => {
      this.emit('data', eioUtils.newMessageWithBody(row));
    });

    request.on('error', (err) => {
      this.emit('error', err);
    });

    request.on('done', (affected) => {
      that.logger.info('Query execution completed, affected=%s', affected);
      this.emit('snapshot', {
        lastPoll: now,
      });
      this.emit('end');
    });

    // Run it
    yield request.query(sql);
  }.bind(this));
}

module.exports.process = processAction;
module.exports.init = init;
