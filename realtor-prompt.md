# Realtor App - Master Scaffold Prompt

*Copy and paste this document into a new AI coding assistant session along with an empty directory. The AI will use this prompt to generate the foundational scaffold for the project from scratch.*

## 1. Project Context & Goal
You are an AI assistant building a full-stack Real Estate ("Realtor") application. The application will be used to list, search, and manage real estate properties. The tool must be built iteratively, starting with a robust project scaffold.

## 2. Tech Stack
- **Version Control**: Git
- **Backend Language**: Node.js (TypeScript, Express)
- **Frontend Language**: React Native / Expo (Web-first) with Tamagui UI
- **Database**: MongoDB (Mongoose ORM)
- **API**: GraphQL (Apollo Server on backend, Apollo Client on frontend)
- **Infrastructure**: Docker Compose (for orchestrating the backend, frontend, and MongoDB services)
- **Environment Management**: `npm` or `yarn`

## 3. Project Structure
Create the project split into two main directories:
- `backend/`: The Node.js GraphQL API.
- `frontend/`: The React Native / Expo UI.

## 4. Initialization Steps
Please execute the following steps to scaffold the environment:

1. **Initialize the Backend (`backend/`)**:
   - Initialize a Node.js project with TypeScript.
   - Install dependencies: `express`, `apollo-server-express`, `graphql`, `mongoose`, `cors`, `dotenv`.
   - Install dev dependencies: `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/node`.
   - Setup a basic Express server integrated with Apollo Server.
   - Connect to a MongoDB instance via Mongoose.
   - Expose a simple "Hello Realtor" GraphQL query.

2. **Initialize the Frontend (`frontend/`)**:
   - Initialize a new React Native Expo project (`npx create-expo-app frontend --yes`).
   - Install Tamagui and its required dependencies for premium UI styling.
   - Install Apollo Client (`@apollo/client`, `graphql`) for data fetching.
   - Connect the Apollo Client to the backend GraphQL endpoint.

3. **Containerization (`docker-compose.yml`)**:
   - Create a `docker-compose.yml` at the root of the project.
   - Define 3 services: 
     - `mongo`: The MongoDB database using the official `mongo` image.
     - `backend`: The Node.js application, exposing the GraphQL port and depending on `mongo`.
     - `frontend`: The Expo React Native web application, exposing the necessary web development ports.

4. **Testing Infrastructure**:
   - Set up `jest` for backend unit testing.
   - Set up `jest`, `jest-expo`, and `@testing-library/react-native` for frontend component testing.
   - Set up `@playwright/test` for frontend UI/E2E testing.

## 5. Instructions for the AI
Follow the initialization steps above to create the environment. Do not build the core real estate business logic yet. Your goal is strictly to set up the scaffold, configure the tools, establish the GraphQL connection between frontend and backend, and ensure the Docker Compose environment starts successfully. Wait for the user to confirm the setup is working before proceeding to build out the Realtor features.
