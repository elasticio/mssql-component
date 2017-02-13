# mssql-component [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> elastic.io integration component for Microsoft SQL Server

# mssql-component
MSSQL Component component for the [elastic.io platform](http://www.elastic.io &#34;elastic.io platform&#34;)

![image](https://cloud.githubusercontent.com/assets/56208/22904377/89b611c4-f23c-11e6-8b5d-783d62cf5caf.png)


## Before you Begin

Before you can deploy any code into elastic.io **you must be a registered elastic.io platform user**. Please see our home page at [http://www.elastic.io](http://www.elastic.io) to learn how. 

## Getting Started

### Authentication

You may use following URI:

```
mssql://username:password@localhost:1433/database?encrypt=true
```

other types of configuration parameters are also supported, more infromation and samples you can find [here](https://www.npmjs.com/package/mssql#formats)

### SELECT Trigger and Action

With this action you may fetch data out of the database, e.g. using ``SELECT`` statement. 
This trigger & action has no limitations on the number of rows so you may expect to get all of these
via sequential fetching that is implemented within the node.js ``mssql`` driver.

### INSERT/DELETE/UPDATE Action

![image](https://cloud.githubusercontent.com/assets/56208/22904204/cef8cb06-f23b-11e6-998f-3fe65ab81540.png)

You may use this action to do the operations that are not producing output rows but do the database manipulations, 
e.g. ``INSERT``, ``UPDATE`` or ``DELETE`` statements. Internally we use prepared statements, so all incoming data is
validated against SQL injetion, however we had to build a connection from JavaSscript types to the MSSQL data types
therefore when doing a prepared statements you would need to add ``:type`` to **each prepared statement variable**.

For example if you have a following SQL statement:

```sql
INSERT INTO 
  Test2.dbo.Tweets 
(Lang, "Text", id, CreatedAt, Username, ScreenName) 
VALUES 
(@lang, @text, @id, @created_at, @username, @screenname)
```

you should add ``:type`` to each ``@parameter`` so your SQL query will looks like this:

```sql
INSERT INTO 
  Test2.dbo.Tweets 
(Lang, "Text", id, CreatedAt, Username, ScreenName) 
VALUES 
(@lang:string, @text:string, @id:bigint, @created_at:date, @username:string, @screenname:string)
```

Following types are supported:
 * ``string``
 * ``number``
 * ``bigint``
 * ``boolean`` (will be converted to MSSQL ``bit``)
 * ``date``

more details can be found [here](https://github.com/elasticio/mssql-component/blob/master/lib/actions/insert.js#L25)

After prepared statement is created and filled with parameters, query will be executed in scope of message body, so that ``msg.body.foo`` will be used to fill ``@foo`` parameter on prepared statement.

## Known issues

No known issues are there yet.
* For INSERT/UPDATE/DELETE action 
** Incoming message body should only contain simple types, e.g. ``body.foo`` or 
``body.bar`` nested obejct/values like ``body.foo.bar`` are not supported yet.


## License

Apache-2.0 © [elastic.io GmbH](https://www.elastic.io)


[npm-image]: https://badge.fury.io/js/mssql-component.svg
[npm-url]: https://npmjs.org/package/mssql-component
[travis-image]: https://travis-ci.org/elasticio/mssql-component.svg?branch=master
[travis-url]: https://travis-ci.org/elasticio/mssql-component
[daviddm-image]: https://david-dm.org/elasticio/mssql-component.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elasticio/mssql-component
