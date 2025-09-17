const ScheduledEmail = require("../models/scheduledEmailDB");
const cron = require("node-cron");
const { sendScheduledEmail } = require("../utilities/mailUtil");
const moment = require("moment-timezone");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const emailsToSend = await ScheduledEmail.find({
    sendAt: { $lte: now },
    status: "pending",
  });

  emailsToSend.forEach(async (email, index) => {
    try {
      const emailContent = {
        to: email.to,
        subject: email.subject,
        recipientPeople: email.recipientPeople ? email.recipientPeople : null,
        text: email.text || null,
        html: email.html || null,
        signature: email.signature || null,
        attachments: email.attachments.map((att) => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType,
        })),
        mState: email.mState,
      };
      await sendScheduledEmail(emailContent);
      email.status = "sent";
      await email.save();
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  });
});

const handleAddScheduledEmail = async (req, res) => {
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
    
    const newScheduledEmail = await ScheduledEmail.create({
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
    });

    res
      .status(201)
      .json({ message: "Email scheduled successfully.", newScheduledEmail });
  } catch (error) {
    console.error("Error in handleAddScheduledEmail:", error);
    res.status(500).json({ message: error.message });
  }
};

const handleGetScheduledEmails = async (req, res) => {
  try {
    const scheduledEmails = await ScheduledEmail.find();
    res.status(200).json(scheduledEmails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleDeleteScheduledEmails = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No scheduled emails selected" });
    }

    const deletedScheduledEmails = await ScheduledEmail.deleteMany({
      _id: { $in: ids },
    });

    if (deletedScheduledEmails.deletedCount > 0) {
      return res
        .status(200)
        .json({ message: "Scheduled emails deleted successfully" });
    } else {
      return res.status(404).json({ message: "No emails found to delete" });
    }
  } catch (err) {
    console.error("Remove lists error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports = {
  handleAddScheduledEmail,
  handleGetScheduledEmails,
  handleDeleteScheduledEmails,
};
