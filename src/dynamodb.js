const {
    DynamoDBClient,
    PutItemCommand,
    UpdateItemCommand,
    DeleteItemCommand,
    GetItemCommand
} = require('@aws-sdk/client-dynamodb');

const noop = function() {};

const typeMap = {
    string: 'S',
    binary: 'B',
    number: 'N',
    buffer: 'B'
};

class DynamoDBKeyValueTable {
    constructor(options = {}) {
        const {
            providerConfig = {},
            table,

            keyColumn = 'key',
            keyType = 'string',

            valueColumn = 'value',
            valueType = 'string',

            ttl = 0
        } = options;

        this._db = new DynamoDBClient(providerConfig);

        this.ttl = ttl;
        this.table = table;

        this.key = {
            column: keyColumn,
            type: typeMap[keyType]
        };

        this.value = {
            column: valueColumn,
            type: typeMap[valueType]
        };

        this.expiry = {
            column: 'expires',
            type: typeMap['number']
        };
    }

    _buildColumnValue(column, type, value) {
        if (type == 'N' || type == 'S')
            value = value + '';

        return { [column]: { [type]: value } };
    }

    _buildKeyValue(key, value, expiryDate) {
        return Object.assign(
            this._buildColumnValue(this.key.column, this.key.type, key),
            this._buildColumnValue(this.value.column, this.value.type, value),
            this._buildColumnValue(this.expiry.column, this.expiry.type, expiryDate)
        );
    }

    _getExpiryDate(ttl = this.ttl) {
        ttl = parseInt(ttl, 10);

        if (ttl <= 0)
            return 0;

        return Math.floor((Date.now() + ttl) / 1000);
    }

    set(key, value, ttl = this.ttl) {
        const expiryDate = this._getExpiryDate(ttl);

        const command = new PutItemCommand({
            TableName: this.table,
            Item: this._buildKeyValue(key, value, expiryDate)
        });

        return this._db.send(command).then(noop);
    }

    incr(key, amount = 1, ttl = this.ttl) {
        const expiryDate = this._getExpiryDate(ttl);

        const command = new UpdateItemCommand({
            TableName: this.table,
            Key: this._buildColumnValue(this.key.column, this.key.type, key),
            AttributeUpdates: {
                [this.value.column]: {
                    Action: 'ADD',
                    Value: {
                        N: amount + ''
                    }
                },
                [this.expiry.column]: {
                    Action: 'PUT',
                    Value: {
                        N: expiryDate + ''
                    }
                }
            }
        });

        return this._db.send(command).then(noop);
    }

    remove(key) {
        const command = new DeleteItemCommand({
            TableName: this.table,
            Key: this._buildColumnValue(this.key.column, this.key.type, key)
        });

        return this._db.send(command).then(noop);
    }

    get(key) {
        const command = new GetItemCommand({
            TableName: this.table,
            Key: this._buildColumnValue(this.key.column, this.key.type, key)
        });

        return this._db.send(command)
            .then(({ Item }) => {
                if (!Item)
                    return Item;

                const expiryColumn = Item[this.expiry.column];
                let expiryDate = expiryColumn ? expiryColumn[this.expiry.type] : 0;

                /*
                 * At the time of writing an Epoch timestamp (ex. 1547198869)
                 * is 10 characters wide. Old code used to store the timestamp
                 * as milliseconds which we attempt to detect by checking if
                 * the expiryDate is larger than 9999999999 (ten 9's) which
                 * corresponds to Sun Apr 26 1970 18:46:39 GMT+0100 when viewed
                 * as milliseconds. It is VERY unlikely we would ever have a
                 * legitimate expiry before this date.
                 *
                 * We will reach the 9999999999 (ten 9's) timestamp in seconds
                 * by Sat Nov 20 2286 18:46:39 GMT+0100. We assume that this
                 * line will have been removed by that time and all legacy
                 * items have been removed from the database by the code below.
                 */
                if (expiryDate > 9999999999)
                    expiryDate = Math.floor(expiryDate / 1000);

                if (expiryDate > 0 && (expiryDate * 1000) < Date.now())
                    return this.remove(key).then(() => null);

                return Item[this.value.column][this.value.type];
            });
    }
}

module.exports = {
    name: 'dynamodb',
    type: DynamoDBKeyValueTable
};
