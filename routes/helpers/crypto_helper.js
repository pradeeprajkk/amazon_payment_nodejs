/* jshint node: true */
/* jshint esnext: true */
"use strict";

const crypto = require('crypto');


class CryptoHelper {

    /**
     * Calcualte Signature
     */
    async calculate(unsorted_dict, sha_phrase, sha_method = 'sha256') {
        const sorted_keys = Object.keys(unsorted_dict).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const sorted_dict = sorted_keys.reduce((acc, key) => {
            acc[key] = unsorted_dict[key];
            return acc;
        }, {});

        const result = Object.entries(sorted_dict).map(([k, v]) => `${k}=${v}`).join('');

        const result_string = `${sha_phrase}${result}${sha_phrase}`;

        const signature = crypto.createHash(sha_method).update(result_string).digest('hex');
        return signature;
    }

    /**
     * generateSignature using private key
     */
    async generateSignature(params, privateKey) {
        const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
        const signature = crypto.createHmac('sha256', privateKey).update(sortedParams).digest('hex');

        return signature;
    }

}

module.exports = CryptoHelper;