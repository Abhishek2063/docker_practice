exports.emailMessage = (
  email,
  username,
  temporaryPassword
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registration Successful</title>
    <style>
      body {
        font-family: "Arial", sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }

      .container {
        position: relative;
        max-width: 600px;
        margin: 20px auto;
        background-image: url("./images/favicon-3.png"); /* Replace with the actual path to your image */
        background-size: 200px;
        background-position: center;
        background-repeat: no-repeat;
        background-color: rgb(190, 248, 248);
        color: #0c0c0c; /* Set text color to be visible on the background image */
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #131111;
      }

      p {
        color: #0c0b0b;
      }

      .credentials {
        margin-top: 20px;
        background-color: rgba(
          255,
          255,
          255,
          0.8
        ); /* Semi-transparent white background for better readability */
        padding: 10px;
        border-radius: 5px;
      }

      .footer {
        margin-top: 20px;
        text-align: center;
        color: #0c0b0b;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Registration Successful</h1>
      <p>Dear ${username},</p>
      <p>
        Congratulations! Your registration was successful. Below are your login
        credentials:
      </p>

      <div class="credentials">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${temporaryPassword}</p>
      </div>

      <div class="footer">
        <p>
          Thank you for choosing Money Management. If you have any questions,
          please contact our support team.
        </p>
      </div>
    </div>
  </body>
</html>
`;
