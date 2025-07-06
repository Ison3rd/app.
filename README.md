# AnimatorChat 🎬

A professional WhatsApp-like chat application built specifically for animation teams and industry professionals. Connect, collaborate, and create with role-based features designed for the animation workflow.

## ✨ Features

### 🔐 Authentication & User Management
- **Role-based Registration**: 20+ animation industry roles (Animation Producer, Director, 3D Animators, VFX Artists, etc.)
- **Professional Profiles**: Skills, experience levels, portfolios, and specializations
- **JWT Authentication**: Secure token-based authentication
- **Real-time Status**: Online/offline/busy/away indicators

### 💬 Real-time Communication
- **Instant Messaging**: WhatsApp-like chat experience with Socket.IO
- **Room Types**: Direct messages, group chats, project rooms, department channels
- **File Sharing**: Support for animation assets, storyboards, concept art
- **Typing Indicators**: Real-time typing status
- **Message Reactions**: React to messages with emojis
- **Mentions & Replies**: Tag team members and reply to specific messages

### 🎯 Role-based Features
- **Permission System**: Role-based access control for different features
- **Team Organization**: Organize teams by animation roles and departments
- **Project Management**: Create and manage animation projects with tasks
- **Specialized Channels**: Department-specific chat rooms (Animation, VFX, Sound, etc.)

### 📊 Project Management
- **Project Creation**: Animation producers and directors can create projects
- **Team Assignment**: Add team members with specific roles and permissions
- **Task Management**: Create, assign, and track animation tasks
- **Progress Tracking**: Visual progress indicators and milestone management
- **Asset Management**: Upload and organize project assets

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: User preference-based themes
- **Smooth Animations**: Framer Motion powered interactions
- **Tailwind CSS**: Modern, clean, and professional design
- **Role Badges**: Visual indicators for user roles and expertise

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Multer & Cloudinary** for file uploads

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Hook Form** for form handling
- **React Router** for navigation
- **Socket.IO Client** for real-time features

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/animator-chat.git
   cd animator-chat
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   npm run install-deps
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp client/.env.example client/.env

   # Edit the .env files with your configuration
   ```

4. **Database Setup**
   - Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`
   - The application will automatically create collections on first run

5. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev

   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## 🎭 Animation Roles Supported

### Leadership Roles
- **Animation Producer** - Project oversight and management
- **Animation Director** - Creative direction and vision

### Animation Specialists
- **Senior 3D Animator** - Lead animation work
- **Intermediate 3D Animator** - Character and object animation
- **Junior 3D Animator** - Entry-level animation tasks

### Art & Design
- **Concept Artist** - Visual development and ideation
- **Character Designer** - Character creation and design
- **Environment Artist** - Background and world building
- **Storyboard Artist** - Visual storytelling and planning

### Technical Roles
- **Technical Director** - Pipeline and technical oversight
- **Rigger** - Character and object rigging
- **Lighting Artist** - Scene lighting and atmosphere
- **VFX Artist** - Visual effects and compositing

### Specialized Roles
- **Sound Designer** - Audio and music
- **Editor** - Post-production and assembly
- **Motion Graphics Artist** - Graphics and titles
- **Previz Artist** - Previsualization

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get users with filters
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/status` - Update user status

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new room
- `GET /api/chat/rooms/:id/messages` - Get room messages

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `POST /api/projects/:id/team` - Add team member
- `POST /api/projects/:id/tasks` - Create task

## 🎯 Role-based Permissions

### Animation Producer
- ✅ Create and manage projects
- ✅ Access financial information
- ✅ Manage team members
- ✅ Review and approve work

### Animation Director
- ✅ Create projects (with producer approval)
- ✅ Manage creative direction
- ✅ Review and approve work
- ✅ Manage team assignments

### Senior Animator
- ✅ Review junior work
- ✅ Manage animation tasks
- ✅ Mentor team members
- ✅ Lead animation sequences

### Junior Roles
- ✅ Participate in projects
- ✅ Submit work for review
- ✅ Access learning resources
- ✅ Collaborate with team

## 🚀 Deployment

### Backend Deployment
1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to platforms like:
   - Heroku
   - Vercel
   - DigitalOcean
   - AWS EC2

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Animation Community** - For inspiring this project
- **Socket.IO** - For real-time communication
- **Tailwind CSS** - For beautiful, responsive design
- **React Team** - For the amazing framework

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the [Issues](https://github.com/your-username/animator-chat/issues) page
2. Create a new issue if your problem isn't already addressed
3. Contact the development team

---

**Built with ❤️ for the Animation Community**