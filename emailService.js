require ('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider (e.g., Gmail, Outlook, SMTP)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password (not your regular password)
  },
});

/**
 * Sends an email notification to the author.
 * @param {string} to - Recipient's email
 * @param {string} content - Content
 */
const sendFlaggedEmail = async (to, content) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Note/Comment Has Been Flagged 🚩',
    text: `Hello, 

Your note/comment has been flagged due to downvotes. Please review its content: 

"${content}"

If you believe this was a mistake, please contact support.

Best regards,
Course Note App Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Flag notification sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendFlaggedEmail };
