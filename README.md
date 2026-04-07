# NeighborNet

NeighborNet is a full-stack student housing review platform built for Lakehead University students. It helps students explore rentals, read honest reviews, report housing issues, upload listings with images, message other students, and access admin moderation tools when needed.

The goal of the project is to give students a safer, more transparent way to learn about housing before signing a lease.

## What NeighborNet Does

NeighborNet allows Lakehead students to:

- create an account using a `@lakeheadu.ca` email address
- add a property with rent, type, distance to campus, and photos
- browse housing listings submitted by other students
- open a property page to read reviews and issue reports
- write reviews and report issues after logging in
- message other registered students inside the app
- receive moderation warnings if their content is flagged

Admins can:

- access admin dashboard
- review and update issue status
- remove properties
- remove reviews
- warn users
- ban or restore users

## Main Features

- University-only authentication using `@lakeheadu.ca` email addresses
- Student signup with first name and last name
- Property creation with image upload support
- Duplicate property prevention
- Property browsing and detail pages
- Reviews and ratings
- Issue reporting for mold, pests, heat, noise, safety, maintenance, and other concerns
- In-app student messaging
- Admin moderation dashboard
- Warning and ban system with user-facing moderation banner

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS 4

### Backend

- Node.js
- Express
- Mongoose
- JWT authentication
- bcryptjs

### Database

- MongoDB Atlas

## Project Structure

```text
NeighborNet/
├── client/                  # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # Shared UI components
│   └── lib/                 # Frontend utilities
├── server/                  # Express backend
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── middleware/          # Auth + role middleware
└── README.md
```

## Core Data Models

### User

- first name
- last name
- full name
- email
- password
- role (`student` or `admin`, derived from `ADMIN_EMAILS`)
- moderation status (`active`, `warned`, `banned`)
- warning count
- moderation reason

### Property

- area / address
- rent range
- property type
- distance to campus
- image list
- created by
- linked user

### Review

- property reference
- reviewer name
- reviewer user reference
- rating
- comment

### Issue

- property reference
- issue type
- description
- reporter name
- reporter user reference
- status (`open`, `reviewing`, `resolved`)

### Message

- sender email
- recipient email
- message text

## Authentication and Access Rules

- Only `@lakeheadu.ca` emails are allowed to sign up and log in.
- Users must be logged in to:
  - add properties
  - post reviews
  - report issues
  - send chat messages
- Anonymous reviews and anonymous issue reports are not allowed.
- Banned users can still browse the platform, but they cannot create content or send messages.
- Admin access is controlled through the `ADMIN_EMAILS` value in `server/.env`.

## Duplicate Property Protection

NeighborNet prevents duplicate listings when the following values match an existing property:

- area / address
- rent range
- property type
- distance to campus

If a duplicate is detected, the app tells the user the property already exists and directs them to the existing listing instead.

## Property Image Support

- Users can upload up to 4 images per property
- Images are currently stored as data URLs in MongoDB for this student project
- These images appear on browse cards and the property details page

## Local Development Setup

### Prerequisites

Make sure you have the following installed:

- Node.js 18+ recommended
- npm
- MongoDB Atlas account and connection string

### 1. Clone the Repository

```bash
git clone https://github.com/pushkarSingh9900/neighbornet
cd neighbornet
```

### 2. Install Dependencies

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a file named `server/.env`.

Example:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAILS=youradmin@lakeheadu.ca
```

### Environment Variable Notes

#### `MONGO_URI`

Your MongoDB Atlas connection string.

#### `JWT_SECRET`

Used to sign login tokens.

#### `ADMIN_EMAILS`

Comma-separated list of emails that should get admin access.

Example:

```env
ADMIN_EMAILS=admin1@lakeheadu.ca,admin2@lakeheadu.ca
```

### 4. Start the Backend

From the `server` folder:

```bash
npm run dev
```

Expected output:

```text
MongoDB connected
Server running on port 8000
```

The backend runs on:

```text
http://127.0.0.1:8000
```

### 5. Start the Frontend

Open another terminal and run:

```bash
cd client
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

### 6. Open the App

Visit:

```text
http://localhost:3000
```

### Important Development Note

For local development, use:

```bash
npm run dev
```

Do not use:

```bash
npm start
```

unless you have already created a production build with:

```bash
npm run build
```

This applies especially to the Next.js frontend.

## Admin Setup

### How to Create an Admin Account

1. Add your email to `ADMIN_EMAILS` inside `server/.env`
2. Restart the backend
3. Sign up or log in using that exact `@lakeheadu.ca` email
4. Open `/admin`

If you updated `ADMIN_EMAILS` while already logged in, log out and log back in once.

## Typical User Flow

### Student Flow

1. Sign up using a `@lakeheadu.ca` email
2. Log in
3. Add a property with details and photos
4. Browse properties added by other students
5. Open a property page
6. Add a review or report an issue
7. Message other students through the chat page

### Admin Flow

1. Log in using an email listed in `ADMIN_EMAILS`
2. Open the admin dashboard
3. Review platform counts and moderation data
4. Update issue status
5. Remove bad reviews or duplicate/inappropriate properties
6. Warn users or ban users if needed

## Key Routes

### Frontend Pages

- `/` - home page
- `/signup` - signup page
- `/login` - login page
- `/properties` - browse properties
- `/properties/[id]` - property details page
- `/add-property` - add property form
- `/chat` - student messaging page
- `/admin` - admin dashboard

### Backend API Routes

- `/api/auth` - signup, login, current user session
- `/api/properties` - add and fetch properties
- `/api/reviews` - add and fetch reviews
- `/api/issues` - add and fetch issue reports
- `/api/messages` - contacts, conversations, messages
- `/api/admin` - moderation dashboard and admin actions

## Troubleshooting

### MongoDB Atlas Connection Error

If you see a connection error:

- make sure `MONGO_URI` is correct
- make sure your current IP address is whitelisted in MongoDB Atlas Network Access
- make sure your database user and password are valid
- if your password contains special characters, URL-encode them in the connection string

### Frontend Says It Cannot Reach the Backend

Check that:

- the backend is actually running
- it is running on port `8000`
- `client/lib/api.js` or `NEXT_PUBLIC_API_URL` points to `http://127.0.0.1:8000`

### Admin Access Required Error

If you should be an admin but the app says otherwise:

- confirm your email is inside `ADMIN_EMAILS`
- restart the backend
- log out
- log back in

### Warning or Ban Not Showing Immediately

NeighborNet refreshes moderation status when the app reloads or when the browser tab regains focus. If an admin has just warned or banned a user:

- refresh the page
- or switch away from the tab and come back

## Current Limitations

- Property images are stored directly in MongoDB as data URLs for simplicity
- Messaging is database-backed but not real-time with websockets
- There is no AI recommendation engine yet

## Future Improvements

- Real-time chat with sockets
- Cloud image storage
- AI-based housing recommendations
- Stronger analytics for admins
- Multi-university expansion

## Author

Pushkar Singh  
Computer Science Student  
Lakehead University
