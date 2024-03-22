/* jshint node: true */
/* jshint esnext: true */
"use strict";

const express = require('express');
const router = express.Router();
const checkJwt = require('./jwtCheckConfig');
const SCAwsPay = require('./controllers/secondaryControllers/SCAwsPay');


/**
 * GET GenerateSignature
 * @param req Contains the request object.
 * @param res Contains the response object.
 * */
// router.get('/generateSignature', checkJwt, async (req, res, next) => {
//   try {
//     let data = await new SCAwsPay().generateSignatureButton();
//     res.status(200).send({ "message": "Success", data });
//   } catch(e) {
//     errorHandler(e, req, res);
//   }
// });


/** 
 * Authorize
 * @param req Contains the request object.
 * @param res Contains the response object.
*/
router.post('/generateSignaturePayFort', /*checkJwt,*/ async (req, res, next) => {
  try {
    let data = await new SCAwsPay().generateSignaturePayFort(req.body);
    res.status(200).send({ "message": "Success", data});  
  } catch (e) {
    errorHandler(e, req, res);
  }
});

/**
 * PayFort Purchase
 * @param req Contains the request object.
 * @param res Contains the response object.
 */
router.post('/purchasePayFort', /*checkJwt,*/ async (req, res, next) => {
  try {
    let result = await new SCAwsPay().purchasePayFort(req.body);
    res.status(200).send({ "message": "Success", data: result});
  } catch (e) {
    errorHandler(e, req, res);
  }
});

router.post('/applePaySession', async (req, res, next) => {
  try {
    let result = await new SCAwsPay().validateSessiont(req.body);
    res.status(200).send({ "message": "Success", data: result});
  } catch (e) {
    errorHandler(e, req, res);
  }
});


function errorHandler(e, req, res) {
  console.log({ exception: e, headers: req.headers, body: req.body });
  res.status(500).send({ status: false, data: [], ...e });
}



module.exports = router;