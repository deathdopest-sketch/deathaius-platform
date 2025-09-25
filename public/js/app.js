// DeathAIAUS Frontend Application
class DeathAIAUS {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.currentRoom = null;
    this.peers = new Map();
    this.localStream = null;
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
    
    this.init();
  }

  async init() {
    console.log('💀 [DEATH] Initializing DeathAIAUS...');
    
    // Check for existing token
    const token = localStorage.getItem('deathaius_token');
    if (token) {
      try {
        await this.verifyToken(token);
        this.showChatScreen();
      } catch (error) {
        console.error('💀 [AUTH ERROR] Token verification failed:', error);
        localStorage.removeItem('deathaius_token');
        this.showLoginScreen();
      }
    } else {
      this.showLoginScreen();
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Login/Register forms
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Chat interface
    document.getElementById('send-message-btn').addEventListener('click', () => this.sendMessage());
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Room creation
    document.getElementById('create-room-btn').addEventListener('click', () => this.showCreateRoomModal());
    document.getElementById('create-room-form').addEventListener('submit', (e) => this.handleCreateRoom(e));

    // Video controls
    document.getElementById('toggle-video').addEventListener('click', () => this.toggleVideo());
    document.getElementById('toggle-audio').addEventListener('click', () => this.toggleAudio());

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.hideModal());
    });

    // Click outside modal to close
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hideModal();
      }
    });
  }

  showLoadingScreen() {
    document.getElementById('loading-screen').classList.remove('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-screen').classList.add('hidden');
  }

  showLoginScreen() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('chat-screen').classList.add('hidden');
  }

  showChatScreen() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    
    this.connectSocket();
    this.loadRooms();
    this.loadOnlineUsers();
  }

  switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.getElementById(`${tab}-form`).classList.remove('hidden');
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('deathaius_token', data.token);
        this.currentUser = data.user;
        this.showChatScreen();
      } else {
        this.showError(data.error);
      }
    } catch (error) {
      console.error('💀 [LOGIN ERROR]', error);
      this.showError('Login failed. Please try again.');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const displayName = document.getElementById('register-display-name').value;
    const password = document.getElementById('register-password').value;
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, displayName, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('deathaius_token', data.token);
        this.currentUser = data.user;
        this.showChatScreen();
      } else {
        this.showError(data.error);
      }
    } catch (error) {
      console.error('💀 [REGISTER ERROR]', error);
      this.showError('Registration failed. Please try again.');
    }
  }

  async verifyToken(token) {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.currentUser = data.user;
      return true;
    } else {
      throw new Error('Invalid token');
    }
  }

  connectSocket() {
    const token = localStorage.getItem('deathaius_token');
    
    this.socket = io({
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('💀 [SOCKET] Connected to DeathAIAUS');
    });

    this.socket.on('disconnect', () => {
      console.log('💀 [SOCKET] Disconnected from DeathAIAUS');
    });

    this.socket.on('error', (error) => {
      console.error('💀 [SOCKET ERROR]', error);
      this.showError(error.message);
    });

    this.socket.on('room_joined', (data) => {
      this.currentRoom = data.room;
      this.updateRoomInfo();
      this.loadRoomMessages();
    });

    this.socket.on('user_joined', (data) => {
      this.addSystemMessage(`${data.user.displayName} joined the room`);
      this.loadOnlineUsers();
    });

    this.socket.on('user_left', (data) => {
      this.addSystemMessage(`${data.user.displayName} left the room`);
      this.loadOnlineUsers();
    });

    this.socket.on('new_message', (data) => {
      this.addMessage(data.message, data.user);
    });

    this.socket.on('user_typing', (data) => {
      this.updateTypingIndicator(data);
    });

    // WebRTC signaling
    this.socket.on('webrtc_offer', (data) => this.handleWebRTCOffer(data));
    this.socket.on('webrtc_answer', (data) => this.handleWebRTCAnswer(data));
    this.socket.on('webrtc_ice_candidate', (data) => this.handleWebRTCIceCandidate(data));
  }

  async loadRooms() {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      
      if (response.ok) {
        this.renderRooms(data.rooms);
      }
    } catch (error) {
      console.error('💀 [ROOMS ERROR]', error);
    }
  }

  async loadOnlineUsers() {
    try {
      const response = await fetch('/api/users/online');
      const data = await response.json();
      
      if (response.ok) {
        this.renderUsers(data.users);
      }
    } catch (error) {
      console.error('💀 [USERS ERROR]', error);
    }
  }

  renderRooms(rooms) {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = '';
    
    rooms.forEach(room => {
      const roomElement = document.createElement('div');
      roomElement.className = 'room-item';
      roomElement.innerHTML = `
        <div class="room-name">${room.displayName}</div>
        <div class="room-info">${room.currentUsers}/${room.maxUsers} users</div>
      `;
      
      roomElement.addEventListener('click', () => this.joinRoom(room.name));
      roomList.appendChild(roomElement);
    });
  }

  renderUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    users.forEach(user => {
      const userElement = document.createElement('div');
      userElement.className = 'user-item';
      userElement.innerHTML = `
        <div class="user-name">${user.displayName}</div>
        <div class="user-status ${user.isOnline ? 'online' : 'offline'}"></div>
      `;
      userList.appendChild(userElement);
    });
  }

  async joinRoom(roomName) {
    if (this.currentRoom && this.currentRoom.name === roomName) return;
    
    try {
      this.socket.emit('join_room', { roomName });
    } catch (error) {
      console.error('💀 [JOIN ROOM ERROR]', error);
      this.showError('Failed to join room');
    }
  }

  updateRoomInfo() {
    if (this.currentRoom) {
      document.getElementById('current-room-name').textContent = this.currentRoom.displayName;
      document.getElementById('room-user-count').textContent = `(${this.currentRoom.currentUsers} users)`;
    }
  }

  sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content || !this.currentRoom) return;
    
    this.socket.emit('send_message', {
      roomName: this.currentRoom.name,
      content,
      type: 'text'
    });
    
    input.value = '';
  }

  addMessage(message, user) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    
    const isOwn = user.id === this.currentUser.id;
    const isSystem = message.type === 'system';
    const isAI = message.type === 'ai';
    
    messageElement.className = `message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''} ${isAI ? 'ai' : ''}`;
    
    if (isSystem) {
      messageElement.innerHTML = `
        <div class="message-content">${message.content}</div>
      `;
    } else {
      messageElement.innerHTML = `
        <div class="message-header">
          <span class="message-username">${user.displayName || user.username}</span>
          <span class="message-time">${new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${message.content}</div>
      `;
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addSystemMessage(content) {
    this.addMessage({
      content,
      type: 'system',
      createdAt: new Date().toISOString()
    }, {});
  }

  async loadRoomMessages() {
    if (!this.currentRoom) return;
    
    try {
      const response = await fetch(`/api/rooms/${this.currentRoom.name}/messages`);
      const data = await response.json();
      
      if (response.ok) {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';
        
        data.messages.forEach(message => {
          // Find user info for each message
          const user = { id: message.user, username: message.username };
          this.addMessage(message, user);
        });
      }
    } catch (error) {
      console.error('💀 [MESSAGES ERROR]', error);
    }
  }

  updateTypingIndicator(data) {
    const indicator = document.getElementById('typing-indicator');
    
    if (data.isTyping) {
      indicator.textContent = `${data.username} is typing...`;
    } else {
      indicator.textContent = '';
    }
  }

  showCreateRoomModal() {
    document.getElementById('create-room-modal').classList.remove('hidden');
  }

  hideModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  }

  async handleCreateRoom(e) {
    e.preventDefault();
    
    const name = document.getElementById('room-name').value;
    const displayName = document.getElementById('room-display-name').value;
    const description = document.getElementById('room-description').value;
    const password = document.getElementById('room-password').value;
    const maxUsers = document.getElementById('room-max-users').value;
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('deathaius_token')}`
        },
        body: JSON.stringify({
          name,
          displayName,
          description,
          password: password || null,
          maxUsers: parseInt(maxUsers)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.hideModal();
        this.loadRooms();
        this.joinRoom(data.room.name);
      } else {
        this.showError(data.error);
      }
    } catch (error) {
      console.error('💀 [CREATE ROOM ERROR]', error);
      this.showError('Failed to create room');
    }
  }

  async toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
        
        const btn = document.getElementById('toggle-video');
        btn.textContent = this.isVideoEnabled ? '📹' : '📹❌';
      }
    }
  }

  async toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
        
        const btn = document.getElementById('toggle-audio');
        btn.textContent = this.isAudioEnabled ? '🎤' : '🎤❌';
      }
    }
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('deathaius_token')}` }
      });
    } catch (error) {
      console.error('💀 [LOGOUT ERROR]', error);
    } finally {
      localStorage.removeItem('deathaius_token');
      this.currentUser = null;
      this.currentRoom = null;
      
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      this.showLoginScreen();
    }
  }

  showError(message) {
    const errorElement = document.getElementById('auth-error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    setTimeout(() => {
      errorElement.classList.remove('show');
    }, 5000);
  }

  // WebRTC methods (placeholder for now)
  handleWebRTCOffer(data) {
    console.log('💀 [WEBRTC] Received offer from', data.fromUsername);
  }

  handleWebRTCAnswer(data) {
    console.log('💀 [WEBRTC] Received answer from', data.fromUserId);
  }

  handleWebRTCIceCandidate(data) {
    console.log('💀 [WEBRTC] Received ICE candidate from', data.fromUserId);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.deathAI = new DeathAIAUS();
});
