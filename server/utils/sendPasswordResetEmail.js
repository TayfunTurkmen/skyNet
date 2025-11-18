const SibApiV3Sdk = require('sib-api-v3-sdk');

let transactionalClient;

const ensureBrevoConfig = () => {
  if (!process.env.BREVO_API_KEY) {
    const error = new Error('BREVO_API_KEY tanımlı değil');
    error.statusCode = 500;
    throw error;
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    const error = new Error('BREVO_SENDER_EMAIL tanımlı değil');
    error.statusCode = 500;
    throw error;
  }
};

const getTransactionalClient = () => {
  if (transactionalClient) {
    return transactionalClient;
  }

  ensureBrevoConfig();

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
  transactionalClient = new SibApiV3Sdk.TransactionalEmailsApi();
  return transactionalClient;
};

const buildEmailPayload = ({ to, name, resetURL }) => {
  const senderName = process.env.BREVO_SENDER_NAME || 'TaskPro';
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: senderName,
  };

  sendSmtpEmail.to = [{ email: to, name: name || '' }];
  sendSmtpEmail.subject = 'TaskPro - Şifre sıfırlama talimatı';
  sendSmtpEmail.htmlContent = `
    <p>Merhaba ${name || 'TaskPro kullanıcısı'},</p>
    <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
    <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
    <p>Bağlantı 1 saat boyunca geçerlidir. Eğer bu isteği siz göndermediyseniz lütfen bu e-postayı görmezden gelin.</p>
    <p>TaskPro Ekibi</p>
  `;
  sendSmtpEmail.textContent = `Merhaba ${name || 'TaskPro kullanıcısı'}, şifrenizi sıfırlamak için link: ${resetURL}`;

  return sendSmtpEmail;
};

const sendPasswordResetEmail = async ({ to, name, resetURL }) => {
  const apiInstance = getTransactionalClient();
  const payload = buildEmailPayload({ to, name, resetURL });

  try {
    await apiInstance.sendTransacEmail(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Brevo e-posta gönderim hatası:', error?.response?.text || error.message);
    throw error;
  }
};

module.exports = sendPasswordResetEmail;
