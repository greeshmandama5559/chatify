import cloudirany from "../lib/cloudinary.js";
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
        return res.status(400).json({message:"text or message is required"})
    }

    const receiverExists = await User.exists({_id: receiverId});
    if(!receiverExists){
        return res.status(400).json({message:"receiver not exists."});
    }

    let imageUrl;
    if (image) {
      const imageResponse = await cloudirany.uploader.upload(image);
      imageUrl = imageResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in send message: " + error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedUserId }, { receiverId: loggedUserId }],
    });

    const chatPartnersIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({_id: {$in:chatPartnersIds}}).select("-Password");

    res.status(200).json(chatPartners);

  } catch (error) {
    console.error("Error in get all chats: " + error);
    res.status(500).json({ message: "internal server error" });
  }
};
