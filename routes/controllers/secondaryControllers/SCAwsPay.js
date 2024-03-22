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
            'access_code':'zx0IPmPy5jp1vAz8Kpg7',
            'merchant_identifier':'CycHZxVj',
            'merchant_reference': Math.random(),
            'amount':'1',
            'currency':'INR',
            'language':'en',
            'customer_email':'test@example.com',
            'apple_data': payload.apple_data,
            'apple_signature': payload.apple_signature,
            'apple_header':{
                'apple_transactionId': payload.apple_header,
                'apple_ephemeralPublicKey': payload.apple_ephemeralPublicKey,
                'apple_publicKeyHash': payload.apple_publicKeyHash
            },
            'apple_paymentMethod': payload.apple_paymentMethod,
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
                cert: certificate,
                key: key,
                passphrase: 'team123',
                maxVersion: "TLSv1.2",
                minVersion: "TLSv1.2"
            });

            const headers = {
                'Content-Type': 'application/json',
            };

            let response = await axios.post("https://apple-pay-gateway-cert.apple.com/paymentservices/startSession", {
                merchantIdentifier,
                domainName,
                displayName,
            }, {
                headers,
                httpsAgent
            });

            return response.data
        } catch(er) {
            console.log(er);
            throw new Error(er);
        }
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

module.exports = SCAwsPay;