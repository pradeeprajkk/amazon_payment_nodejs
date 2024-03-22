/* jshint node: true */
/* jshint esnext: true */
"use strict";

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

class SCAuthorization {

    /**
     * Get Auhtorization(JWT) Token
     */
    async getAuthorizationToken() {
        const token = jwt.sign({ data: "awspayment"}, process.env.secret, { expiresIn: '1h' });
        return token;
    }
}

module.exports = SCAuthorization;