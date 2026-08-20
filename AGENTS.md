# Realtor Project - Agent Guidelines & Governance

This document defines the core operational protocols, testing standards, and architectural rules for the Realtor application.

---

## 1. Core Workflow Protocols

- **Mandatory Implementation Plans**: Always create an `implementation_plan.md` artifact detailing the proposed changes, affected files, open questions, and verification strategy before making any code modifications or running mutating tasks.
- **Explicit Approval Required**: Always wait for explicit confirmation and approval from the user before executing an implementation plan.

---

## 2. Testing Standards & Quality Gates

All features and functionality across the application must be covered across the entire test pyramid:

### A. Unit Testing
- **Coverage Threshold**: A minimum of **90% coverage** (for statements, branches, functions, and lines) is strictly required and enforced via test runner configurations.
- **Scope**: Backend business logic, GraphQL resolvers, Mongoose models/schemas, helper utilities, custom hooks, and frontend state management.
- **Framework**: `jest` and `ts-jest`.

### B. UI / Component Testing
- **Scope**: Component rendering, visual states, user interactions, Tamagui theme rendering, and component-level accessibility.
- **Framework**: `jest`, `jest-expo`, and `@testing-library/react-native`.

### C. End-to-End (E2E) Testing
- **Scope**: Complete end-to-end user journeys (e.g., property browsing, search/filter, property creation/editing, authentication/auth flows), real browser interaction, and full frontend-to-backend GraphQL data flow.
- **Framework**: `@playwright/test`.

---

## 3. Tech Stack & Architecture

- **Backend**:
  - Directory: `realtor/`
  - Runtime: Node.js with TypeScript
  - Server & API: Express + Apollo Server (GraphQL)
  - Database: MongoDB via Mongoose ORM
  - Containerization: Dockerfile + Docker Compose
- **Frontend**:
  - Directory: `realtor-ui/`
  - Framework: React Native / Expo (Web-first)
  - UI Library: Tamagui UI
  - State & Data: Apollo Client (`@apollo/client`, `graphql`)
  - Containerization: Dockerfile + Docker Compose
- **Infrastructure**:
  - `docker-compose.yml` orchestrating `mongo`, `realtor` (backend), and `realtor-ui` (frontend).
