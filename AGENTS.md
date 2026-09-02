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

---

## 4. UI Governance & Interaction Rules

- **Autosave Standard**: All text input fields across the user interface should automatically save when the user stops typing (debounced autosave). Autosave operations must be silent without displaying "Saved", "Autosaving...", or status confirmation badges above input controls.

---

## 5. User Interaction Guidelines

### Query Phrasing vs. Commands
* **"Can you ...?" Queries**: Whenever the user asks a question framed with "Can you..." and ending in a question mark (e.g., *"Can you review the code changes?"*, *"Can you run the tests?"*), treat this strictly as an inquiry requiring a direct, informative response (e.g., explaining capabilities, requirements, readiness, or limitations).
* **No Unsolicited Action**: Do NOT interpret "Can you ...?" questions as commands to trigger tools, modify files, or execute background commands unless the user explicitly follows up with an imperative command (e.g., *"Please do so"*, *"Proceed"*, *"Review it now"*).

### "Rebuild App" Command Protocol
* **Trigger**: When the user says *"rebuild app"*, *"rebuild the app"*, or similar imperative command.
* **Procedure**:
  1. Stop relevant Docker containers (`docker compose down` or stopping target containers).
  2. Rebuild the container images (`docker compose build` or `docker compose up -d --build`).
  3. Start all containers in the background.
  4. Verify service health and ensure database seeding is completed.
