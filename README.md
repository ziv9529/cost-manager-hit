# Cost Manager RESTful Web Services

A microservices-based application for managing users and costs with MongoDB persistence and comprehensive logging.

## Architecture

Four independent microservices running on separate ports:

- **Users Service** (3000): Manage users - add, retrieve user information, and calculate total costs
- **Costs Service** (3001): Manage expenses - add costs and generate monthly reports
- **Logs Service** (3002): Retrieve all system logs from MongoDB
- **Admin Service** (3003): Retrieve developer team information

## Setup

### Prerequisites

- Node.js v14+
- MongoDB Atlas account
- npm

### Installation

```bash
# Install dependencies for all services
npm install
```

### Environment Configuration

Each microservice needs its own `.env` file in its directory:

**users-service/.env**

```
MONGODB_URI=mongodb+srv://....
USERS_PORT=3000
```

**costs-service/.env**

```
MONGODB_URI=mongodb+srv://....
COSTS_PORT=3001
```

**logs-service/.env**

```
MONGODB_URI=mongodb+srv://....
LOGS_PORT=3002
```

**admin-service/.env**

```
MONGODB_URI=mongodb+srv://....
ADMIN_PORT=3003
```

**Note:** Each service runs independently with its own environment configuration.

## Running the Services

**Option 1: Run all services from root**

```bash
npm install
npm run start:all
```

**Option 2: Run each microservice individually**

```bash
# Users service
cd users-service
npm install
npm start

# Costs service
cd costs-service
npm install
npm start

# Logs service
cd logs-service
npm install
npm start

# Admin service
cd admin-service
npm install
npm start
```

Each service will connect to MongoDB and log its status.

## API Endpoints

### Users Service (Port 3000)

- `POST /api/add` - Add a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user with total costs

### Costs Service (Port 3001)

- `POST /api/add` - Add a new cost (validates user exists, category valid, no past dates)
- `GET /api/report?id=123&year=2025&month=11` - Get monthly cost report (caches past months)

### Logs Service (Port 3002)

- `GET /api/logs` - Retrieve all system logs

### Admin Service (Port 3003)

- `GET /api/about` - Get developer team information

## Database

MongoDB collections:

- **users** - User documents with id, first_name, last_name, birthday
- **costs** - Cost items with userid, description, category, sum, date
- **logs** - System logs with userid, action, timestamp, details
- **reports** - Cached monthly reports for past months (Computed Design Pattern)

## Features

- **Validation**: All endpoints validate input data and return `{id, message}` error format
- **Computed Design Pattern**: Monthly reports are cached for past months for performance
- **Logging**: All HTTP requests logged to MongoDB via Pino
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Cost Categories**: Supports food, health, housing, sports, education

## Quick Test

```bash
# Add a user
curl -X POST http://localhost:3000/api/add \
  -H "Content-Type: application/json" \
  -d '{"id":123123,"first_name":"John","last_name":"Doe","birthday":"1990-05-15"}'

# Add a cost
curl -X POST http://localhost:3001/api/add \
  -H "Content-Type: application/json" \
  -d '{"userid":123123,"description":"lunch","category":"food","sum":25.50}'

# Get monthly report
curl "http://localhost:3001/api/report?id=123123&year=2026&month=1"

# Get user with total costs
curl http://localhost:3000/api/users/123123
```
