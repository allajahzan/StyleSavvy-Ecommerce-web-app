const btoa = require('btoa')

exports.createOrderId = async (body) => {

  try {

    const keyId = process.env.razor_pay_key_id;
    const keySecret = process.env.razor_pay_key_secret;

    const creds = btoa(`${keyId}:${keySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${creds}`
      },
      body: JSON.stringify(body)
    });

    return response

  } catch (err) {
    console.log(err);
    res.status(500).end()
  }

}