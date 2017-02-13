# mssql-component [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> elastic.io integration component for Microsoft SQL Server

# mssql-component
MSSQL Component component for the [elastic.io platform](http://www.elastic.io &#34;elastic.io platform&#34;)

![image](https://cloud.githubusercontent.com/assets/56208/22904377/89b611c4-f23c-11e6-8b5d-783d62cf5caf.png)


## Before you Begin

Before you can deploy any code into elastic.io **you must be a registered elastic.io platform user**. Please see our home page at [http://www.elastic.io](http://www.elastic.io) to learn how. 

## Getting Started


## Authentication

You may use following URI:

```
mssql://username:password@localhost/INSTANCE/database?encrypt=true&domain=DOMAIN&driver=msnodesqlv8
```

more infromation and samples you can find [here](https://www.npmjs.com/package/mssql#formats)


## Configure OAuth Client key/secret

In the component repository you need to specify OAuth Client credentials as environment variables. You would need two variables

 * ```XXX_KEY``` - your OAuth client key
 * ```XXX_SECRET``` - your OAUth client secret
 
## Known issues

No known issues are there yet.
* For INSERT/UPDATE/DELETE action 
** Incoming message body should only contain simple types, e.g. ``body.foo`` or 
``body.bar`` nested obejct/values like ``body.foo.bar`` are not supported yet.
** You have to make sure that all of your incoming messages have values referenced from the statement and they
all have similar structure. For example if you have a query ``insert into foo (a,b,c) values (@a,@b,@c)`` then
all incoming messages should at least have ``a``, ``b`` and ``c`` defined in the body 


## License

Apache-2.0 © [elastic.io GmbH](https://www.elastic.io)


[npm-image]: https://badge.fury.io/js/mssql-component.svg
[npm-url]: https://npmjs.org/package/mssql-component
[travis-image]: https://travis-ci.org/elasticio/mssql-component.svg?branch=master
[travis-url]: https://travis-ci.org/elasticio/mssql-component
[daviddm-image]: https://david-dm.org/elasticio/mssql-component.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elasticio/mssql-component
