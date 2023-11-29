const sendgrid = require("@sendgrid/mail");
const { emailMessage } = require("../emailFiles/successRegistration");
const { APP_URL } = require("../config/config");

require("dotenv").config();

const sendWelcomeEmail = async (email, username, temporaryPassword) => {
  try {
    sendgrid.setApiKey(process.env.SEND_EMAIL_API_KEY);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Money Management",
      templateId: process.env.Template_ID,
      //extract the custom fields
      dynamic_template_data: {
        email: email,
        username: username,
        temporaryPassword: temporaryPassword,
        APP_URL: APP_URL,
      },
    };

    // Use async/await to handle the promise
    const resp = await sendgrid.send(mailOptions);
    return resp;
  } catch (error) {
    throw error; // Rethrow the error to handle it in the calling function
  }
};

module.exports = { sendWelcomeEmail };
