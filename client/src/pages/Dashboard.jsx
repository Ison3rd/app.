import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChatBubbleLeftRightIcon, 
  FolderIcon, 
  UsersIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import RoleBadge from '../components/ui/RoleBadge'
import StatusIndicator from '../components/ui/StatusIndicator'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import api from '../utils/api'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [recentRooms, setRecentRooms] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roomsRes, projectsRes, userStatsRes] = await Promise.all([
          api.get('/chat/rooms'),
          api.get('/projects'),
          api.get('/users/stats/overview')
        ])

        setRecentRooms(roomsRes.data.slice(0, 5))
        setRecentProjects(projectsRes.data.projects.slice(0, 5))
        setStats(userStatsRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quickActions = [
    {
      name: 'Start Chat',
      href: '/chat',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      description: 'Connect with team members'
    },
    {
      name: 'New Project',
      href: '/projects',
      icon: FolderIcon,
      color: 'bg-green-500',
      description: 'Create animation project'
    },
    {
      name: 'Find People',
      href: '/users',
      icon: UsersIcon,
      color: 'bg-purple-500',
      description: 'Discover talent'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your animation projects today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar
            src={user?.avatar}
            alt={user?.username}
            size="lg"
            status={user?.status}
            showStatus={true}
          />
          <div>
            <p className="font-medium text-gray-900">{user?.username}</p>
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <StatusIndicator status="online" size="lg" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onlineUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Projects</p>
                <p className="text-2xl font-bold text-gray-900">{recentProjects.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{recentRooms.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={action.href}
                className="block p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{action.name}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Chats */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Chats</h2>
            <Link
              to="/chat"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentRooms.length > 0 ? (
              recentRooms.map((room) => (
                <Link
                  key={room._id}
                  to={`/chat/${room._id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {room.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-600">
                      {room.members.length} members • {room.type}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {new Date(room.lastActivity).toLocaleDateString()}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent chats</p>
                <Link
                  to="/chat"
                  className="btn btn-primary mt-4"
                >
                  Start a conversation
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <FolderIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{project.title}</p>
                    <p className="text-sm text-gray-600">
                      {project.type} • {project.status}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {project.status === 'completed' && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    {project.status === 'on-hold' && (
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    )}
                    {project.progress && (
                      <div className="ml-2 text-sm text-gray-500">
                        {project.progress}%
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent projects</p>
                {user?.rolePermissions?.canCreateProjects && (
                  <Link
                    to="/projects"
                    className="btn btn-primary mt-4"
                  >
                    Create a project
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Role-specific insights */}
      {stats?.roleStats && (
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.roleStats.slice(0, 8).map((role, index) => (
              <div key={role._id} className="text-center">
                <div className="text-2xl font-bold text-primary-600">{role.count}</div>
                <div className="text-sm text-gray-600">{role._id}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard