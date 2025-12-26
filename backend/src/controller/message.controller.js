import cloudirany from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-Password");

    const usersData = filteredUsers.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      bio: user.bio,
      profilePic: user.profilePic,
      interests: user.interests,
      isActive: user.isActive,
      likesCount: user.likesCount,
    }));

    res.status(200).json(usersData);
  } catch (error) {
    console.error("Error in get all contacts: " + error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    if (!myId)
      return res.status(401).json({ message: "Unauthorized: missing user" });
    if (!userToChatId)
      return res.status(400).json({ message: "Missing chat partner id" });

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in get messages in message controller: " + error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, type, url } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !url) {
      return res
        .status(400)
        .json({ message: "text, image or url is required" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(400).json({ message: "receiver not exists." });
    }

    let imageUrl;
    if (image) {
      const uploadRes = await cloudirany.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      type: type || undefined,
      url: url || undefined,
      seen: false, 
    });

    await newMessage.save();

    const payload = {
      _id: String(newMessage._id),
      senderId: String(senderId),
      receiverId: String(receiverId),
      text: newMessage.text,
      image: newMessage.image,
      type: newMessage.type,
      url: newMessage.url,
      createdAt: newMessage.createdAt,
    };

    // emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      []
        .concat(receiverSocketId)
        .forEach((sid) =>
          io
            .to(sid)
            .emit("newMessage", { ...payload, fullName: req.user.fullName })
        );
    }

    // emit to sender (multi-device support)
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      []
        .concat(senderSocketId)
        .forEach((sid) => io.to(sid).emit("newMessage", payload));
    }

    res.status(201).json(payload);
  } catch (error) {
    console.error("Error in send message:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const loggedUserId = req.user._id.toString();

    // 1️⃣ fetch all messages involving logged user
    const messages = await Message.find({
      $or: [{ senderId: loggedUserId }, { receiverId: loggedUserId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ map latest message per partner
    const chatMap = new Map();

    for (const msg of messages) {
      const partnerId =
        msg.senderId.toString() === loggedUserId
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, msg);
      }
    }

    const partnerIds = Array.from(chatMap.keys());

    // 3️⃣ fetch users
    const users = await User.find({ _id: { $in: partnerIds } })
      .select("-Password")
      .lean();

    // 4️⃣ build chat list with unseen info
    const chats = await Promise.all(
      users.map(async (user) => {
        const partnerId = user._id.toString();
        const lastMessage = chatMap.get(partnerId);

        // unseen count
        const unseenCount = await Message.countDocuments({
          senderId: partnerId,
          receiverId: loggedUserId,
          seen: false,
        });

        // last unseen message (for green line / new)
        const lastUnseen = await Message.findOne({
          senderId: partnerId,
          receiverId: loggedUserId,
          seen: false,
        })
          .sort({ createdAt: -1 })
          .select("_id")
          .lean();

        return {
          ...user,

          // last message info
          lastMessageId: lastMessage._id,
          lastMessageText:
            lastMessage.text ||
            (lastMessage.image ? "📷 Image" : "No messages yet"),
          lastMessageTime: lastMessage.createdAt,
          lastMessageSender: lastMessage.senderId.toString(),

          // ⭐ unseen info
          unseenCount,
          lastUnseenMessageId: lastUnseen?._id || null,
        };
      })
    );

    // 5️⃣ sort chats by latest message
    chats.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in get all chats:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getUnseenCounts = async (req, res) => {
  const userId = req.user._id;

  const unseen = await Message.aggregate([
    { $match: { receiverId: userId, seen: false } },
    { $group: { _id: "$senderId", count: { $sum: 1 } } },
  ]);

  res.json(unseen);
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (msg.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const wasUnseen =
      !msg.seen && msg.receiverId.toString() !== msg.senderId.toString();

    const wasUnseenForReceiver = !msg.seen;

    await msg.deleteOne();

    const senderSocketId = getReceiverSocketId(msg.senderId.toString());
    const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());

    // 🔑 sender sees receiver as partner
    if (senderSocketId) {
      io.to(senderSocketId).emit("deleteMessage", {
        messageId,
        partnerId: msg.receiverId,
        wasUnseen: false,
      });
    }

    // 🔑 receiver sees sender as partner
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", {
        messageId,
        partnerId: msg.senderId,
        wasUnseen: wasUnseenForReceiver,
      });
    }

    return res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
