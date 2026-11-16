const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const CONSUMER_KEY = "9vU0PzmJXQGLiAgadG8u9kg1G18DKiKlPx5Mso5ezE6ih6li";
const CONSUMER_SECRET = "wrL0kzn8t3v10LAWbm5zTr14MvfBpDFXI6Geckb26FCuap4LJTXniZ8gMIv4x9La";
const SHORTCODE = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
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
