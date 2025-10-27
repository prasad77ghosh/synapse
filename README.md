# Synapse

A modern, scalable microservices-based application with a Next.js frontend and NestJS backend services.

## Project Structure

```
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   └── load-balancer/
└── frontend/
    └── synapse/
```

## Technologies Used

### Backend
- **NestJS** (v11) - A progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript** - For type-safe code development
- **Microservices Architecture** - Utilizing NestJS microservices module
- **Jest** - For unit and e2e testing

### Frontend
- **Next.js** (v16) - React framework for production-grade applications
- **React** (v19.2) - JavaScript library for building user interfaces
- **TailwindCSS** (v4) - For utility-first CSS styling
- **TypeScript** - For type-safe code development

## Services

1. **Auth Service**
   - Handles authentication and authorization
   - Built with NestJS
   - Includes unit and e2e testing setup

2. **API Gateway**
   - Manages service routing and communication

3. **Load Balancer**
   - Handles traffic distribution

## Getting Started

### Prerequisites
- Node.js (LTS version)
- npm or yarn
- TypeScript

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/prasad77ghosh/synapse.git
cd synapse
```

2. **Install Frontend Dependencies**
```bash
cd frontend/synapse
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend/auth-service
npm install
```

### Running the Application

#### Frontend
```bash
cd frontend/synapse
npm run dev
```
The frontend will be available at `http://localhost:3000`

#### Backend (Auth Service)
```bash
cd backend/auth-service
npm run start:dev
```
The auth service will be available at `http://localhost:3000` (default NestJS port)

## Development

### Frontend Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Backend Development (Auth Service)
- `npm run start:dev` - Start in development mode with hot-reload
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Testing

### Backend Testing
The auth service includes a comprehensive testing setup using Jest:
- Unit Tests: `npm run test`
- E2E Tests: `npm run test:e2e`
- Test Coverage: `npm run test:cov`

## Project Status
This project is currently under active development.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the UNLICENSED License - see the LICENSE file for details.

## Author
- prasad77ghosh
