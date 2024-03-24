/* jshint node: true */
/* jshint esnext: true */
// "use strict";

const fs = require('fs');
const path = require('path');
const crypto_helper = require('../../helpers/crypto_helper');
const Client = require('@amazonpay/amazon-pay-api-sdk-nodejs');
const uuidv4 = require('uuid/v4');
const axios = require('axios');
// const applePay = require('apple-pay');
let request = require('request');
let https = require('https');
let crypto = require('crypto');

const filePath = path.join(__dirname, '../../../config/app/AmazonPay_SANDBOX-AGN24EL2WFZW3ENE64MBJXMP.pem');
const config = {
    publicKeyId: process.env.public_key,
    privateKey: fs.readFileSync(filePath, 'utf8'),
    region: 'us',
    sandbox: true,
    algorithm: 'AMZN-PAY-RSASSA-PSS-V2'
};

// Read the certificate and key files
const certificateFilePath = path.join(__dirname, '../../../cert/certificate.pem');
const keyFilePath = path.join(__dirname, '../../../cert/key.pem');
const certificate = fs.readFileSync(certificateFilePath);
const key = fs.readFileSync(keyFilePath);

// var merchantIdentifier_ID = extractMerchantID(certificate);
// Read the .p12 file
const p12Buffer = fs.readFileSync(path.join(__dirname, '../../../cert/Certificates.p12'));

// Extract certificate and key
const credentials = {
  pfx: p12Buffer,
  passphrase: 'Test@123'
};

class SCAwsPay {

    // async generateSignatureButton() {
    //     const testPayClient = new Client.AmazonPayClient(config);

    //     const payload = {
    //         webCheckoutDetails: {
    //             checkoutReviewReturnUrl: 'http://127.0.0.1:5500/review.html',
    //             checkoutResultReturnUrl: 'http://127.0.0.1:5500/test_payfort.html'
    //         },
    //         storeId: process.env.store_id
    //     };
    //     const signature = testPayClient.generateButtonSignature(payload);

    //     return signature;
    // }

    async generateSignaturePayFort(payload) {        
        const signature = await new crypto_helper().calculate(payload, process.env.sha_request_phrase, "sha256");
        return {
            signature
        };
    }

    async purchasePayFort(payload) {
        let options = {
            'digital_wallet':'APPLE_PAY',
            'command':'PURCHASE',
            'access_code': process.env.access_code,
            'merchant_identifier': process.env.merchantIdentifier,
            'merchant_reference': Math.random().toString(),
            'amount':'1.99',
            'currency':'INR',
            'language':'en',
            'customer_email':'test@example.com',
            'apple_data':'nIje+wQGTVVBgFqBxJoTk8Maig4D/KEuM/lC6IW7KGO7ydRs95KmLyQC58K4griC/mnAtAYXM/qMinDzpc6KxcFx0orSAaCYg0kGSbPDSsxnEVGMroqTQj/KSTYeooLPIWJudrWzTbNh6OZloI10fNN27AJur6nL5WFyxmUYMw7Ip+a8oWWNAjrfGISEFNJ3qs089zUNnRSQZSLwArwvXxoUwby+iCcUzNqcovn6auzKx8ajAth0LA8QWdfgGT45g5qu9YPos7BqfF70O+NgOLHKZ8Z3rtISpYvukz9ecUxBEA20uob8ZmQCCJAt6NHjv0gMqgEWbVtljE04c3RWULZJkB6htw3sgLvp2NjMjW2jmKVBb5Yv2lwrae0bM9ryJnpkMHgVw2gEyPuayGvk/rGFKyZGYT5WwIfVhIEodg==',
            'apple_signature':'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',
            'apple_header':{
                'apple_transactionId':'ee0c2dafa3a5a96f489226e2be7d7b4687e2c9cabaf3dfd13738bef7bb81cd62',
                'apple_ephemeralPublicKey':'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAETB1mCkKYTEcYDUMrEm04TVz4NWLX3qrYcoFbjQtn2Oji4t3guu+mX+7EReLtH1FzgX6U8PJzYwp/J4kDgFLnwQ==',
                'apple_publicKeyHash':'YWEPi8j+nYJHD5C04PdGEFHam6mlIexZ8moIWNn6Pbo=='
            },
            'apple_paymentMethod':{
                'apple_displayName':'Visa 0253',
                'apple_network':'Visa',
                'apple_type':'debit'
            },
        };

        let signature = await this.generateSignaturePayFort(options);

        options.signature = signature;
        const response = await axios.post(process.env.endpointURI, options);
        return response.data;
    }

