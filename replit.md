# Solar Panel Efficiency Optimizer

## Overview

An AI-powered solar panel monitoring and optimization platform that provides real-time performance tracking, predictive analytics, and smart maintenance recommendations. The application simulates IoT sensor data to monitor solar panel efficiency, environmental conditions, and system health, while using AI algorithms to predict degradation risks and suggest optimization actions.

**Core Purpose:** Enable users to maximize solar panel efficiency through intelligent monitoring, early fault detection, and data-driven maintenance recommendations.

**Key Features:**
- Real-time dashboard with live sensor metrics and efficiency tracking
- AI-powered predictive analytics for performance degradation
- Smart recommendation engine for maintenance and optimization
- System health monitoring and alerting
- Historical data analysis and trend visualization
- Offline-first architecture for rural deployments

## User Preferences

Preferred communication style: Simple, everyday language.

## AWS Lambda AI Integration

### SouryaNova Brain Setup

The application integrates with AWS Lambda for AI-powered recommendations using Mistral 7B model via HuggingFace.

**Lambda Endpoint:** `https://b32srcnf7k.execute-api.ap-southeast-2.amazonaws.com/default/SouryaNova-Brain`

**How to Configure:**

1. **Get HuggingFace API Key:**
   - Visit https://huggingface.co/settings/tokens
   - Create a free account
   - Generate an API token

2. **Set Environment Variables:**
   ```
   AWS_LAMBDA_URL=https://b32srcnf7k.execute-api.ap-southeast-2.amazonaws.com/default/SouryaNova-Brain
   HF_API_KEY=your_huggingface_api_key
   ```

3. **API Endpoint:** `POST /api/ai/lambda-advice`
   - Accepts: `voltage`, `ldr_diff`, `dustLevel`, `efficiency`, `temperature`
   - Returns: AI-generated advice from Mistral model
   - Source: AWS Lambda orchestrated with HuggingFace Mistral-7B

4. **Frontend Access:**
   - New page: `/ai-recommendations`
   - Displays current panel status
   - Calls Lambda with real sensor data
   - Shows AI-powered recommendations in real-time

### System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, using Vite as the build tool

**UI Component Library:** Radix UI primitives with shadcn/ui components styled using Tailwind CSS

**Design System:** Material Design 3 principles with dashboard specialization
- Custom color palette optimized for renewable energy themes (green, yellow, blue)
- Typography using Inter for UI and JetBrains Mono for metrics
- Comprehensive theming support (light/dark modes)
- Information-dense layouts for data visualization

**State Management:** TanStack Query (React Query) for server state management
- Custom query client with centralized API request handling
- Automatic refetching disabled to reduce unnecessary API calls
- Built-in error handling and unauthorized request management

**Routing:** Wouter for lightweight client-side routing

**Key Pages:**
- Dashboard: Real-time metrics, energy output charts, efficiency gauges
- Analytics: Predictive analytics, degradation risk analysis, trend forecasting
- Recommendations: AI-generated maintenance suggestions with impact scoring
- AWS AI: Lambda-powered recommendations using Mistral 7B model
- System Health: Sensor status, diagnostic information, system alerts
- Settings: Configuration for thresholds and automation preferences

### Backend Architecture

**Runtime:** Node.js with Express.js

**Language:** TypeScript with ES modules

**API Design:** RESTful endpoints organized by feature domain
- `/api/dashboard/*` - Dashboard statistics and historical data
- `/api/sensors/*` - Sensor readings and real-time data
- `/api/predictions/*` - AI predictions and forecasts
- `/api/recommendations/*` - Smart recommendations and implementation tracking
- `/api/ai/lambda-advice` - AWS Lambda AI recommendations (POST)
- `/api/alerts/*` - System alerts and notifications
- `/api/system-health/*` - System health status and diagnostics

**Data Simulation Layer:**
- `SensorSimulator` class generates realistic IoT sensor data
- Time-based patterns for sunlight intensity, temperature, and dust accumulation
- Simulates environmental variations throughout the day
- Produces readings for: energy output, sunlight intensity, temperature, dust levels, tilt angle, efficiency percentage

