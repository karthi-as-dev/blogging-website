const Notification = require('../models/Notification');

const createNotification = async ({ recipient, sender, type, blog, comment, message }) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return;

    await Notification.create({ recipient, sender, type, blog: blog || null, comment: comment || null, message });
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
};

module.exports = { createNotification };
