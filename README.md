# Lifemote Tooling

## 🚀 Project Overview

Lifemote Tooling is a comprehensive microservice management and deployment platform designed to simplify service lifecycle management, versioning, and monitoring.

## 📋 Project Purpose

The primary goal of this tooling project is to provide a centralized dashboard for:
- Managing multiple microservices
- Tracking service versions and database schemas
- Initiating and monitoring deployments
- Providing real-time system status and metrics

## 🏗️ Project Structure

```
LifeMote Tooling/
│
├── celery-worker/               # Asynchronous task worker
│   ├── Dockerfile
│   ├── requirements.txt
│   └── worker.py
│
├── fastapi-service/              # Backend API Service
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── models.py
│       ├── schemas.py
│       ├── database.py
│       ├── celery_app.py
│       └── websocket.py
│
├── frontend/                     # React Frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── components/
│       │   ├── ServicesList.js
│       │   ├── DeploymentList.js
│       │   ├── StatusPage.js
│       │   ├── Modal/
│       │   │   ├── DeploymentModal.js
│       │   │   ├── ServiceModal.js
│       │   │   └── Modal.js
│       │   └── ...
│       ├── context/
│       │   └── ThemeContext.js
│       ├── hooks/
│       │   └── useWebSocket.js
│       └── services/
│           ├── api.js
│           └── errorService.js
│
├── mock-service/                 # Mock Service for Testing
│   ├── Dockerfile
│   └── main.go
│
└── docker-compose.yml            # Docker Compose configuration
```

## 🔧 Technical Architecture

### Backend
- **Framework**: FastAPI (Python 3.12.3)
- **ORM**: SQLAlchemy
- **Database**: MySQL
- **Task Queue**: Celery
- **Message Broker**: Redis
- **WebSocket**: Native WebSocket support

### Frontend
- **Framework**: React (18.2.0)
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## ✨ Key Features

1. **Service Management**
   - Add and list microservices
   - View service details (version, database schema)
   - Real-time service status updates

2. **Deployment**
   - Semantic versioning support
   - Background deployment processing
   - Deployment status tracking
   - WebSocket-based live updates

3. **System Monitoring**
   - Comprehensive system status dashboard
   - Service health metrics
   - Deployment history

4. **User Experience**
   - Dark/Light theme support
   - Responsive design
   - Error handling
   - Toast notifications

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Docker
- Docker Compose
- Node.js (for frontend development)
- Python 3.12.3 (for backend development)

## 🚀 Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/HyadeNN/lifemote-tooling.git
cd lifemote-tooling
```

### 2. Environment Configuration

#### Frontend
```bash
cd frontend
# Install dependencies
npm install
```

#### Backend
```bash
cd fastapi-service
# It's recommended to use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

### 3. Docker Deployment

#### Development Mode
```bash
# From the project root directory
docker-compose up --build
```

This command will:
- Build all services
- Start MySQL, Redis, Mock Service
- Launch FastAPI backend
- Start Celery worker
- Bring up React frontend

#### Accessing the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Mock Service: `http://localhost:5000`

## 🔐 Environment Variables

Key environment variables are configured in `docker-compose.yml`:
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASS`: Database password
- `DB_NAME`: Database name
- `REDIS_HOST`: Redis broker host

## 🧪 Development

### Frontend Development
```bash
cd frontend
npm start
```

### Backend Development
```bash
cd fastapi-service
uvicorn app.main:app --reload
```

## 🐞 Debugging and Logging

- Frontend uses `ErrorBoundary` for catching React errors
- Backend logs are output to console
- Celery worker logs can be viewed in Docker compose logs

## 🔍 Important Notes

- The mock service provides a sample health check endpoint
- Deployments are simulated and do not perform actual service updates
- WebSocket provides real-time updates across the application

## 📦 Build for Production

### Frontend
```bash
cd frontend
npm run build
```

### Docker Production Build
```bash
docker-compose -f docker-compose.yml build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the Custom Restrictive Software License. See `LICENSE` for more information.

## 📞 Contact

Hüseyin Efe Karagöz - [huseyinefekaragoz@hyadenn.com](mailto:huseyinefekaragoz@hyadenn.com)

Project Link: [https://github.com/HyadeNN/lifemote-tooling](https://github.com/HyadeNN/lifemote-tooling)

## Usage Restrictions

© [Hüseyin Efe Karagöz] [2025]

This software is provided for viewing purposes only. 

STRICT RESTRICTIONS:
- You may NOT copy this code
- You may NOT modify this code
- You may NOT distribute this code
- You may NOT use this code in any way
- You may NOT create derivative works

All rights reserved. Viewing this code does not grant any permissions.

Permissions for any use must be obtained in writing from the copyright holder.

Currently, only developer has permission beside me is: [@mdegis](https://github.com/mdegis)