**AI Engine:**
- Simulates RandomForest-style predictions for efficiency forecasting
- Calculates degradation risk based on environmental factors
- Generates actionable recommendations with urgency levels and impact scores
- Provides AI explainability for recommendation transparency

**Storage Strategy:**
- In-memory storage using Map-based data structures (MemStorage class)
- Abstracted through IStorage interface for easy migration to persistent database
- Designed for future PostgreSQL integration via Drizzle ORM
- Schema defined using Drizzle with proper type safety

### Data Storage Solutions

**Current Implementation:** In-memory storage for development and demonstration

**Planned Migration:** PostgreSQL with Drizzle ORM
- Schema already defined in `shared/schema.ts`
- Configuration in `drizzle.config.ts` ready for Neon Database
- Tables designed: sensor_readings, predictions, recommendations, alerts, system_health
- UUID-based primary keys for distributed systems
- Timestamp tracking for all records

**Data Models:**
- **SensorReading:** Real-time IoT measurements (energy, temperature, sunlight, dust, tilt, efficiency)
- **Prediction:** AI-generated forecasts with confidence scores and risk levels
- **Recommendation:** Smart suggestions with type classification, urgency, and impact scoring
- **Alert:** System notifications with severity levels and dismissal tracking
- **SystemHealth:** Sensor status and diagnostic messages

### Authentication and Authorization

**Current State:** No authentication implemented - designed for single-user local/edge deployments

**Design Consideration:** Application targets small-to-medium installations (households, schools, rural microgrids) where multi-user auth is not critical. Future enterprise versions would add:
- Session-based authentication using express-session
- PostgreSQL session store via connect-pg-simple (already in dependencies)
- Role-based access control for multi-site installations

### Build and Deployment

**Development:**
- Vite dev server with HMR for client
- tsx for running TypeScript server without compilation
- Concurrent client/server development workflow

**Production Build:**
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.js`
- Single node process serves both static assets and API
- Environment-based configuration via NODE_ENV

**Optimization:**
- Tree-shaking and code splitting via Vite
- Production builds exclude development tools (Replit plugins, error modals)
- Tailwind CSS purging for minimal CSS bundle

## External Dependencies

### Third-Party UI Libraries
- **Radix UI:** Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui:** Pre-styled component collection built on Radix UI
- **Recharts:** Declarative charting library for data visualization
- **embla-carousel-react:** Carousel component for mobile-optimized layouts
- **cmdk:** Command palette component for keyboard navigation
- **lucide-react:** Icon library with solar/energy-themed icons

### Data and Validation
- **Zod:** Runtime type validation and schema validation
- **drizzle-zod:** Integration between Drizzle ORM schemas and Zod validators
- **date-fns:** Date manipulation and formatting utilities
- **react-hook-form:** Form state management with validation
- **@hookform/resolvers:** Validation resolver for Zod integration

### Database and ORM
- **Drizzle ORM:** Type-safe SQL query builder and ORM
- **@neondatabase/serverless:** Neon PostgreSQL serverless driver
- **connect-pg-simple:** PostgreSQL session store for express-session

### Styling and Theming
- **Tailwind CSS:** Utility-first CSS framework
- **class-variance-authority:** Type-safe variant styling
- **tailwind-merge & clsx:** Utility for merging Tailwind classes

### Development Tools
- **TypeScript:** Type safety across full stack
- **Vite:** Frontend build tool and dev server
- **esbuild:** Fast JavaScript bundler for server build
- **tsx:** TypeScript execution for development
- **@replit/vite-plugin-*:** Replit-specific development enhancements (error modals, banners, cartographer)

### Fonts
- **Google Fonts:** Inter (primary UI font) and JetBrains Mono (monospace for metrics)

### Future Integration Points
- IoT sensor APIs (currently simulated)
- Weather data APIs for enhanced predictions
- Energy grid integration for smart optimization
- Machine learning model deployment (TensorFlow.js or similar)
- Cloud storage for long-term historical data
- Mobile push notifications for critical alerts