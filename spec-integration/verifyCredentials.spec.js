const fs = require('fs');
const { expect } = require('chai');
const logger = require('@elastic.io/component-logger')();
const verifyCredentials = require('../verifyCredentials');

describe('Integration test verify credentials', () => {
  if (fs.existsSync('.env')) {
    // eslint-disable-next-line global-require
    require('dotenv').config();
  }
  before(() => {
    if (!process.env.MSSQL_USERNAME) { throw new Error('Please set MSSQL_USERNAME env variable to proceed'); }
    if (!process.env.MSSQL_PASSWORD) { throw new Error('Please set MSSQL_PASSWORD env variable to proceed'); }
    if (!process.env.MSSQL_SERVER) { throw new Error('Please set MSSQL_SERVER env variable to proceed'); }
    if (!process.env.MSSQL_DATABASE) { throw new Error('Please set MSSQL_DATABASE env variable to proceed'); }
  });
  const cfg = {
    username: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER,
    port: process.env.MSSQL_PORT,
    instance: process.env.MSSQL_INSTANCE,
    database: process.env.MSSQL_DATABASE,
    domain: process.env.MSSQL_DOMAIN,
    encrypt: process.env.MSSQL_ENCRYPT,
  };

  it('should successfully verify credentials', (done) => {
    verifyCredentials.call({ logger }, cfg, (err, result) => {
      if (err) {
        done(err);
      }
      expect(result).deep.equal({ verified: true });
      done();
    });
  });
});
