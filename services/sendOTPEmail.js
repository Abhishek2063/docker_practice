const sendgrid = require("@sendgrid/mail");
const { emailMessage } = require("../emailFiles/successRegistration");
const { APP_URL } = require("../config/config");

require("dotenv").config();

const sendOTPByEmail = async (email, otp) => {
  try {
    sendgrid.setApiKey(process.env.SEND_EMAIL_API_KEY);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Login",
      templateId: process.env.OTP_LOGIN_TEMPLATE,
      //extract the custom fields
      dynamic_template_data: {
        email: email,

        APP_URL: APP_URL,
        OTP_Number: otp,
      },
    };

    // Use async/await to handle the promise
    const resp = await sendgrid.send(mailOptions);
    return resp;
  } catch (error) {
    throw error; // Rethrow the error to handle it in the calling function
  }
};

module.exports = { sendOTPByEmail };
