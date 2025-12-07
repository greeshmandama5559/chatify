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

    res.status(200).json(filteredUsers);
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
    // Accept type and url from client as well
    const { text, image, type, url } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !url) {
      return res.status(400).json({ message: "text, image or url is required" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(400).json({ message: "receiver not exists." });
    }

    let imageUrl;
    if (image) {
      const imageResponse = await cloudirany.uploader.upload(image);
      imageUrl = imageResponse.secure_url;
    }

    // check if any prior message exists between the two users (either direction)
    const prior = await Message.exists({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      type: type || undefined,
      url: url || undefined,
    });

    await newMessage.save();

    const minimalPayload = {
      _id: String(newMessage._id),
      senderId: String(senderId),
      receiverId: String(receiverId),
      text: newMessage.text,
      image: newMessage.image,
      type: newMessage.type,
      url: newMessage.url,
      createdAt: newMessage.createdAt,
    };

    const shouldPopulate = !prior;

    let payload = minimalPayload;

    if (shouldPopulate) {
      console.log("Populating sender info for first message between users.");
      await newMessage.populate("senderId", "fullName profilePic");
      payload = {
        ...minimalPayload,
        senderName: newMessage.senderId?.fullName || "Unknown",
        senderProfilePic: newMessage.senderId?.profilePic || "/avatar.png",
      };
    }

    // Emit to receiver (support room or socket id)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      if (Array.isArray(receiverSocketId)) {
        receiverSocketId.forEach((sid) => io.to(sid).emit("newMessage", payload));
      } else {
        io.to(receiverSocketId).emit("newMessage", payload);
      }
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      if (Array.isArray(senderSocketId)) {
        senderSocketId.forEach((sid) => io.to(sid).emit("newMessage", payload));
      } else {
        io.to(senderSocketId).emit("newMessage", payload);
      }
    }

    res.status(201).json(payload);
  } catch (error) {
    console.error("Error in send message: " + error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    // fetch all messages involving logged user
    const messages = await Message.find({
      $or: [{ senderId: loggedUserId }, { receiverId: loggedUserId }],
    }).sort({ createdAt: -1 }); // newest first

    // extract unique partner IDs
    const chatMap = new Map();

    messages.forEach((msg) => {
      const partnerId =
        msg.senderId.toString() === loggedUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      // first time this partner is added → it will be the latest message
      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, msg);
      }
    });

    const partnerIds = Array.from(chatMap.keys());

    // fetch user details
    const users = await User.find({ _id: { $in: partnerIds } }).select(
      "-Password"
    );

    // attach last message + sort them
    const chats = users
      .map((user) => {
        const lastMessage = chatMap.get(user._id.toString());
        return {
          ...user.toObject(),
          lastMessageText:
            lastMessage.text || (lastMessage.image ? "📷 Image" : ""),
          lastMessageTime: lastMessage.createdAt,
          lastMessageSender: lastMessage.senderId.toString(),
        };
      })
      .sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in get all chats: " + error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // Find message
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Only sender can delete the message
    if (msg.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete
    await msg.deleteOne();

    // Emit delete event to receiver
    const receiverSocketId = getReceiverSocketId(msg.receiverId);
    const senderSocketId = getReceiverSocketId(msg.senderId);

    const payload = { messageId };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", payload);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("deleteMessage", payload);
    }

    return res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

