const co = require('co');
const sql = require('co-mssql');

// This function will be called by the platform to verify credentials
module.exports = function verifyCredentials(credentials, cb) {
  const self = this;
  self.logger.info('Starting credentials verification');
  co(function* () {
    self.logger.info('Connecting to the database');
    const uri = `mssql://${
      encodeURIComponent(credentials.username)
    }:${
      encodeURIComponent(credentials.password)
    }@${
      credentials.server
    }${(credentials.port) ? `:${credentials.port}` : ''
    }${(credentials.instance) ? `/${credentials.instance}` : ''
    }/${
      credentials.database
    }${(credentials.domain) ? `?domain=${credentials.domain}&encrypt=${credentials.encrypt}`
      : `?encrypt=${credentials.encrypt}`}`;
    const connection = new sql.Connection(uri);
    yield connection.connect();
    self.logger.info('Verification completed successfully');
    yield connection.close();
    cb(null, { verified: true });
  }).catch((err) => {
    self.logger.info('Error occurred, credentials are not valid');
    cb(err, { verified: false });
  });
};
