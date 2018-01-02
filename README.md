# key-value-db

Providers persistent key-value storage.

## Backends

- [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
- [Redis](https://redis.io/)

## Usage

```sh
npm install --save @ambassify/key-value-db
```

```js
const { DYNAMODB, REDIS, createKeyValueTable } = require('@ambassify/key-value-db');

const dynamodb = createKeyValueTable(DYNAMODB, {
    providerConfig: { region: 'eu-west-1' },
    table: 'my-key-value-table-name'
});

const redis = createKeyValueTable(REDIS, {
    connectionString: 'redis://127.0.0.1:6379',
    ioredisOptions: { connectTimeout: 1000 }
});

```

### Options

All backends support these options:

- `ttl`: Default time-to-live in milliseconds for every operation that supports it

#### DYNAMODB

```js
const db = createKeyValueTable(DYNAMODB, options)
```

- `options`
  - `providerConfig` Object to pass along to `aws-sdk/clients/dynamodb`
  - `table` The table name used in the backing store
  - `keyColumn` The name of the column in which to store the key
  - `keyType` The type of the values in the `keyColumn` (string, binary, number, buffer). Defaults to `string`.
  - `valueColumn` The name of the column in which to store the value
  - `valueType` The type of the values in the `keyColumn` (string, binary, number, buffer). Defaults to `string`.

#### REDIS

```js
const db = createKeyValueTable(REDIS, options)
```

- `options`
  - `connectionString` [redis:// connection string](http://www.iana.org/assignments/uri-schemes/prov/redis)
  - `ioredisOptions` Options to pass along to [ioredis](https://github.com/luin/ioredis)

### API

#### .set()

```js
db.set(key, value, [ttl])
```

Sets the specified `value` at the specified `key`, overwriting any existing data at `key`.

#### .incr()

```js
db.incr(key, amount, [ttl])
```

Increments the value at the specified `key` with `amount` in a single operation. Depending on the used backend this operation is atomic.

- `amount` can be any positive or negative number.

#### .remove()

```js
db.remove(key)
```

Removes the record with `key` from the database.

#### .get()

```js
db.get(key)
```

Returns the value at `key` or `null` if the key does not exist.

## Contribute

We really appreciate any contribution you would like to make, so don't
hesitate to report issues or submit pull requests.

## License

This project is released under a MIT license.

## About us

If you would like to know more about us, be sure to have a look at [our website](https://www.ambassify.com), or our Twitter accounts [Ambassify](https://twitter.com/Ambassify), [Sitebase](https://twitter.com/Sitebase), [JorgenEvens](https://twitter.com/JorgenEvens)
