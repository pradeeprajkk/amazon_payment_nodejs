/* jshint node: true */
/* jshint esnext: true */
"use strict";

const express = require('express');
const router = express.Router();

/**
 *  GET home page. 
 * @param req Contains the request object.
 * @param res Contains the response object.
 * */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

module.exports = router;
