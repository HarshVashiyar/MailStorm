const ScheduledMail = require("../models/scheduledMailDB");
const cron = require("node-cron");
const { sendScheduledMail } = require("../utilities/mailUtil");
const moment = require("moment-timezone");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const mailsToSend = await ScheduledMail.find({
    sendAt: { $lte: now },
    status: "pending",
  });

  mailsToSend.forEach(async (mail, index) => {
    try {
      const mailContent = {
        to: mail.to,
        subject: mail.subject,
        recipientPeople: mail.recipientPeople ? mail.recipientPeople : null,
        text: mail.text || null,
        html: mail.html || null,
        signature: mail.signature || null,
        attachments: mail.attachments.map((att) => ({
          filename: att.filename,
          path: att.path, // Cloudinary URL - will be fetched by Nodemailer
          contentType: att.contentType,
        })),
        mState: mail.mState,
      };
      await sendScheduledMail(mailContent);
      mail.status = "sent";
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
      text,
      html,
      signature,
      sendAt,
      status,
      mState,
      timeZone,
    } = req.body;

    if (!sendAt || !timeZone) {
      return res.status(400).json({ message: 'Missing required fields: "sendAt" and "timeZone".' });
    }

    const utcSendAt = moment.tz(sendAt, timeZone).utc().toDate();
    //console.log("utcSendAt:", utcSendAt);

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      path: file.path, // Cloudinary URL
      contentType: file.mimetype,
    }));

    if (!to || !subject) {
      return res
        .status(400)
        .json({ message: 'Missing required fields: "to" and "subject".' });
    }

    const newScheduledMail = await ScheduledMail.create({
      from: mState
        ? "dynamictechnocast@gmail.com"
        : "sales@dynamicpreicisionindustries.com",
      to,
      subject,
      recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
      text,
      html,
      attachments,
      signature,
      sendAt: utcSendAt,
      status,
      mState,
      createdBy: user.id,
    });

    res
      .status(201)
      .json({ message: "Mail scheduled successfully.", newScheduledMail });
  } catch (error) {
    console.error("Error in handleAddScheduledMail:", error);
    res.status(500).json({ message: error.message });
  }
};

const handleGetScheduledMails = async (req, res) => {
  const user = req.user;
  try {
    const scheduledMails = await ScheduledMail.find({ createdBy: user.id });
    res.status(200).json(scheduledMails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleDeleteScheduledMails = async (req, res) => {
  const user = req.user;
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No scheduled mails selected" });
    }

    const deletedScheduledMails = await ScheduledMail.deleteMany({
      _id: { $in: ids },
      createdBy: user.id,
    });

    if (deletedScheduledMails.deletedCount > 0) {
      return res
        .status(200)
        .json({ message: "Scheduled mails deleted successfully" });
    } else {
      return res.status(404).json({ message: "No mails found to delete" });
    }
  } catch (err) {
    console.error("Remove lists error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports = {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
};
