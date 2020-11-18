/* eslint-disable no-restricted-syntax */
const co = require('co');
const cosql = require('co-mssql');
const logger = require('@elastic.io/component-logger')();

let pstmt;

const VARS_REGEXP = /@([\w_$][\d\w_$]*(:(string|boolean|date|number|bigint|float|real|money))?)/g;

/**
 * This function will be called during component intialization
 *
 * @param cfg
 * @returns {Promise}
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
  logger.debug('Connection string is created');
  return co(function* gen() {
    logger.info('Connecting to the database');
    const connection = new cosql.Connection(conString);
    // Always attach an error listener
    connection.on('error', err => this.emit('error', err));
    let sql = cfg.query;
    yield connection.connect();
    logger.info('Connection established');
    logger.debug('Preparing query...');
    const vars = sql.match(VARS_REGEXP);
    logger.trace('Found following prepared variable:type pairs=%j', vars);
    pstmt = new cosql.PreparedStatement(connection);
    for (const tuple of vars) {
      const [placeholder, type] = tuple.split(':');
      const name = placeholder.substr(1);
      switch (type) {
        case undefined:
        case 'string':
          pstmt.input(name, cosql.NVarChar);
          break;
        case 'number':
          pstmt.input(name, cosql.Int);
          break;
        case 'float':
          pstmt.input(name, cosql.Float);
          break;
        case 'real':
          pstmt.input(name, cosql.Real);
          break;
        case 'boolean':
          pstmt.input(name, cosql.Bit);
          break;
        case 'money':
          pstmt.input(name, cosql.Money);
          break;
        case 'date':
          pstmt.input(name, cosql.DateTime2);
          break;
        case 'bigint':
          pstmt.input(name, cosql.BigInt);
          break;
        default:
          logger.warn('WARNING: Can figure out the type key=%s type=%s', name, type);
      }
      // Now let's remove all :string :boolean :date etc to the name only
      sql = sql.replace(tuple, placeholder);
    }
    logger.trace('Resulting SQL is ready');
    yield pstmt.prepare(sql);
    logger.info('Preparing statement created');
  }.bind(this));
}

/**
 * This function will be called to fetch metamodel for SQL query
 *
 * @param cfg
 */
function getMetaModel(cfg, cb) {
  const sql = cfg.query;
  const result = {
    in: {
      type: 'object',
      properties: {},
    },
    out: {},
  };
  if (sql && sql.length > 0) {
    const vars = sql.match(VARS_REGEXP);
    const fields = result.in.properties;
    for (const tuple of vars) {
      const [key, type] = tuple.split(':');
      let jsType = 'string';
      switch (type) {
        case 'date':
          jsType = 'string';
          break;
        case 'bigint':
          jsType = 'number';
          break;
        case 'real':
          jsType = 'number';
          break;
        case 'float':
          jsType = 'number';
          break;
        case 'money':
          jsType = 'number';
          break;
        default:
          jsType = 'string';
      }
      fields[key.substr(1)] = {
        type: jsType,
      };
    }
  }
  cb(null, result);
}

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg) {
  const that = this;
  return co(function* gen() {
    that.logger.info('Executing statement');
    yield pstmt.execute(msg.body);
    that.logger.info('Execution completed');
    return msg;
  });
}

module.exports.process = processAction;
module.exports.init = init;
module.exports.getMetaModel = getMetaModel;
