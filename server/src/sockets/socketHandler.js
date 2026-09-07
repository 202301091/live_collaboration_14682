import User from '../models/User.js';
import Message from '../models/Message.js';
import Activity from '../models/Activity.js';
import { getIsConnected } from '../config/db.js';
import { fallback } from '../controllers/apiController.js';
// Global collaborative states stored in server memory


let globalCounter = 128;
let globalTheme = 'dark';
const globalVotes = {
  'agents': 18,
  'collaboration': 24,
  'designer': 14,
  'canvas': 32
};

let canvasHistory = []; // Keeps drawing backlog for newly joined users
export default function socketHandler(io) {
  io.on('connection', async (socket) => {

    const { id: userId, username, color } = socket.user;
    
    console.log(`Client connected: ${username} (Socket: ${socket.id})`);
    // 1. Save connection in DB/Fallback memory
    try {
      if (getIsConnected()) {
        await User.findByIdAndUpdate(userId, { socketId: socket.id, lastSeen: new Date() });
      } else {
        const u = fallback.users.find(x => x._id === userId);
        if (u) {
          u.socketId = socket.id;
          u.lastSeen = new Date();
        } else {
          fallback.users.push({ _id: userId, username, color, socketId: socket.id, lastSeen: new Date() });
        }
      }
    } catch (err) {
      console.error('Error updating user connection status:', err);
    }

    let joinActivity;
    try {
      const logText = `joined the LiveSpace real-time session`;
      if (getIsConnected()) {
        joinActivity = await Activity.create({
          type: 'join',
          username,
          action: logText,
          metadata: { userId, color }
        });
      } else {
        joinActivity = {
          _id: Math.random().toString(36).substring(2, 9),
          type: 'join',
          username,
          action: logText,
          metadata: { userId, color },
          createdAt: new Date()
        };
        fallback.activities.unshift(joinActivity);
        if (fallback.activities.length > 50) fallback.activities.pop();
      }
    } catch (err) {
      console.error('Error logging join activity:', err);
    }

    socket.emit('session:init', {
      user: { id: userId, username, color },
      globalCounter,
      globalTheme,
      globalVotes,
      canvasHistory,
      activeUsers: getIsConnected() ? await User.find({ socketId: { $ne: null } }) : fallback.users.filter(x => x.socketId)
    });

    socket.broadcast.emit('user:joined', {
      id: socket.id,
      username,
      color,
      joinedAt: new Date()
    });

    if (joinActivity) {
      io.emit('activity:new', joinActivity);
    }

    socket.on('cursor:move', (coords) => {
      socket.broadcast.emit('cursor:update', {
        socketId: socket.id,
        username,
        color,
        x: coords.x,
        y: coords.y
      });
    });

    socket.on('reaction:send', (emoji) => {
      io.emit('reaction:receive', {
        id: Math.random().toString(36).substring(2, 9),
        username,
        color,
        emoji,
        createdAt: new Date()
      });
    });

    socket.on('chat:message', async (text) => {
      console.log(`Received chat message from ${username}: ${text}`);
      if (!text) return;
      try {
        let msgDoc;
        if (getIsConnected()) {
          console.log('Saving message to DB');
          msgDoc = await Message.create({ sender: username, text });
        } else {
          msgDoc = {
            _id: Math.random().toString(36).substring(2, 9),
            sender: username,
            text,
            createdAt: new Date()
          };
          fallback.messages.push(msgDoc);
          if (fallback.messages.length > 100) fallback.messages.shift();
        }
        // Broadcast to everyone
        io.emit('chat:message', msgDoc);
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    });

    socket.on('typing:start', () => {
      socket.broadcast.emit('typing:update', { username, isTyping: true });
    });
    
    socket.on('typing:stop', () => {
      socket.broadcast.emit('typing:update', { username, isTyping: false });
    });

    socket.on('counter:update', async (change) => {
      globalCounter += change;
      io.emit('counter:updated', globalCounter);
      try {
        const actionStr = `${change > 0 ? 'incremented' : 'decremented'} the global collaborative counter to ${globalCounter}`;
        let countAct;
        if (getIsConnected()) {
          countAct = await Activity.create({
            type: 'counter',
            username,
            action: actionStr,
            metadata: { counter: globalCounter }
          });
        } else {
          countAct = {
            _id: Math.random().toString(36).substring(2, 9),
            type: 'counter',
            username,
            action: actionStr,
            metadata: { counter: globalCounter },
            createdAt: new Date()
          };
          fallback.activities.unshift(countAct);
        }
        io.emit('activity:new', countAct);
      } catch (err) {
        console.error('Counter activity save fail:', err);
      }
    });


    socket.on('canvas:draw', (strokeData) => {
      canvasHistory.push(strokeData);
      if (canvasHistory.length > 1000) canvasHistory.shift();
      
      socket.broadcast.emit('canvas:draw', strokeData);
    });

    socket.on('canvas:clear', () => {
      canvasHistory = [];
      io.emit('canvas:clear');
    });

    socket.on('vote:cast', async (optionId) => {
      if (globalVotes[optionId] !== undefined) {
        globalVotes[optionId] += 1;
        io.emit('vote:updated', globalVotes);
        try {
          const actionStr = `voted for the feature: "${optionId.toUpperCase()}"`;
          let voteAct;
          if (getIsConnected()) {
            voteAct = await Activity.create({
              type: 'vote',
              username,
              action: actionStr,
              metadata: { optionId }
            });
          } else {
            voteAct = {
              _id: Math.random().toString(36).substring(2, 9),
              type: 'vote',
              username,
              action: actionStr,
              metadata: { optionId },
              createdAt: new Date()
            };
            fallback.activities.unshift(voteAct);
          }
          io.emit('activity:new', voteAct);
        } catch (e) {
          console.error(e);
        }
      }
    });
    
    socket.on('theme:toggle', async (newTheme) => {
      globalTheme = newTheme;
      io.emit('theme:updated', globalTheme);
      try {
        const actionStr = `changed the global theme to "${newTheme.toUpperCase()}"`;
        let themeAct;
        if (getIsConnected()) {
          themeAct = await Activity.create({
            type: 'theme',
            username,
            action: actionStr,
            metadata: { theme: newTheme }
          });
        } else {
          themeAct = {
            _id: Math.random().toString(36).substring(2, 9),
            type: 'theme',
            username,
            action: actionStr,
            metadata: { theme: newTheme },
            createdAt: new Date()
          };
          fallback.activities.unshift(themeAct);
        }
        io.emit('activity:new', themeAct);
      } catch (err) {
        console.error('Theme change log failure:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${username} (Socket: ${socket.id})`);
      try {
        if (getIsConnected()) {
          await User.findByIdAndUpdate(userId, { socketId: null });
        } else {
          const u = fallback.users.find(x => x._id === userId);
          if (u) {
            u.socketId = null;
          }
        }
      } catch (err) {
        console.error('Error clearing socketId on disconnect:', err);
      }
      socket.broadcast.emit('user:left', socket.id);
      try {
        const leaveText = `left the LiveSpace session`;
        let leaveAct;
        if (getIsConnected()) {
          leaveAct = await Activity.create({
            type: 'leave',
            username,
            action: leaveText,
            metadata: { userId }
          });
        } else {
          leaveAct = {
            _id: Math.random().toString(36).substring(2, 9),
            type: 'leave',
            username,
            action: leaveText,
            metadata: { userId },
            createdAt: new Date()
          };
          fallback.activities.unshift(leaveAct);
        }
        io.emit('activity:new', leaveAct);
      } catch (err) {
        console.error('Error logging leave activity:', err);
      }
    });
  });
}
