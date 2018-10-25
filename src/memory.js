function noop () {}

class MemoryKeyValueTable {

    constructor(options = {}) {
        const {
            serializer = JSON.stringify,
            deserializer = JSON.parse,
            ttl = 0
        } = options;

        this._db = new Map();
        this.ttl = ttl;
        this.serialize = serializer;
        this.deserialize = deserializer;
    }

    set(key, rawValue, ttl = this.ttl) {
        const expires = ttl ? Date.now() + ttl : undefined;

        return Promise.resolve()
            .then(() => this.serialize(rawValue))
            .then(value => this._db.set(key, { value, expires }))
            .then(noop);
    }

    incr(key, amount = 1, ttl = this.ttl) {
        return Promise.resolve(this.get(key))
            .then(value => {
                if (isNaN(value))
                    throw new TypeError('Not a number');

                return this.set(key, parseFloat(value) + amount, ttl);
            });
    }

    remove(key) {
        this._db.delete(key);
        return Promise.resolve();
    }

    get(key) {
        return Promise.resolve()
            .then(() => this._db.get(key))
            .then(data => {
                if (!data)
                    return;

                const { expires, value } = data;

                if (typeof expires === 'number' && Date.now() > expires) {
                    this._db.delete(key);
                    return;
                }

                return this.deserialize(value);
            });
    }
}

module.exports = {
    name: 'memory',
    type: MemoryKeyValueTable
};
