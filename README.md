# 🏭 Rishabh Instruments - Enterprise Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen?style=for-the-badge&logo=netlify)](https://rishabh-instruments.netlify.app)
[![Backend API](https://img.shields.io/badge/API-Live%20Backend-blue?style=for-the-badge&logo=render)](https://rishabh-instruments-backend.onrender.com/api/health)

> A comprehensive **Enterprise Management System** designed for manufacturing operations, featuring materials tracking, project management, BOM creation, maintenance scheduling, and task management.

## ✨ Features

### 🔐 **Authentication & User Management**
- Secure user authentication with JWT tokens
- Role-based access control (Admin, Manager, Operator)
- User profile management

### 📦 **Materials Management**
- Complete inventory tracking
- Low stock alerts and notifications
- Material categorization and search
- Quantity management with history

### 🏗️ **Project Management**
- Full project lifecycle management
- Milestone tracking and progress monitoring
- Resource allocation and planning
- Status updates and reporting

### 📋 **Bill of Materials (BOM)**
- Create and manage product BOMs
- Component tracking and costing
- Version control and approval workflow
- Cost analysis and reporting

### 🔧 **Maintenance Management**
- Preventive maintenance scheduling
- Equipment tracking and history
- Maintenance task management
- Compliance monitoring

### ✅ **Task Management**
- Task creation and assignment
- Progress tracking and updates
- Priority management
- Team collaboration features

### 📊 **Dashboard & Analytics**
- Real-time operational overview
- Performance metrics and KPIs
- Interactive charts and visualizations
- Customizable reporting

### 🔔 **Notifications System**
- Real-time notifications
- Alert management
- Email notifications (configurable)
- System-wide announcements

## 🚀 Live Demo

**🌐 Application:** [https://rishabh-instruments.netlify.app](https://rishabh-instruments.netlify.app)

### Demo Credentials:
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@rishabh.co.in` | `admin123` |
| **Manager** | `manager@rishabh.co.in` | `manager123` |
| **Operator** | `operator@rishabh.co.in` | `operator123` |

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - Professional component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **React Toastify** - Notifications

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### **Deployment & Infrastructure**
- **Frontend:** Netlify (Continuous Deployment)
- **Backend:** Render (Cloud Platform)
- **Database:** MongoDB Atlas (Cloud Database)
- **Version Control:** Git & GitHub

## 📁 Project Structure

```
rishabh-system/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main application component
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── models/             # Database models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json
├── mongodb-backup/         # Database backup files
├── DEPLOYMENT_CHECKLIST.md # Deployment guide
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SamarthKasar123/rishabh-system.git
   cd rishabh-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Seed Demo Data** (Optional)
   ```bash
   cd backend
   node seedUsers.js
   node create-sample-materials.js
   node create-sample-projects.js
   ```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rishabh-instruments
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📱 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Dashboard+Overview)

### Materials Management
![Materials](https://via.placeholder.com/800x400/2196F3/FFFFFF?text=Materials+Management)

### Project Management
![Projects](https://via.placeholder.com/800x400/FF9800/FFFFFF?text=Project+Management)

## 🚢 Deployment

This project is configured for easy deployment:

- **Frontend:** Automatically deploys to Netlify on push to main branch
- **Backend:** Automatically deploys to Render on push to main branch
- **Database:** MongoDB Atlas for production data

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

## 📊 API Documentation

### Base URL
- **Production:** `https://rishabh-instruments-backend.onrender.com/api`
- **Development:** `http://localhost:5000/api`

### Authentication
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /dashboard/overview` - Dashboard data
- `GET /materials` - Materials list
- `GET /projects` - Projects list
- `GET /bom` - BOMs list
- `GET /maintenance` - Maintenance records
- `GET /tasks` - Tasks list

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Samarth Kasar**
- GitHub: [@SamarthKasar123](https://github.com/SamarthKasar123)
- LinkedIn: [Connect with me](https://linkedin.com/in/your-profile)

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB team for the robust database solution
- Netlify and Render for seamless deployment platforms
- React community for continuous innovation

## 📈 Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Real-time collaboration features
- [ ] Mobile app development
- [ ] Integration with external ERP systems
- [ ] Advanced inventory optimization
- [ ] Multi-language support
- [ ] Dark mode theme

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the manufacturing industry

</div>
