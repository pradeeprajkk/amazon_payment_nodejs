/* jshint node: true */
/* jshint esnext: true */
"use strict";

const express = require('express');
const router = express.Router();
const SCAuthorization = require('./controllers/secondaryControllers/SCAuthorization');


/**
 * Get Authorization(JWT) Token
 * @param req Contains the request object.
 * @param res Contains the response object.
 */
router.get('/token', async (req, res, next) => {
    try {
        const _dataResult = await new SCAuthorization().getAuthorizationToken();
        res.status(200).send({ status: true, message: 'success', data: _dataResult });
    } catch(e) {
        errorHandler(e, req, res);
    }
});

function errorHandler(e, req, res) {
    console.log({ exception: e, headers: req.headers, body: req.body });
    res.status(e.httpCode || 500).send({ status: false, data: [], ...e });
}

module.exports = router;