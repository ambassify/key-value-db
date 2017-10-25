# key-value-db

Providers persistent key-value storage.

## Backends

- [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
- Planned: [Redis](https://redis.io/)

## Usage

```sh
npm install --save @ambassify/key-value-db
```

```js
const { DYNAMODB, createKeyValueTable } = require('@ambassify/key-value-db');

const db = createKeyValueTable(DYNAMODB, {
    providerConfig: { region: 'eu-west-1' },
    table: 'my-key-value-table-name'
});

```

### Options

#### createKeyValueTable()

```js
const db = createKeyValueTable(options)
```

- `options`
  - `table` The table name used in the backing store
  - `keyColumn` The name of the column in which to store the key
  - `keyType` The type of the values in the `keyColumn` (string, binary, number, buffer). Defaults to `string`.
  - `valueColumn` The name of the column in which to store the value
  - `valueType` The type of the values in the `keyColumn` (string, binary, number, buffer). Defaults to `string`.
  - `ttl` The validity period of the record.

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
