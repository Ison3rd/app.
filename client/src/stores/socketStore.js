import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  onlineUsers: [],
  typingUsers: {},

  // Actions
  connect: () => {
    const { token } = useAuthStore.getState()
    if (!token) return

    const socket = io('http://localhost:5000', {
      auth: { token },
    })

    socket.on('connect', () => {
      console.log('Connected to server')
      set({ connected: true })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      set({ connected: false })
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      set({ connected: false })
    })

    socket.on('user_status_update', (data) => {
      const { userId, status } = data
      const { onlineUsers } = get()
      
      if (status === 'online') {
        if (!onlineUsers.includes(userId)) {
          set({ onlineUsers: [...onlineUsers, userId] })
        }
      } else {
        set({ onlineUsers: onlineUsers.filter(id => id !== userId) })
      }
    })

    socket.on('user_typing', (data) => {
      const { userId, isTyping } = data
      const { typingUsers } = get()
      
      if (isTyping) {
        set({ typingUsers: { ...typingUsers, [userId]: true } })
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          const current = get().typingUsers
          const { [userId]: _, ...rest } = current
          set({ typingUsers: rest })
        }, 3000)
      } else {
        const { [userId]: _, ...rest } = typingUsers
        set({ typingUsers: rest })
      }
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error(error.message || 'Connection error')
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ 
        socket: null, 
        connected: false,
        onlineUsers: [],
        typingUsers: {}
      })
    }
  },

  // Message actions
  sendMessage: (messageData) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('send_message', messageData)
    }
  },

  joinRoom: (roomId) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('join_room', roomId)
    }
  },

  leaveRoom: (roomId) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('leave_room', roomId)
    }
  },

  // Typing indicators
  startTyping: (roomId) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('typing', { roomId, isTyping: true })
    }
  },

  stopTyping: (roomId) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('typing', { roomId, isTyping: false })
    }
  },

  // Status updates
  updateStatus: (status) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('status_update', status)
    }
  },

  // Project updates
  sendProjectUpdate: (projectData) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('project_update', projectData)
    }
  },

  // Event listeners
  onMessage: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.on('receive_message', callback)
    }
  },

  onProjectUpdate: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.on('project_updated', callback)
    }
  },

  // Cleanup
  offMessage: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.off('receive_message', callback)
    }
  },

  offProjectUpdate: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.off('project_updated', callback)
    }
  },
}))