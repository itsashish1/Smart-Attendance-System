# Smart Attendance System

> A full-stack web application for automated college attendance management with real-time tracking, analytics, and reporting.

## Project Overview

Smart Attendance System is a modern web-based solution designed to digitize and automate the attendance tracking process in educational institutions. It replaces manual roll-calls with an efficient, real-time system that saves time and provides accurate data.

## Tech Stack

### Frontend...
- React.js with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express.js
- RESTful API architecture
- JWT authentication
- bcrypt for password hashing

### Database
- MongoDB (NoSQL)
- Mongoose ODM

### Features
- Student and Faculty login portals
- Mark attendance with one click
- Real-time attendance dashboard
- Generate monthly/weekly reports
- Export attendance data as CSV/PDF
- Responsive design for mobile and desktop
- Role-based access control (Admin, Faculty, Student)

## Project Structure
```
Smart-Attendance-System/
|-- frontend/          # React frontend
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- utils/
|   |-- public/
|-- backend/           # Node.js backend
|   |-- controllers/
|   |-- models/
|   |-- routes/
|   |-- middleware/
|   |-- config/
|-- database/          # MongoDB schemas
```

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/attendance | Get all attendance |
| POST | /api/attendance | Mark attendance |
| GET | /api/students | Get all students |
| GET | /api/reports | Generate reports |

## Screenshots

Add screenshots of the application here.

## License
MIT License

## Author
Ashish Yadav