    async applePaySession(payload) {
        try {
            const { merchantIdentifier, domainName, initiativeContext, initiative } = payload;

            console.log(merchantIdentifier, domainName);

            // const response = await axios.post("https://apple-pay-gateway-cert.apple.com/paymentservices/startSession", payload);
            // return response.data;

            // const session = await applePay.getMerchantSession(merchantIdentifier, domainName);
            // return session;

            const options = {
                uri: 'https://apple-pay-gateway-cert.apple.com/paymentservices/startSession',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                merchantIdentifier,
                domainName,
                initiative,
                initiativeContext
                },
                json: true,
                cert: certificate,
                key: key,
                passphrase: 'team123', // If your key file is encrypted
                // agentOptions: {
                //     pfx: fs.readFileSync(path.resolve(__dirname, '../../../cert/Certificates.p12' )),
                //     passphrase: "Test@123"
                // }
            };

            request(options, (err, response, body) => {
                if (err) throw new Error(err);
                if (!response && response.statusCode < 200 && response.statusCode > 299) throw new Error(body);
                return body;
            });

            // const res = await axios(options);
            // const res = await this.retryRequest(options);
            // return res;
        } catch (error) {
            console.error('Error fetching merchant session:', error.message);                
            throw new Error(error);
        }
    }

    async validateSessiont(payload) {
        try {
            const { merchantIdentifier, domainName, initiativeContext, initiative, displayName } = payload;

            const httpsAgent = new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true,
                cert: certificate,
                key: key,
                passphrase: 'team123'
            });

            const headers = {
                'Content-Type': 'application/json',
            };

            console.log("httpsAgent", httpsAgent)

            let response = await axios("https://apple-pay-gateway.apple.com/paymentservices/startSession", {
                merchantIdentifier,
                // domainName,
                displayName,
                initiative,
                initiativeContext
            }, {
                headers,
                httpsAgent
            });

            return response.data
        } catch(er) {
            // console.log(er);
            throw new Error(er);
        }
    }

    async validateMerchant(payload) {
        console.log(JSON.stringify(payload));
        const { merchantIdentifier, domainName, initiativeContext, initiative, displayName } = payload;
        let response = {};
        try {
          const options = {
            url:payload.url,
            uri:payload.url,
            agentOptions: {
            //   pfx: fs.readFileSync(
            //     path.resolve(__dirname, '../../../cert/Certificates.p12')
            //   ),
                // passphrase: 'Test@123',
                cert: certificate,
                key: key,
                passphrase: "team123"
            },
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'post',
            body: {
              merchantIdentifier,
              displayName,
              initiative,
              initiativeContext,
              countryCode: 'US',
              merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
              supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
            },
            json: true,
            timeout: 60000,
          };
          response = await this.promisifyRequest(options);
        } catch (error) {
          console.log("Error", error)
          throw new Error(error);
        }
        return response;
    }
      
    promisifyRequest(options) {
        return new Promise((resolve, reject) => {
          request(options, (error, response, body) => {
            if (body) {
              console.log(response);
              return resolve(body);
            }
            if (error) {
              return reject(error);
            }
          });
        });
    }

        // Create an HTTPS agent with the certificate
        // const agent = new https.Agent({
        //     pfx: fs.readFileSync(
        //         path.join(__dirname, '../../../cert/Certificates.p12')
        //         ),
        //     passphrase: "team123",
        //     cert: certificate,
        //     key: key,
        // });

        // const axiosConfig = {
        //     method: 'post',
        //     url: 'https://apple-pay-gateway.apple.com/paymentservices/startSession',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     httpsAgent: agent,
        //     data: {
        //         merchantIdentifier,
        //         displayName,
        //         domainName
        //     },
        // };
        
        // // Make the POST request to start the session
        // axios(axiosConfig)
        // .then(response => {
        //     console.log('Session started successfully');
        //     console.log('Session Token:', response.data.session);

        //     return response;
        // })
        // .catch(error => {
        //     console.error('Error starting session:', error);
        //     return error;
        // });
    // }

    async newApplePaySession(payload) {
        const { merchantIdentifier, domainName, initiativeContext, initiative, displayName } = payload;

        console.log(merchantIdentifier_ID)

        var uri = 'https://apple-pay-gateway-cert.apple.com/paymentservices/startSession';

        var options = {
            uri: uri,
            json: {
                merchantIdentifier: merchantIdentifier_ID,
                domainName: domainName,
                displayName: displayName
            },

            agentOptions: {
            cert: certificate,
            key: certificate
            }
        };

        request.post(options, function(error, response, body) {
            if (error) {
                console.log("Error", error)
            }

            if (body) {
            // Apple returns a payload with `displayName`, but passing this
            // to `completeMerchantValidation` causes it to error.
            delete body.displayName;
            }

            return body;
        });
    }     

    async httpsSession(payload) {
        // const options = {
        //     hostname: 'apple-pay-gateway-cert.apple.com',
        //     path: '/paymentservices/startSession',
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     // Pass certificate and key
        //     ...credentials
        // };
        
        // const req = https.request(options, (res) => {
        // let data = '';
        
        // res.on('data', (chunk) => {
        //     data += chunk;
        // });
        
        // res.on('end', () => {
        //     console.log(data); // Response from Apple Pay session endpoint
        // });
        // });
        
        // req.on('error', (error) => {
        // console.error('Error:', error);
        // });
        
        // // Send the request with payload in the request body
        // req.write(JSON.stringify(payload));
        // req.end();

        // Send a request to the validation URL to validate the merchant
        const response = await fetch("https://apple-pay-gateway.apple.com/paymentservices/startSession", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            merchantIdentifier, // Replace with your Apple Merchant ID
            displayName: 'supperAppApple', // Replace with your merchant name
            }),
        });
  
        const responseData = await response.json();

        console.log(responseData)
    }
}

// Custom replacer function to handle circular references
function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}

function extractMerchantID(cert) {
    try {
      const certStr = cert.toString('utf8');
  
      const regex = /1\.2\.840\.113635\.100\.6\.32=(\d+)/;
      const match = certStr.match(regex);
      
      if (match && match[1]) {
        console.log("Merchant ID:", match[1]);
        return match[1];
      } else {
        console.error("Merchant ID not found in certificate");
      }
    } catch (e) {
      console.error("Unable to read certificate file: ", e);
    }
}

module.exports = SCAwsPay;