const {
    name: DYNAMODB,
    type: DynamoDBKeyValueTable
} = require('./dynamodb');

function createKeyValueTable(backend, backendOptions) {
    if (backend === DYNAMODB)
        return new DynamoDBKeyValueTable(backendOptions);

    throw new Error('Unknown backend for key-value table');
}

module.exports = {
    DYNAMODB,

    createKeyValueTable,

    DynamoDBKeyValueTable
};
