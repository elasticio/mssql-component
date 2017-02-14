'use strict';
const expect = require('chai').expect;
const insert = require('../lib/actions/insert');
const select = require('../lib/actions/select');
const EventEmitter = require('events');

class TestEmitter extends EventEmitter {

  constructor() {
    super();
    this.data = [];
    this.end = 0;
    this.error = [];

    this.on('data', (value) => this.data.push(value));
    this.on('error', (value) => this.error.push(value));
    this.on('end', () => this.end++);
  }

}


describe('Integration test', () => {


  before(() => {
    if (!process.env.MSSQL_URL) throw new Error("Please set MSSQL_URL env variable to proceed");
  });

  describe('for INSERT', () => {

    let emitter;

    const cfg = {
      uri : process.env.MSSQL_URL,
      query: 'INSERT INTO Test2.dbo.Tweets (Lang, Retweeted, Favorited, "Text", id, CreatedAt, Username, ScreenName) '
      + 'VALUES (@lang:string, @retweeted:boolean, @favorited:boolean, @text:string, @id:bigint, @created_at:date, @username:string, @screenname:string)'
    };

    before(() => {
      return insert.init(cfg);
    });

    it('should insert data', () => {
      const emitter = new TestEmitter();
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
      return insert.process.call(emitter, msg).then((result) => {
        expect(result).deep.equal(msg);
        expect(emitter.data.length).to.equal(0);
        // promises, no need to emit end
        expect(emitter.end.length).to.equal(0);
        expect(emitter.error.length).to.equal(0);
      });
    });
  })

});
