const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET
});

app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel'
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'Thiery Henry  Vintage jersey',
              sku: '001',
              price: '1000.00',
              currency: 'USD',
              quantity: 1
            }
          ]
        },
        amount: {
          currency: 'USD',
          total: '1000.00'
        },
        description:
          'Jersey that Thierry Henry wore on the last game of the Invincibles season.'
      }
    ]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  var execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: '1000.00'
        }
      }
    ]
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
      }
    }
  );
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));
