# Requirements Document: SouryaNova (by OPTINOVA)

## Introduction

SouryaNova is an AI-powered solar energy management system designed specifically for rural India. The system transforms passive solar panels into smart, interactive energy assets by connecting low-cost solar setups to the cloud. Using AI-driven predictions and vernacular language interfaces, SouryaNova advises villagers on optimal energy usage patterns to maximize free solar energy and reduce grid dependency.

The system addresses critical challenges in rural solar adoption: lack of actionable insights, language barriers, poor maintenance practices, and inability to optimize energy usage patterns. By acting as a "Smart Solar Counselor" rather than just a monitoring dashboard, SouryaNova empowers rural communities to extract maximum value from their solar investments.

## Glossary

- **Energy_Agent**: The AI-powered system that provides intelligent solar energy management and advisory services
- **Solar_Yield_Forecaster**: Component that predicts available solar energy for the next 24 hours
- **Vernacular_Bot**: GenAI-powered chatbot that communicates in local Indian languages (Odia, Hindi)
- **Load_Manager**: System that automatically controls appliances based on solar generation patterns
- **Panel_Health_Monitor**: Component that tracks individual solar panel performance and degradation
- **Maintenance_Advisor**: System that calculates optimal cleaning schedules based on cost-benefit analysis
- **IoT_Gateway**: ESP32-based hardware device that collects sensor data and controls relays
- **Cloud_Backend**: AWS-based infrastructure handling data processing, AI inference, and storage
- **Optimization_Token**: Unit of service representing 1 kWp monitored for 1 day
- **Grid_Dependency**: Percentage of energy consumption sourced from electrical grid vs solar
- **Solar_Generation_Peak**: Time period when solar panels produce maximum power output
- **Dust_Accumulation_Index**: Metric quantifying dirt buildup on solar panels affecting efficiency
- **Panel_Degradation_Score**: Health metric indicating long-term performance decline of solar panels

## Requirements

### Requirement 1: Solar Yield Forecasting

**User Story:** As a rural household owner, I want to know how much solar energy will be available in the next 24 hours, so that I can plan when to run heavy appliances like water pumps and washing machines.

#### Acceptance Criteria

1. WHEN weather data and historical generation patterns are available, THE Solar_Yield_Forecaster SHALL predict hourly energy availability for the next 24 hours
2. WHEN generating forecasts, THE Solar_Yield_Forecaster SHALL incorporate current panel health scores and dust accumulation levels
3. WHEN forecast accuracy drops below 80%, THE Solar_Yield_Forecaster SHALL recalibrate using recent actual generation data
4. THE Solar_Yield_Forecaster SHALL update predictions every 3 hours with latest weather information
5. WHEN cloud cover changes significantly, THE Solar_Yield_Forecaster SHALL trigger an immediate forecast update
6. THE Solar_Yield_Forecaster SHALL provide confidence intervals for each hourly prediction
7. WHEN historical data spans less than 7 days, THE Solar_Yield_Forecaster SHALL use regional baseline models until sufficient local data accumulates

### Requirement 2: Vernacular Language Interface

**User Story:** As a villager who speaks Odia, I want to ask questions about my solar system in my native language, so that I can understand and act on energy recommendations without language barriers.

#### Acceptance Criteria

1. WHEN a user sends a voice or text query in Odia or Hindi, THE Vernacular_Bot SHALL process and respond in the same language
2. THE Vernacular_Bot SHALL provide actionable energy advice, not just data summaries
3. WHEN answering queries, THE Vernacular_Bot SHALL reference current solar generation, forecasts, and appliance recommendations
4. THE Vernacular_Bot SHALL respond within 5 seconds for text queries and 8 seconds for voice queries
5. WHEN internet connectivity is unavailable, THE Vernacular_Bot SHALL queue queries and respond when connection resumes
6. THE Vernacular_Bot SHALL maintain conversation context for follow-up questions within a 10-minute session
7. WHEN technical terms are used, THE Vernacular_Bot SHALL explain them using simple, culturally relevant analogies

### Requirement 3: Smart Maintenance Alerts

**User Story:** As a solar panel owner, I want to be notified when my panels need cleaning, so that I can maintain optimal energy generation without unnecessary maintenance costs.

#### Acceptance Criteria

