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
- MongoDB (v4.0.0 or later)

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

1. Create a `.env` file in the `backend` directory with the content that is in the `.env.example` file. As of right now, I have shared the secrets with you, so you can use them for testing purposes only. Not the general way to do it.


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