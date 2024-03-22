/* jshint node: true */
/* jshint esnext: true */
"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const logger = require('morgan');
require('dotenv').config();

const app = express();

//routes
const apiIndex = require('./routes/index');
const apiAwsPay = require('./routes/awsPay')
const apiAuhtorization = require('./routes/authorization')

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, username, password, companyid, plantId, BusinessUnitId, teamId, userId, accesstokenidp, access_token_idp, filename, compression, apikey, clientid, cognitoauthentication"
  );
  res.header(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(
  logger("combined", {
    skip: (req) => {
      return req.originalUrl === "/";
    },
  })
);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/index/', apiIndex);
app.use('/api/v1/awsPay', apiAwsPay);
app.use('/api/v1/auhtorization', apiAuhtorization)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;