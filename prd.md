# BPESA Skills Intelligence Hub (SIH) – Product Requirements Document (PRD)
**Version:** 1.0  
**Focus:** MVP-first → Scalable platform  

---

# 1. Product Vision

Create a sector intelligence platform that:
- Aggregates and distributes skills insights, reports, and data
- Enables controlled access to high-value content
- Evolves into a data-driven decision platform for GBS stakeholders

---

# 2. Phase 1 – MVP (Site + Content Access Layer)

## Objective
Launch a clean, functional content platform that:
- Publishes BPESA documents
- Captures user data on access
- Enables admin-driven content and event management
- Introduces monetisation (paid downloads)

---

## 2.1 Core User Journeys

### Public User
1. Visit site  
2. Browse documents  
3. Select document  
4. Enter name and email  
5. System stores details in Supabase  
6. Download link sent via email (Resend)  
7. User downloads document  

### Admin User
1. Login  
2. Upload document  
3. Add metadata (title, description, category, pricing)  
4. Publish  

Additional:
- Manage events  
- Upload member CSV  

### Paid User Flow
1. Select paid document  
2. Enter details  
3. Pay via Paystack  
4. On success:
   - Save transaction  
   - Send download link  

### Member Flow
- Email matched to member list  
- Paid documents unlocked  

---

## 2.2 Features

### Public Website
- Document listing page
- Search and filter
- Document detail page
- Event listing page

### Document Access Control
- Free downloads (email capture)
- Paid downloads (Paystack)
- Member access override

### Admin Portal
- Secure login (Supabase Auth)
- Document management
- Event management
- Member CSV upload

### Email System (Resend)
- Download links
- Payment confirmations

### Data Capture (Supabase)
- Users
- Members
- Documents
- Downloads
- Transactions
- Events

---

## 2.3 Data Model (Simplified)

### Users
- id
- name
- email
- created_at

### Members
- id
- email
- organisation
- tier

### Documents
- id
- title
- description
- file_url
- is_paid
- price
- created_at

### Downloads
- id
- user_id
- document_id
- timestamp
- payment_status

### Transactions
- id
- user_id
- document_id
- amount
- paystack_ref
- status

### Events
- id
- title
- description
- date
- location
- created_at

---

## 2.4 Tech Stack

- Frontend: Next.js (App Router)
- Backend: Supabase (Postgres, Auth, Storage)
- Email: Resend
- Payments: Paystack
- Hosting: Vercel

---

## 2.5 Non-Functional Requirements

- Secure document access
- Fast load times (<3s)
- Mobile responsive
- POPIA-aligned
- Admin-only control

---

## 2.6 Success Metrics

- Number of downloads
- Number of captured users
- Conversion to paid downloads
- Admin usability

---

## 2.7 Out of Scope

- Advanced dashboards
- AI features
- Complex analytics
- API marketplace

---

# 3. Phase 2+ – Full SIH Platform

## Core Expansion

### Intelligence Layer
- Skills dashboards
- Salary benchmarks
- AI readiness index

### Data Ingestion
- Employer systems
- Job scraping
- Training data

### Member Platform
- Tiered access
- Personalised dashboards

### AI Capabilities
- Summarisation
- Trend detection
- Q&A assistant

### Commercialisation
- Subscriptions
- Paid reports
- API access

---

# 4. Delivery Plan

### Weeks 1–2
- Setup project
- Auth
- UI scaffold

### Weeks 3–4
- Document system
- Download capture
- Email integration

### Weeks 5–6
- Payments
- Member logic
- Events

### Weeks 7–8
- Polish
- Security
- Deploy

---

# 5. Design Principles

- Start simple, scale fast
- Capture data early
- Admin-first usability
- Monetisation-ready
- Platform-ready architecture

---

# Final Note

This MVP is the foundation of the full SIH platform.
