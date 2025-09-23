// MongoDB initialization script for DeathAIAUS
db = db.getSiblingDB('deathaius');

// Create collections
db.createCollection('users');
db.createCollection('rooms');
db.createCollection('messages');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "isOnline": 1 });
db.users.createIndex({ "currentRoom": 1 });

db.rooms.createIndex({ "name": 1 }, { unique: true });
db.rooms.createIndex({ "isPublic": 1, "isActive": 1 });
db.rooms.createIndex({ "currentUsers": -1 });
db.rooms.createIndex({ "lastActivity": -1 });

db.messages.createIndex({ "room": 1, "createdAt": -1 });
db.messages.createIndex({ "user": 1, "createdAt": -1 });
db.messages.createIndex({ "type": 1 });
db.messages.createIndex({ "isDeleted": 1 });

// Create admin user (Death)
db.users.insertOne({
  username: "death",
  email: "death@deathaius.com.au",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8.8K8K8K", // password: death123
  displayName: "Death",
  role: "admin",
  isCreator: true,
  isVerified: true,
  isOnline: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    theme: "death",
    notifications: true,
    autoJoin: false
  },
  stats: {
    messagesSent: 0,
    timeSpent: 0,
    roomsJoined: 0
  }
});

// Create default room
db.rooms.insertOne({
  name: "general",
  displayName: "General Chat",
  description: "Welcome to DeathAIAUS! This is the main chat room.",
  topic: "💀 DeathAIAUS - Advanced AI-Powered Camera Chat Platform 💀",
  createdBy: db.users.findOne({username: "death"})._id,
  isPublic: true,
  password: null,
  maxUsers: 100,
  currentUsers: 0,
  isActive: true,
  settings: {
    allowGuests: true,
    allowVideo: true,
    allowAudio: true,
    allowText: true,
    moderationLevel: "light"
  },
  tags: ["general", "main", "welcome"],
  stats: {
    totalMessages: 0,
    totalUsers: 0,
    peakUsers: 0
  },
  lastActivity: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

print("💀 DeathAIAUS database initialized successfully! 💀");
