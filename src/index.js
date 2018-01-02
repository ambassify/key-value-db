const {
    name: DYNAMODB,
    type: DynamoDBKeyValueTable
} = require('./dynamodb');

const {
    name: REDIS,
    type: RedisKeyValueTable
} = require('./redis');

function createKeyValueTable(backend, backendOptions) {
    if (backend === DYNAMODB)
        return new DynamoDBKeyValueTable(backendOptions);

    if (backend === REDIS)
        return new RedisKeyValueTable(backendOptions);

    throw new Error('Unknown backend for key-value table');
}

module.exports = {
    DYNAMODB,
    REDIS,

    createKeyValueTable,

    DynamoDBKeyValueTable,
    RedisKeyValueTable
};
