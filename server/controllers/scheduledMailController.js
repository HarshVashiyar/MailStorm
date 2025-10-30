const ScheduledMail = require("../models/scheduledMailDB");
const cron = require("node-cron");
const { sendScheduledMail } = require("../utilities/mailUtil");
const moment = require("moment-timezone");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const mailsToSend = await ScheduledMail.find({
    sendAt: { $lte: now },
    status: "Pending",
  });
  mailsToSend.forEach(async (mail, index) => {
    try {
      const mailContent = {
        to: mail.to,
        subject: mail.subject,
        recipientPeople: mail.recipientPeople ? mail.recipientPeople : null,
        html: mail.html || null,
        signature: mail.signature || null,
        attachments: mail.attachments.map((att) => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType,
        }))
      };
      await sendScheduledMail(mailContent);
      mail.status = "Sent";
      await mail.save();
    } catch (err) {
      console.error("Mail sending failed:", err);
    }
  });
});

const handleAddScheduledMail = async (req, res) => {
  const user = req.user;
  try {
    const {
      to,
      subject,
      recipientPeople,
      html,
      signature,
      sendAt,
      status,
      timeZone,
    } = req.body;
    if (!sendAt || !timeZone) {
      return res.status(400).json({ message: 'Missing required fields: "sendAt" and "timeZone".' });
    }
    const utcSendAt = moment.tz(sendAt, timeZone).utc().toDate();
    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype,
    }));
    if (!to || !subject) {
      return res.status(400).json({ success: false, message: 'Missing required fields: "to" and "subject".' });
    }
    const newScheduledMail = await ScheduledMail.create({
      from: "dynamictechnocast@gmail.com",
      to: to.split(",").map(email => email.trim()),
      subject,
      recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
      html,
      attachments,
      signature,
      sendAt: utcSendAt,
      status,
      createdBy: user.id,
    });
    res.status(201).json({ success: true, message: "Mail scheduled successfully.", newScheduledMail });
  } catch (error) {
    console.error("Error in handleAddScheduledMail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleGetScheduledMails = async (req, res) => {
  const user = req.user;
  try {
    const scheduledMails = await ScheduledMail.find({ createdBy: user.id });
    res.status(200).json({ success: true, message: "Scheduled mails retrieved successfully.", data: scheduledMails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

const handleDeleteScheduledMails = async (req, res) => {
  const user = req.user;
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No scheduled mails selected" });
    }
    const deletedScheduledMails = await ScheduledMail.deleteMany({
      _id: { $in: ids },
      createdBy: user.id,
    });
    if (deletedScheduledMails.deletedCount > 0) {
      return res.status(200).json({ success: true, message: "Scheduled mails deleted successfully" });
    } else {
      return res.status(404).json({ success: false, message: "No mails found to delete" });
    }
  } catch (err) {
    console.error("Remove lists error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
}
