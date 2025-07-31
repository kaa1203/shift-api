import { CustomError } from "../middlewares/errorMiddleware.js";
import { sendEmail } from "./nodemailer.js";

const emailTemplate = ({ to, type, token, reason }) => {
  const name = to.split("@")[0];
  const messages = {
    verifyAccount: {
      subject: "Verify your account",
      message: `
				<p>
  				Just one more step! To protect your account, please click the button below and verify your email.
				</p>
				
				<a 
					href="http://localhost:3000/shift/verify-account/?token=${token}"
					class="button"
					>Verify my account</a> 

				<p>
					If you did not sign up for a Shift account, you can safely ignore this message.
					This link will expire in 15 minutes for security purposes.
				</p>
			`,
    },
    changePassword: {
      subject: "Reset your password",
      message: `
				<p>
					We receive a request to reset the password for your account. To complete this process, please click the link below:
				</p>
						
					<a 
						href="http://localhost:3000/shift/change-password/?token=${token}"
						class="button"
						>Reset your password</a>
						
					<p>
						This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this message.
					</p>

					<p>Your account will remain secure.</p>
			`,
    },
    reactivateAccount: {
      subject: "Reactivate your account",
      message: `
        <p>
          Your Shift account is currently deactivated. To regain access, please click the button below to reactivate it.
        </p>

        <a 
          href="http://localhost:3000/shift/activate-account/?token=${token}"
          class="button"
        >Reactivate my account</a>

        <p>
          This link will expire in 15 minutes. If you did not request this action, you can safely ignore this message.
        </p>
      `,
    },
    accountDeletion: {
      subject: "Account deletion notice",
      message: `
				<p>
					This is to inform you that your account is subjected to deletion, due to <strong>${reason}</strong>. You have been given 15 days to respond, after which your account will be permanently deleted.
				</p> 
			`,
    },
  };

  const mailRef = messages[type];

  if (!mailRef) throw new CustomError("Unknown email type!", 400);

  const html = `
			<html>
				<head>
					<style>
						a {
							text-decoration: none;
							color: black;
						}
							
						.container {
							font-family: Tahoma, Verdana;
							background-color: #f4f4f4;
							padding: 20px;
							border-radius: 20px;
							border: 1px solid grey;
						}

						.button {
							display: inline-block;
							text-align: center;
							padding: 8px;
							border-radius: 5px;
							border: 1px solid transparent;
							background-color: white;
						}

						.button:hover {
							border: 1px solid black;
						}
					</style>
				</head>
				<body>

					<div class="container">
						<p>Hello ${name},</p>

						${mailRef.message} 
						
						<p>Best regards,</p>

						<p><strong>Shift Support</strong></p>

					</div>

				</body>
			</html>
			`;

  return {
    to,
    subject: mailRef.subject,
    html,
  };
};

const createEmail = async (data) => {
  try {
    await sendEmail(emailTemplate(data));
  } catch (e) {
    throw new CustomError(e.message, 500);
  }
};

export default createEmail;
