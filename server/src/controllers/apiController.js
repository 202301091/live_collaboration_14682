import User from '../models/User.js';
import Message from '../models/Message.js';
import Activity from '../models/Activity.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { getIsConnected } from '../config/db.js';

export const fallback = {
  users: [],
  messages: [],
  activities: [],
};

const adjectives = ['Quantum', 'Hyper', 'Neo', 'Pixel', 'Vector', 'Optic', 'Cosmic', 'Neural', 'Cyber', 'Sonic', 'Aether', 'Astral'];
const nouns = ['Architect', 'Designer', 'Coder', 'Cursor', 'Navigator', 'Explorer', 'Spark', 'Builder', 'Maker', 'Warp', 'Node', 'Pulse'];
const colors = [
  '#FF6B6B', '#4DABF7', '#51CF66', '#FCC419', '#AE3EC9', 
  '#FF922B', '#E64980', '#15AABF', '#7048E8', '#94D82D'
];
function generateGuestUser() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return {
    username: `${adj} ${noun}`,
    color
  };
}

const apiController = {

  registerGuest: async (req, res) => {
    try {
      const { username, color } = generateGuestUser();
      
      let userDoc;
      if (getIsConnected()) {
        userDoc = await User.create({
          username,
          color,
          joinedAt: new Date(),
          lastSeen: new Date()
        });
      } else {
        userDoc = {
          _id: Math.random().toString(36).substring(2, 9),
          username,
          color,
          joinedAt: new Date(),
          lastSeen: new Date()
        };
        fallback.users.push(userDoc);
      }
      const token = generateToken({
        id: userDoc._id,
        username: userDoc.username,
        color: userDoc.color
      });
      res.status(201).json({
        token,
        user: {
          id: userDoc._id,
          username: userDoc.username,
          color: userDoc.color
        }
      });
    } catch (err) {
      console.error('Error creating guest user:', err);
      res.status(500).json({ error: 'Failed to create guest user profile' });
    }
  },

  getUsers: async (req, res) => {
    try {
      if (getIsConnected()) {
        const users = await User.find({ socketId: { $ne: null } });
        return res.json(users);
      } else {
        return res.json(fallback.users);
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch active users' });
    }
  },

  getMessages: async (req, res) => {
    try {
      if (getIsConnected()) {
        const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
        // Return chronologically
        return res.json(messages.reverse());
      } else {
        return res.json(fallback.messages.slice(-50));
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  },

  postMessage: async (req, res) => {
    try {
      const { text } = req.body;
      const sender = req.user.username; // Filled by authMiddleware
      if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
      }
      let messageDoc;
      if (getIsConnected()) {
        messageDoc = await Message.create({ sender, text });
      } else {
        messageDoc = {
          _id: Math.random().toString(36).substring(2, 9),
          sender,
          text,
          createdAt: new Date()
        };
        fallback.messages.push(messageDoc);
      }
      res.status(201).json(messageDoc);
    } catch (err) {
      res.status(500).json({ error: 'Failed to post message' });
    }
  },

  getActivities: async (req, res) => {
    try {
      if (getIsConnected()) {
        const activities = await Activity.find().sort({ createdAt: -1 }).limit(30);
        return res.json(activities);
      } else {
        return res.json(fallback.activities.slice(-30));
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  },

  postActivity: async (req, res) => {
    try {
      const { type, action, metadata } = req.body;
      const username = req.user.username;
      let activityDoc;
      if (getIsConnected()) {
        activityDoc = await Activity.create({
          type,
          username,
          action,
          metadata: metadata || {},
          createdAt: new Date()
        });
      } else {
        activityDoc = {
          _id: Math.random().toString(36).substring(2, 9),
          type,
          username,
          action,
          metadata: metadata || {},
          createdAt: new Date()
        };
        fallback.activities.unshift(activityDoc);
        if (fallback.activities.length > 100) fallback.activities.pop();
      }
      res.status(201).json(activityDoc);
    } catch (err) {
      res.status(500).json({ error: 'Failed to log activity' });
    }
  },
  
  
};
export default apiController;