1. WHEN dust accumulation causes energy loss exceeding 5%, THE Maintenance_Advisor SHALL generate a cleaning alert
2. THE Panel_Health_Monitor SHALL calculate individual panel degradation scores daily
3. WHEN a panel's degradation score drops below 85%, THE Maintenance_Advisor SHALL flag it for inspection
4. THE Maintenance_Advisor SHALL estimate financial impact of current dust accumulation in rupees per day
5. THE Maintenance_Advisor SHALL recommend optimal cleaning schedule based on cost-benefit analysis comparing cleaning costs to energy loss
6. WHEN weather forecasts predict rain within 48 hours, THE Maintenance_Advisor SHALL defer non-urgent cleaning recommendations
7. THE Panel_Health_Monitor SHALL detect anomalous performance patterns indicating physical damage or wiring issues

### Requirement 4: Automated Load Management

**User Story:** As a farmer, I want my water pump to automatically turn on when solar generation is highest, so that I can irrigate my fields using free solar energy without manual intervention.

#### Acceptance Criteria

1. WHEN solar generation exceeds a user-configured threshold, THE Load_Manager SHALL activate designated appliance relays
2. THE Load_Manager SHALL prioritize appliances based on user-defined importance rankings
3. WHEN available solar power is insufficient for all queued appliances, THE Load_Manager SHALL activate only the highest priority loads
4. THE Load_Manager SHALL prevent relay activation when forecasted generation indicates insufficient sustained power
5. WHEN an appliance is manually overridden, THE Load_Manager SHALL respect the manual state for 2 hours before resuming automation
6. THE Load_Manager SHALL log all relay activations with timestamps and power levels for audit purposes
7. WHEN grid power is being used, THE Load_Manager SHALL notify users of potential solar optimization opportunities

### Requirement 5: Real-Time Energy Monitoring

**User Story:** As a system administrator, I want to monitor real-time power generation and consumption data, so that I can verify system operation and troubleshoot issues.

#### Acceptance Criteria

1. THE IoT_Gateway SHALL sample voltage and current measurements every 5 seconds
2. THE IoT_Gateway SHALL calculate instantaneous power, daily energy totals, and cumulative energy generation
3. WHEN MQTT connectivity is available, THE IoT_Gateway SHALL transmit sensor data to Cloud_Backend every 30 seconds
4. WHEN internet connectivity is lost, THE IoT_Gateway SHALL buffer up to 24 hours of data locally
5. THE IoT_Gateway SHALL synchronize buffered data when connectivity resumes
6. THE Cloud_Backend SHALL store all sensor data with millisecond-precision timestamps
7. WHEN sensor readings indicate hardware malfunction, THE IoT_Gateway SHALL generate diagnostic alerts

### Requirement 6: Cost Analysis and Reporting

**User Story:** As a solar system owner, I want to see how much money I'm saving by using solar energy, so that I can understand the return on my investment.

#### Acceptance Criteria

1. THE Energy_Agent SHALL calculate daily grid energy savings in rupees using local electricity rates
2. THE Energy_Agent SHALL track cumulative savings since system installation
3. WHEN generating cost reports, THE Energy_Agent SHALL factor in energy losses from dust accumulation and panel degradation
4. THE Energy_Agent SHALL estimate potential additional savings if maintenance recommendations are followed
5. THE Energy_Agent SHALL compare actual savings against projected savings from system specifications
6. THE Energy_Agent SHALL generate monthly summary reports showing generation patterns, savings, and optimization opportunities
7. WHEN Grid_Dependency exceeds 40%, THE Energy_Agent SHALL provide specific recommendations to increase solar utilization

### Requirement 7: Offline-First Architecture

**User Story:** As a villager in a remote area with unreliable internet, I want the system to continue operating during connectivity outages, so that I don't lose critical functionality when internet is unavailable.

#### Acceptance Criteria

1. THE IoT_Gateway SHALL perform all sensor monitoring and relay control functions without internet connectivity
2. THE IoT_Gateway SHALL maintain local copies of the most recent 24-hour forecast
3. WHEN operating offline, THE Load_Manager SHALL use cached forecasts for automation decisions
4. THE IoT_Gateway SHALL store user preferences and automation rules in local non-volatile memory
5. WHEN connectivity resumes, THE IoT_Gateway SHALL synchronize all buffered data within 5 minutes
6. THE Vernacular_Bot SHALL provide cached responses for common queries when offline
7. WHEN critical cloud services are unavailable, THE Energy_Agent SHALL degrade gracefully while maintaining core monitoring functions

### Requirement 8: User Configuration and Preferences

