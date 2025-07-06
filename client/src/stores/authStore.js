import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data
          
          set({ 
            user, 
            token, 
            loading: false,
            error: null 
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed'
          set({ 
            loading: false, 
            error: errorMessage 
          })
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data
          
          set({ 
            user, 
            token, 
            loading: false,
            error: null 
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Registration failed'
          set({ 
            loading: false, 
            error: errorMessage 
          })
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        }
        
        set({ 
          user: null, 
          token: null, 
          loading: false,
          error: null 
        })
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
        
        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ loading: false })
          return
        }

        set({ loading: true })
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const response = await api.get('/auth/me')
          set({ 
            user: response.data, 
            loading: false,
            error: null 
          })
        } catch (error) {
          console.error('Auth check failed:', error)
          set({ 
            user: null, 
            token: null, 
            loading: false,
            error: null 
          })
          
          // Remove token from API headers
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateProfile: async (profileData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.put('/auth/profile', profileData)
          const { user } = response.data
          
          set({ 
            user, 
            loading: false,
            error: null 
          })
          
          toast.success('Profile updated successfully!')
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Profile update failed'
          set({ 
            loading: false, 
            error: errorMessage 
          })
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      updateStatus: async (status) => {
        try {
          const response = await api.put('/users/status', { status })
          const { user } = response.data
          
          set({ user })
          return { success: true }
        } catch (error) {
          console.error('Status update failed:', error)
          return { success: false }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)