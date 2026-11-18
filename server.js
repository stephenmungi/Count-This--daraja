const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const SHORTCODE = process.env.SHORTCODE;
const PASSKEY = process.env.PASSKEY;
async function getToken() {
  const auth = Buffer.from(CONSUMER_KEY + ":" + CONSUMER_SECRET).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', { headers: { Authorization: 'Basic ' + auth } });
  return res.data.access_token;
}
app.get('/', (req, res) => res.send('Count This Daraja Server is Running!'));
app.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString('base64');
    let cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
    if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1);
    const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      BusinessShortCode: SHORTCODE, Password: password, Timestamp: timestamp, TransactionType: 'CustomerPayBillOnline', Amount: amount, PartyA: cleanPhone, PartyB: SHORTCODE, PhoneNumber: cleanPhone, CallBackURL: 'https://count-this-daraja.onrender.com/callback', AccountReference: 'Count This', TransactionDesc: 'Count This Payment'
    }, { headers: { Authorization: 'Bearer ' + token } });
    res.json(response.data);
  } catch (e) { res.status(500).json({ error: e.message, details: e.response?.data }); }
});
app.post('/callback', (req, res) => { console.log(req.body); res.json({ ok: true }); });
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Running on ' + PORT));
