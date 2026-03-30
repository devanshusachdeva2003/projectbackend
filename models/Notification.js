const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // 👤 Receiver
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🧑 Sender (who triggered action)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 📝 Message
    message: {
      type: String,
      required: true,
    },

    // 🔔 Type
    type: {
      type: String,
      enum: ["like", "comment", "blog", "admin"],
      default: "blog",
    },

    // 🔗 Related blog
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },

    // ✅ Read status
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);