const expect = require('chai').expect;
const insert = require('../lib/actions/insert');
const select = require('../lib/actions/select');
const { messages } = require('elasticio-node');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

describe('Integration test', () => {

    before(() => {
        if (!process.env.MSSQL_USERNAME) {throw new Error('Please set MSSQL_USERNAME env variable to proceed');}
        if (!process.env.MSSQL_PASSWORD) {throw new Error('Please set MSSQL_PASSWORD env variable to proceed');}
        if (!process.env.MSSQL_SERVER) {throw new Error('Please set MSSQL_SERVER env variable to proceed');}
        if (!process.env.MSSQL_DATABASE) {throw new Error('Please set MSSQL_DATABASE env variable to proceed');}

    });
    after(() => {
        process.exit();
    });

    describe('for INSERT', () => {

        const cfg = {
            username: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            server: process.env.MSSQL_SERVER,
            port: process.env.MSSQL_PORT,
            instance: process.env.MSSQL_INSTANCE,
            database: process.env.MSSQL_DATABASE,
            domain: process.env.MSSQL_DOMAIN,
            encrypt: process.env.MSSQL_ENCRYPT,
            query: 'INSERT INTO Test2.dbo.Tweets (Lang, Retweeted, Favorited, "Text", id, '
            + 'CreatedAt, Username, ScreenName) '
            + 'VALUES (@lang, @retweeted:boolean, @favorited:boolean, @text:string, @id:bigint, '
            + '@created_at:date, @username, @screenname:string)'
        };
        before(() => insert.init(cfg));

        it('should insert data', () => {
            const emitter = sinon.stub();
            const msg = {
                body: {
                    lang: 'en',
                    retweeted: false,
                    favorited: false,
                    text: 'Hello integration testing',
                    id: 12345678910,
                    created_at: new Date().toISOString(),
                    username: 'Renat Zubairov',
                    screenname: 'zubairov'
                }
            };
            return insert.process.call({
                emit: emitter.emit,
                logger
            }, msg).then((result) => {
                expect(result).deep.equal(msg);
                expect(emitter.called).to.be.false;
            });
        });
    });

    describe('for SELECT', () => {

        const cfg = {
            username: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            server: process.env.MSSQL_SERVER,
            port: process.env.MSSQL_PORT,
            instance: process.env.MSSQL_INSTANCE,
            database: process.env.MSSQL_DATABASE,
            domain: process.env.MSSQL_DOMAIN,
            encrypt: process.env.MSSQL_ENCRYPT
        };

        before(() => select.init(cfg));

        it('should select data', (done) => {
            const emitter = sinon.stub();
            emitter.withArgs('end').callsFake(() => {
                expect(emitter.callCount).to.equal(12);
                expect(emitter.args[0][0]).to.equal('data');
                expect(emitter.args[10][0]).to.equal('snapshot');
                expect(emitter.args[11][0]).to.equal('end');
                done();
            });
            const msg = messages.newMessageWithBody({
                query: 'select * from Test2.dbo.Tweets ORDER BY id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;'
            });
            select.process.call({
                emit: emitter,
                logger
            }, msg, cfg).catch(err => done(err));
        });
    });

    describe('for legacy SELECT configuration', () => {

        const cfg = {
            username: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            server: process.env.MSSQL_SERVER,
            port: process.env.MSSQL_PORT,
            instance: process.env.MSSQL_INSTANCE,
            database: process.env.MSSQL_DATABASE,
            domain: process.env.MSSQL_DOMAIN,
            encrypt: process.env.MSSQL_ENCRYPT,
            query: 'select * from Test2.dbo.Tweets ORDER BY id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;'
        };

        before(() => select.init(cfg));

        it('should select data', (done) => {
            const emitter = sinon.stub();
            emitter.withArgs('end').callsFake(() => {
                expect(emitter.callCount).to.equal(12);
                expect(emitter.args[0][0]).to.equal('data');
                expect(emitter.args[10][0]).to.equal('snapshot');
                expect(emitter.args[11][0]).to.equal('end');
                done();
            });
            const msg = messages.newMessageWithBody({});
            select.process.call({
                emit: emitter,
                logger
            }, msg, cfg).catch(err => done(err));
        });
    });


    describe('for polling SELECT', () => {

        const cfg = {
            username: process.env.MSSQL_USERNAME,
            password: process.env.MSSQL_PASSWORD,
            server: process.env.MSSQL_SERVER,
            port: process.env.MSSQL_PORT,
            instance: process.env.MSSQL_INSTANCE,
            database: process.env.MSSQL_DATABASE,
            domain: process.env.MSSQL_DOMAIN,
            encrypt: process.env.MSSQL_ENCRYPT
        };

        before(() => select.init(cfg));

        it('should insert data', (done) => {
            const emitter = sinon.stub();
            emitter.withArgs('end').callsFake(() => {
                expect(emitter.args[0][0]).to.equal('data');
                expect(emitter.args[emitter.args.length - 1][0]).to.equal('end');
                done();
            });
            const msg = {
                body: {
                    query: 'select * from Leads where Created >= \'%%EIO_LAST_POLL%%\''
                }
            };
            select.process.call({
                emit: emitter,
                logger
            }, msg, cfg, {}).catch(err => done(err));
        });
    });
});
