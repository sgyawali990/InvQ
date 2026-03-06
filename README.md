## Team Roles

### Kavya — Backend Developer
**Responsibilities**
- Designs database schema and API structure
- Implements core backend logic, including CRUD, authentication, alerts, email, and Stripe
- Supports deployment planning, scalability, and performance

**Current Status**
- Backend folder structure created
- Initial models added: `User.js`, `Item.js`, `Alert.js`
- Initial controllers added: auth, inventory, alerts
- Initial routes added: auth, inventory, alerts
- Middleware and utility files started
- Database config, app setup, and server setup added

**Still To Do**
- Finish working auth flow with JWT
- Complete full CRUD logic and validation
- Connect email alerts
- Implement Stripe subscription logic
- Finalize database behavior and testing


### Caroline — Frontend Developer
**Responsibilities**
- Builds the user interface, including dashboard, forms, and alert indicators
- Integrates frontend with backend APIs
- Applies responsive design and client-side validation
- Builds login/signup, password reset, Stripe, and vendor cart handoff pages

**Current Status**
- Frontend folder structure created
- Pages added: `Dashboard.jsx`, `Login.jsx`, `RegisterUser.jsx`, `CreateProduct.jsx`, `CreateStore.jsx`, `Settings.jsx`, `signup.jsx`
- API service file added: `api.js`
- Base app entry files present

**Still To Do**
- Finish UI design and page logic
- Connect pages to backend API
- Add validation and error handling
- Build reusable components
- Improve responsiveness and polish


### Kaitlyn — UX Designer & QA Analyst
**Responsibilities**
- Designs wireframes, workflows, and icon mappings
- Ensures a clean UX for manual and end-of-day flows
- Maintains style guide and visual feedback consistency
- Tests usability and edge cases, including auth and payments

**Current Status**
- Role assigned
- UX and QA responsibilities defined

**Still To Do**
- Create wireframes and user flows
- Define style guide and design consistency
- Review usability of inventory flows
- Build QA checklist and test edge cases


### Ben — DevOps & Infrastructure / Payments Engineer
**Responsibilities**
- Handles deployment pipeline and environment setup
- Manages email/SMTP configuration
- Implements Stripe payment and free-trial enforcement
- Supports alert scheduling and background jobs

**Current Status**
- Role assigned
- Infra folder present for future deployment setup

**Still To Do**
- Set up deployment pipeline
- Configure environment variables securely
- Implement Stripe billing flow
- Set up SMTP/email configuration
- Plan alert scheduling workflow


### Sirjan — Feature Logic & Systems Engineer
**Responsibilities**
- Engineers business templates and usage modes
- Implements onboarding flows, feature toggles, and threshold logic
- Develops reorder logic and shared system behavior
- Coordinates logic consistency across backend, frontend, and QA

**Current Status**
- Role assigned
- Core feature responsibilities defined

**Still To Do**
- Design business template system
- Implement manual vs end-of-day inventory logic
- Add threshold and reorder decision logic
- Support onboarding and feature toggle planning



## Current Project Progress

### Completed So Far
- Repository structure created
- Backend and frontend directories organized
- Initial backend files for models, controllers, routes, middleware, config, and utilities added
- Initial frontend pages and API service file added
- README started with project overview and tech stack
- Team roles identified

### In Progress
- Refining project documentation
- Building backend logic for authentication, inventory, and alerts
- Building frontend pages for dashboard and user flows
- Organizing responsibilities across the team

### Not Yet Completed
- Full JWT authentication flow
- Password reset by email
- Complete inventory CRUD with validations
- Low-stock detection and alert delivery
- Business templates
- Manual and end-of-day inventory modes
- Reorder assistance and export features
- Vendor cart handoff
- Stripe subscriptions and trial handling
- Full testing and deployment
