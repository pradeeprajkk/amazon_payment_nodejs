/* jshint node: true */
/* jshint esnext: true */
"use strict";

const jwt = require("jsonwebtoken");

const jwtCheck = (req, res, next) => {
  try {
    // decode token
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      // verifies secret and checks exp
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.secret, function (err, decoded) {
        if (err) {
          throw new Error("Unauthorized access.");
        }
        req.decoded = decoded;
        next();
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
        error: true,
        message: "No token provided.",
      });
    }
  } catch (e) {
    console.log("error", e);
    return res.status(401).send({ status: false, data: [], ...e });
  }
};

module.exports = jwtCheck;
