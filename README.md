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

2. For the purpose of testing notifications, I want you to register yourself as a user in the application with valid email id.

3. As of right now, you can register yourself as a user simply by going to the register page but to register as an admin, you must go to `http://localhost:5173/auth/admin/register` path as I don't want to expose the admin registration page. As for logging in, you can use the same page for user and admin.

Below I have shared an admin credentials that you can use to login. 

```bash
    email: achyut@gmail.com
    password: 12345678
```

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
 - Item award upon action finish
 - Item bill creation
 - E-mail notifications for item award and item bidding
 - Real-time updates of the latest bid in the Item details
 - Deactivation of the Auto-bidding (in profile page)
