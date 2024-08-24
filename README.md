# Antique Auction Web Application (VintageVault)

This project is a web-based auction application for antique items, built using the MERN stack (MongoDB, Express, React, Node.js). The frontend utilizes React with Tailwind CSS and shadcn UI, while the backend is powered by Node.js with Express.

## Table of Contents

- [Antique Auction Web Application (VintageVault)](#antique-auction-web-application-vintagevault)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Features](#features)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:

```bash
    git clone https://github.com/codexsusan/vintagevault.git
    cd vintagevault
```

2. Install backend dependencies:

```bash
    cd backend
    npm install
```

3. Install frontend dependencies:

```bash
    cd ../frontend
    npm install
```

## Configuration

1. Create a `.env` file in the `backend` directory and paste the secrets that is shared with you in the task submission email.
2. For testing notifying users, you can change the user email in `backend/src/constants.ts` file. You can keep your email and login in through the same account.

    For example: 
    ```ts
            export const hardcodedUsers: User[] = [
            // .. keep the existing users
                {
                    id: "5432167890",
                    name: "Susan",
                    email: "your-email@gmail.com",
                    username: "user1",
                    password: "user1",
                    role: "user",
                },
            // ... keep the existing users
            ];
    ```
3. Here are few login credentials for testing purpose:

    For user1:
    - Username: `user1`
    - Password: `user1`

    For user2:
    - Username: `user2`
    - Password: `user2`

    For admin1:
    - Username: `admin1`
    - Password: `admin1`

    For admin2:
    - Username: `admin2`
    - Password: `admin2`


## Running the Application

1. Start the backend server:

```bash
    cd backend
    npm run dev
```

2. In a separate terminal, start the frontend server:

```bash
    cd ../frontend
    npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` or as suggested in terminal to access the frontend application.

## Features

 - User authentication (Admin and Regular users)
 - Home page with paginated item listing and search functionality
 - Item details page with bidding capabilities
 - Auto-bidding feature
 - Administrator dashboard for item management (CRUD operations)
 - Responsive design using Tailwind CSS and shadcn UI