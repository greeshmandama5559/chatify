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
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "text or image is required" });
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

    // ---- decide whether to include populated sender info ----
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
    });

    await newMessage.save();

    // Note: Because we just saved newMessage, prior will always be true if you run this AFTER save.
    // So to determine "first message", check existence *before* creating/saving the new message:
    // (see the alternate code below). For simplicity, do the existence check before save.

    // ---- minimal payload by default ----
    const minimalPayload = {
      _id: String(newMessage._id),
      senderId: String(senderId),
      receiverId: String(receiverId),
      text: newMessage.text,
      image: newMessage.image,
      createdAt: newMessage.createdAt,
    };

    // Emit minimal payload by default
    const shouldPopulate = !prior; // true if no prior messages

    let payload = minimalPayload;

    if (shouldPopulate) {
      // populate the saved message's sender fields (only the minimal fields)
      console.log("Populating sender info for first message between users.")
      await newMessage.populate("senderId", "fullName profilePic");
      payload = {
        ...minimalPayload,
        senderName: newMessage.senderId?.fullName || "Unknown",
        senderProfilePic: newMessage.senderId?.profilePic || "/avatar.png",
      };
    }

    // Emit — support rooms or socket id function
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      if (Array.isArray(receiverSocketId)) {
        receiverSocketId.forEach((sid) =>
          io.to(sid).emit("newMessage", payload)
        );
      } else {
        io.to(receiverSocketId).emit("newMessage", payload);
      }
    }

    // Emit back to sender as well (so sender UI updates)
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
