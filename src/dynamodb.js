const DynamoDB = require('aws-sdk/clients/dynamodb');

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

        this._db = new DynamoDB(providerConfig);

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
        return ttl > 0 ? Date.now() + ttl : 0;
    }

    set(key, value, ttl = this.ttl) {
        const expiryDate = this._getExpiryDate(ttl);

        const item = {
            TableName: this.table,
            Item: this._buildKeyValue(key, value, expiryDate)
        };

        return this._db.putItem(item)
            .promise()
            .then(noop);
    }

    incr(key, amount = 1, ttl = this.ttl) {
        const expiryDate = this._getExpiryDate(ttl);

        return this._db.updateItem({
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
        }).promise();
    }

    remove(key) {
        return this._db.deleteItem({
            TableName: this.table,
            Key: this._buildColumnValue(this.key.column, this.key.type, key)
        }).promise().then(noop);
    }

    get(key) {
        const item = {
            TableName: this.table,
            Key: this._buildColumnValue(this.key.column, this.key.type, key)
        };

        return this._db.getItem(item)
            .promise()
            .then(({ Item }) => {
                if (!Item)
                    return Item;

                const expiryColumn = Item[this.expiry.column];
                const expiryDate = expiryColumn ? expiryColumn[this.expiry.type] : 0;
                if (expiryDate > 0 && expiryDate < Date.now())
                    return null;

                return Item[this.value.column][this.value.type];
            });
    }
}

module.exports = {
    name: 'dynamodb',
    type: DynamoDBKeyValueTable
};
