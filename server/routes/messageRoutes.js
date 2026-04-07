const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { authenticateToken, loadCurrentUser, requireActiveUser } = require("../middleware/authMiddleware");

const LAKEHEAD_EMAIL_DOMAIN = "@lakeheadu.ca";

function isLakeheadEmail(email = "") {
  return email.trim().toLowerCase().endsWith(LAKEHEAD_EMAIL_DOMAIN);
}

router.use(authenticateToken, loadCurrentUser);

router.get("/contacts", async (req, res) => {
  try {
    const currentEmail = req.currentUser.email;

    const users = await User.find({ email: { $ne: currentEmail } })
      .select("name email")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Could not load student contacts" });
  }
});

router.get("/conversations", async (req, res) => {
  try {
    const currentEmail = req.currentUser.email;

    const messages = await Message.find({
      $or: [
        { sender: currentEmail },
        { recipient: currentEmail }
      ]
    }).sort({ createdAt: -1 });

    const otherParticipantEmails = [
      ...new Set(
        messages.map((message) =>
          message.sender === currentEmail ? message.recipient : message.sender
        )
      )
    ];

    const users = await User.find({
      email: { $in: otherParticipantEmails }
    }).select("name email");

    const userMap = new Map(
      users.map((user) => [user.email, user.name])
    );

    const conversations = otherParticipantEmails.map((email) => {
      const latestMessage = messages.find((message) =>
        message.sender === email || message.recipient === email
      );

      return {
        email,
        name: userMap.get(email) || email,
        lastMessage: latestMessage?.text || "",
        lastMessageAt: latestMessage?.createdAt || null
      };
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Could not load conversations" });
  }
});

router.get("/conversation/:email", async (req, res) => {
  try {
    const currentEmail = req.currentUser.email;
    const participantEmail = decodeURIComponent(req.params.email).trim().toLowerCase();

    if (!isLakeheadEmail(participantEmail)) {
      return res.status(400).json({ message: "Only Lakehead student emails can be used for messaging" });
    }

    const participant = await User.findOne({ email: participantEmail }).select("name email");

    if (!participant) {
      return res.status(404).json({ message: "Student conversation not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentEmail, recipient: participantEmail },
        { sender: participantEmail, recipient: currentEmail }
      ]
    }).sort({ createdAt: 1 });

    res.json({
      participant,
      messages
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load conversation" });
  }
});

router.post("/send", requireActiveUser, async (req, res) => {
  try {
    const currentEmail = req.currentUser.email;
    const recipientEmail = req.body?.recipientEmail?.trim().toLowerCase();
    const text = req.body?.text?.trim();

    if (!recipientEmail || !text) {
      return res.status(400).json({ message: "Recipient email and message text are required" });
    }

    if (!isLakeheadEmail(recipientEmail)) {
      return res.status(400).json({ message: "Messages can only be sent to @lakeheadu.ca email addresses" });
    }

    if (recipientEmail === currentEmail) {
      return res.status(400).json({ message: "You cannot send a message to yourself" });
    }

    const recipient = await User.findOne({ email: recipientEmail }).select("name email");

    if (!recipient) {
      return res.status(404).json({ message: "That student has not created an account yet" });
    }

    const message = await Message.create({
      sender: currentEmail,
      recipient: recipientEmail,
      text
    });

    res.status(201).json({
      message,
      participant: recipient
    });
  } catch (err) {
    res.status(500).json({ message: "Could not send message" });
  }
});

module.exports = router;
