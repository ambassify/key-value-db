const {
    name: DYNAMODB,
    type: DynamoDBKeyValueTable
} = require('./dynamodb');

const {
    name: REDIS,
    type: RedisKeyValueTable
} = require('./redis');

const {
    name: MEMORY,
    type: MemoryKeyValueTable
} = require('./memory');

function createKeyValueTable(backend, backendOptions) {
    if (backend === DYNAMODB)
        return new DynamoDBKeyValueTable(backendOptions);

    if (backend === REDIS)
        return new RedisKeyValueTable(backendOptions);

    if (backend === MEMORY)
        return new MemoryKeyValueTable(backendOptions);

    throw new Error('Unknown backend for key-value table');
}

module.exports = {
    DYNAMODB,
    REDIS,
    MEMORY,

    createKeyValueTable,

    DynamoDBKeyValueTable,
    RedisKeyValueTable,
    MemoryKeyValueTable,
};