**User Story:** As a system user, I want to configure appliance schedules and automation preferences, so that the system operates according to my specific needs and routines.

#### Acceptance Criteria

1. THE Energy_Agent SHALL allow users to define appliance names, power ratings, and priority levels
2. THE Energy_Agent SHALL support configuration of minimum solar generation thresholds for each appliance
3. WHEN users modify automation rules, THE Energy_Agent SHALL validate configurations for safety and feasibility
4. THE Energy_Agent SHALL allow users to set preferred language (Odia, Hindi, English)
5. THE Energy_Agent SHALL support configuration of electricity rate tiers for accurate cost calculations
6. THE Energy_Agent SHALL allow users to define quiet hours when automation should be disabled
7. WHEN configuration changes are saved, THE Energy_Agent SHALL synchronize them to IoT_Gateway within 60 seconds

### Requirement 9: Security and Data Privacy

**User Story:** As a system owner, I want my energy data and personal information to be secure, so that my privacy is protected and unauthorized users cannot control my appliances.

#### Acceptance Criteria

1. THE Cloud_Backend SHALL encrypt all data transmissions using TLS 1.3 or higher
2. THE Energy_Agent SHALL authenticate all IoT_Gateway connections using device certificates
3. THE Cloud_Backend SHALL implement role-based access control for user data and device management
4. THE Energy_Agent SHALL require user authentication before allowing appliance control or configuration changes
5. THE Cloud_Backend SHALL store personally identifiable information in encrypted form at rest
6. THE Energy_Agent SHALL log all security-relevant events including authentication attempts and configuration changes
7. WHEN suspicious activity is detected, THE Energy_Agent SHALL temporarily disable remote control capabilities and alert the user

### Requirement 10: Scalability and Multi-Device Support

**User Story:** As a commercial building manager, I want to monitor multiple solar installations from a single interface, so that I can manage energy across all my properties efficiently.

#### Acceptance Criteria

1. THE Energy_Agent SHALL support monitoring of up to 50 IoT_Gateway devices per user account
2. THE Cloud_Backend SHALL aggregate data across multiple installations for portfolio-level analytics
3. WHEN managing multiple sites, THE Energy_Agent SHALL provide comparative performance metrics
4. THE Energy_Agent SHALL support hierarchical organization of devices by location or property
5. THE Cloud_Backend SHALL scale to handle 10,000 concurrent IoT_Gateway connections
6. THE Energy_Agent SHALL maintain sub-second response times for dashboard queries with up to 100 devices
7. WHEN adding new devices, THE Energy_Agent SHALL complete provisioning and initial data sync within 5 minutes

### Requirement 11: Token-Based Service Management

**User Story:** As a freemium user, I want to purchase optimization tokens to unlock advanced features, so that I can access AI-powered recommendations when I need them most.

#### Acceptance Criteria

1. THE Energy_Agent SHALL provide free basic monitoring for installations under 5 kWp capacity
2. WHEN users exceed free tier limits, THE Energy_Agent SHALL require Optimization_Tokens for AI forecasting and automation
3. THE Energy_Agent SHALL deduct 1 token per kWp per day for active optimization services
4. THE Energy_Agent SHALL notify users 3 days before token balance reaches zero
5. WHEN token balance is depleted, THE Energy_Agent SHALL gracefully disable premium features while maintaining basic monitoring
6. THE Energy_Agent SHALL allow token purchases through integrated payment gateway
7. THE Energy_Agent SHALL provide token usage analytics showing value delivered per token consumed

### Requirement 12: Weather Integration

**User Story:** As a system operator, I want the forecasting system to incorporate local weather data, so that predictions account for cloud cover, temperature, and seasonal variations.

#### Acceptance Criteria

1. THE Solar_Yield_Forecaster SHALL integrate with weather APIs to obtain hourly forecasts for installation locations
2. THE Solar_Yield_Forecaster SHALL retrieve cloud cover percentage, temperature, humidity, and precipitation forecasts
3. WHEN weather API is unavailable, THE Solar_Yield_Forecaster SHALL use historical seasonal patterns as fallback
4. THE Solar_Yield_Forecaster SHALL adjust predictions based on temperature effects on panel efficiency
5. THE Solar_Yield_Forecaster SHALL account for monsoon season patterns in long-term forecasting
6. THE Solar_Yield_Forecaster SHALL update weather data every 3 hours or when significant changes occur
7. WHEN extreme weather events are forecasted, THE Solar_Yield_Forecaster SHALL generate protective alerts for system safety

