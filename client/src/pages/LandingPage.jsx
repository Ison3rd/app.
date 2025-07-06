import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ChatBubbleLeftRightIcon, 
  FolderIcon, 
  UsersIcon,
  SparklesIcon,
  RocketLaunchIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const LandingPage = () => {
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-time Chat',
      description: 'Connect instantly with animation professionals worldwide through our lightning-fast messaging system.'
    },
    {
      icon: FolderIcon,
      title: 'Project Management',
      description: 'Collaborate on animation projects with role-based permissions and integrated task management.'
    },
    {
      icon: UsersIcon,
      title: 'Role-based Teams',
      description: 'Organize teams by animation roles - from directors to junior animators, everyone has their place.'
    },
    {
      icon: SparklesIcon,
      title: 'File Sharing',
      description: 'Share animation assets, storyboards, and concept art with ease and security.'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Industry Tools',
      description: 'Built for animators, by animators. Integrate with Maya, Blender, and other industry tools.'
    },
    {
      icon: HeartIcon,
      title: 'Community Driven',
      description: 'Join a vibrant community of animation professionals sharing knowledge and opportunities.'
    }
  ]

  const roles = [
    'Animation Producer', 'Animation Director', 'Senior 3D Animator',
    'Concept Artist', 'VFX Artist', 'Technical Director',
    'Storyboard Artist', 'Character Designer', 'Lighting Artist'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AC</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">AnimatorChat</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Connect. Create.{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Animate.
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              The professional chat platform built specifically for animation teams. 
              Collaborate on projects, share assets, and connect with industry professionals 
              from around the world.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                to="/register"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Start Your Journey
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-accent-200 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-success-200 rounded-full opacity-20 animate-pulse-slow"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Collaborate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with the unique needs of animation professionals in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card p-6 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Made for Every Animation Role
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a producer managing projects or a junior animator learning the ropes
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map((role, index) => (
              <motion.span
                key={role}
                className="role-badge role-artist px-4 py-2 text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {role}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Animation Workflow?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of animation professionals already using AnimatorChat to create amazing projects together.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-primary-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="ml-3 text-xl font-bold">AnimatorChat</span>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2024 AnimatorChat. Built for the animation community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage