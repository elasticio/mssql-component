/*eslint no-invalid-this: 0 no-console: 0*/
'use strict';
const co = require('co');
const cosql = require('co-mssql');

let pstmt;

const VARS_REGEXP = /@([\w_$][\d\w_$]*:(string|boolean|date|number|bigint))/g;

function init(cfg) {
    const conString = cfg.uri;
    return co(function* gen() {
        console.log('Connecting to the database uri=%s', conString);
        const connection = new cosql.Connection(conString);
        let sql = cfg.query;
        yield connection.connect();
        console.log('Preparing query=%s', sql);
        const vars = sql.match(VARS_REGEXP);
        console.log('Found following prepared variable:type pairs=%j', vars);
        pstmt = new cosql.PreparedStatement(connection);
        for (const tuple of vars) {
            const [placeholder,type] = tuple.split(':');
            const name = placeholder.substr(1);
            switch (type) {
                case 'string':
                    pstmt.input(name, cosql.NVarChar);
                    break;
                case 'number':
                    pstmt.input(name, cosql.Int);
                    break;
                case 'boolean':
                    pstmt.input(name, cosql.Bit);
                    break;
                case 'date':
                    pstmt.input(name, cosql.DateTime2);
                    break;
                case 'bigint':
                    pstmt.input(name, cosql.BigInt);
                    break;
                default:
                    console.log('WARNING: Can figure out the type key=%s type=%s', name, type);
            }
            // Now let's remove all :string :boolean :date etc to the name only
            sql = sql.replace(tuple,placeholder);
        }
        console.log('Resulting SQL=%s', sql);
        yield pstmt.prepare(sql);
        console.log('Preparing statement created');
    });
}

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg) {
    return co(function* gen() {
        console.log('Executing statement');
        yield pstmt.execute(msg.body);
        console.log('Execution completed');
        return msg;
    }.bind(this));
}

module.exports.process = processAction;
module.exports.init = init;
