# Logifleet (SOA Project)

A fleet management system built with a Service-Oriented Architecture (Microservices) using Spring Boot and React.

## Architecture

This project consists of the following microservices and components:

### Backend Services (Spring Boot)
* **eureka-server**: Service Registry for service discovery.
* **api-gateway**: API Gateway that routes requests to the appropriate microservices.
* **auth-service**: Handles user authentication and authorization.
* **vehicle-service**: Manages vehicle inventory and status.
* **maintenance-service**: Tracks and manages vehicle maintenance schedules.
* **trip-service**: Manages trip scheduling, assignments, and tracking.

### Frontend
* **logifleet-frontend**: The user interface built with React and Vite.

## Getting Started

### Prerequisites
* Java 17 or higher
* Node.js and npm
* Maven (embedded wrapper available in services)

### Running the Application

1. **Start the Eureka Server** first to enable service discovery.
2. **Start the API Gateway** and other backend microservices (`auth-service`, `vehicle-service`, `maintenance-service`, `trip-service`).
3. **Start the Frontend**:
   ```bash
   cd logifleet-frontend
   npm install
   npm run dev
   ```

## Testing
Please refer to the `PS040_TESTING_GUIDE.txt` file for detailed testing instructions and API endpoints.
