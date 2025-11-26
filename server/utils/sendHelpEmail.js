const SibApiV3Sdk = require("sib-api-v3-sdk");

let mailClient;

const ensureBrevoConfig = () => {
  if (!process.env.BREVO_API_KEY) throw new Error("BREVO_API_KEY tanımlı değil");
  if (!process.env.BREVO_SENDER_EMAIL) throw new Error("BREVO_SENDER_EMAIL tanımlı değil");
};

const getMailClient = () => {
  if (mailClient) return mailClient;
  ensureBrevoConfig();
  const apiClient = SibApiV3Sdk.ApiClient.instance;
  apiClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
  mailClient = new SibApiV3Sdk.TransactionalEmailsApi();
  return mailClient;
};

const sendHelpEmail = async ({ email, comment }) => {
  if (!email || !comment) {
    const error = new Error("Email ve yorum alanları zorunludur");
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    const error = new Error("Geçersiz e-posta formatı");
    error.statusCode = 400;
    throw error;
  }

  const receiverEmail = process.env.BREVO_SENDER_EMAIL; // Destek ekibi (Siz)
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL, // Gönderen (Sistem mailiniz)
    name: "TaskPro Destek",
  };

  sendSmtpEmail.to = [{ email: receiverEmail }];
  // Kullanıcıya da kopya gitmesini isterseniz buraya ekleyebilirsiniz
  // sendSmtpEmail.cc = [{ email: email }]; 
  
  sendSmtpEmail.subject = "TaskPro – Yeni Yardım Talebi";
  
  sendSmtpEmail.htmlContent = `
    <h3>Yeni Yardım Talebi</h3>
    <p><strong>Kullanıcı:</strong> ${email}</p>
    <hr />
    <p><strong>Mesaj:</strong></p>
    <p>${comment}</p>
  `;

  try {
    const client = getMailClient();
    await client.sendTransacEmail(sendSmtpEmail);
    return { message: "Email gönderildi" };
  } catch (err) {
    const brevoMessage = err?.response?.text || err.message || "Email gönderilemedi";
    console.error("Brevo Hata:", brevoMessage);
    const error = new Error(brevoMessage);
    error.statusCode = 500;
    throw error;
  }
};

module.exports = sendHelpEmail;
