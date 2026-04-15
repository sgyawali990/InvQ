const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendLowStockAlert = async (userEmail, itemName, quantity) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: `Low Stock Alert: ${itemName}`,
        text: `${itemName} is low on stock, current quantity: ${quantity}.`
    });
};

const sendOutOfStockAlert = async (userEmail, itemName) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: `Out Of Stock Alert: ${itemName}`,
        text: `${itemName} is out of stock.`
    });
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "InvQ Password Reset",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your InvQ account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};

module.exports = { sendLowStockAlert, sendOutOfStockAlert, sendPasswordResetEmail };