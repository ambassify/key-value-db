const Redis = require('ioredis');

const noop = function() {};

class RedisKeyValueTable {
    constructor(options = {}) {
        const {
            connectionString,
            ioredisOptions = {},
            ttl = 0
        } = options;

        this._db = new Redis(connectionString, ioredisOptions);
        this.ttl = ttl;
    }

    set(key, value, ttl = this.ttl) {
        const args = [ key, value ];

        if (ttl)
            args.push('PX', ttl);

        return this._db.set(...args).then(noop);
    }

    incr(key, amount = 1, ttl = this.ttl) {
        if (ttl) {
            return this._db.multi()
                .incrby(key, amount)
                .pexpire(key, ttl)
                .exec()
                // results looks like this:
                // [ [ incrErr, incrResult ], [ expireErr, expireResult ] ]
                .then(results => results.shift().pop());
        } else {
            return this._db.incrby(key, amount);
        }
    }

    remove(key) {
        return this._db.del(key).then(noop);
    }

    get(key) {
        return this._db.get(key);
    }
}

module.exports = {
    name: 'redis',
    type: RedisKeyValueTable
};
