// test-send.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTest() {
  const msg = {
    to: process.env.TO_EMAIL || 'ncb.official51@gmail.com',
    from: process.env.FROM_EMAIL || 'pravinpinjarkar2705@gmail.com', // must be verified in SendGrid
    subject: 'Test from SendGrid',
    text: 'Hello — this is a test email using SendGrid API key.',
    html: '<strong>Hello — this is a test email using SendGrid API key.</strong>'
  };

  try {
    const res = await sgMail.send(msg);
    console.log('✅ SendGrid response:', res[0].statusCode);
  } catch (err) {
    console.error('❌ SendGrid error:', err.response ? err.response.body : err.message);
  }
}

sendTest();
