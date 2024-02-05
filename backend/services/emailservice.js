const Sib = require("sib-api-v3-sdk");

const sendResetEmail = async (
  sender,
  receivers,
  subject,
  textContent,
  htmlContent
) => {
  const client = Sib.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.SIB_API_KEY;
  const tranEmailApi = new Sib.TransactionalEmailsApi();

  try {
    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      textContent,
      htmlContent,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

module.exports = { sendResetEmail };
