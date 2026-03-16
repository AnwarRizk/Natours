# Natours

> A full-stack tour booking web application built with Node.js, Express, MongoDB, and Pug.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
  - [Seeding the Database](#seeding-the-database)
- [API Reference](#api-reference)
  - [Authentication](#authentication-endpoints)
  - [Tours](#tours-endpoints)
  - [Users](#users-endpoints)
  - [Reviews](#reviews-endpoints)
- [Authentication & Security](#authentication--security)
- [Data Models](#data-models)
- [Email Service](#email-service)
- [Frontend](#frontend)
- [Scripts](#scripts)

---

## Overview

Natours is a full-stack web application for browsing and booking adventure tours. It exposes both a **server-rendered website** (Pug templates) and a **RESTful JSON API** under `/api/v1/`. Users can explore tours, view interactive maps of tour stops, create accounts, write reviews, and reset their passwords via email.

---

## Features

- Browse a live catalogue of adventure tours with cover images, ratings, difficulty, and pricing
- Interactive tour-stop maps powered by **MapTiler SDK**
- Full user account management — update profile photo, name, email, and password
- JWT-based authentication with secure `httpOnly` cookie delivery
- Role-based access control: `user`, `guide`, `lead-guide`, `admin`
- Reviews and star-ratings system (one review per user per tour, with automatic average recalculation)
- Password reset flow via tokenised email link (10-minute expiry)
- Advanced API querying — filtering, sorting, field selection, and pagination
- Geospatial tour queries — find tours within a radius or get distances from a point
- Aggregation endpoints — tour statistics and monthly business planning views
- Transactional emails (welcome & password reset) via **Brevo** in production or **Mailtrap** in development
- Security hardening: rate limiting, HTTP headers (Helmet), NoSQL injection prevention, XSS sanitisation, HTTP parameter pollution prevention

---

## Tech Stack

### Backend

| Package                  | Role                                            |
| ------------------------ | ----------------------------------------------- |
| `express`                | Web framework                                   |
| `mongoose`               | MongoDB ODM                                     |
| `jsonwebtoken`           | JWT creation & verification                     |
| `bcryptjs`               | Password hashing (cost factor 12)               |
| `cookie-parser`          | JWT cookie parsing                              |
| `helmet`                 | Secure HTTP headers                             |
| `express-rate-limit`     | Rate limiting (100 req / hour per IP on `/api`) |
| `express-mongo-sanitize` | NoSQL injection prevention                      |
| `xss-clean`              | XSS attack prevention                           |
| `hpp`                    | HTTP parameter pollution prevention             |
| `morgan`                 | HTTP request logging (development)              |
| `pug`                    | Server-side templating                          |
| `multer`                 | Photo upload handling                           |
| `sharp`                  | Image resizing & processing                     |
| `nodemailer`             | Email sending                                   |
| `html-to-text`           | HTML → plain-text email conversion              |
| `slugify`                | URL-friendly slug generation                    |
| `validator`              | Email format validation                         |
| `dotenv`                 | Environment variable loading                    |

### Frontend

| Tool               | Role                            |
| ------------------ | ------------------------------- |
| `axios`            | API calls from the browser      |
| `parcel-bundler`   | JS bundling & minification      |
| `@babel/polyfill`  | Browser compatibility polyfills |
| MapTiler SDK (CDN) | Interactive tour location maps  |

### Services

| Service       | Use                              |
| ------------- | -------------------------------- |
| MongoDB Atlas | Cloud database                   |
| Mailtrap      | Email sandbox (development)      |
| Brevo         | Transactional email (production) |

---

## Project Structure

```
├── server.js              # Entry point — DB connection & process error handlers
├── app.js                 # Express setup — middleware stack & route mounting
├── config.env             # Secrets & configuration (never commit)
├── controllers/           # Route handlers (tours, users, reviews, auth, views, errors)
│   ├── authController.js
│   ├── handlerFactory.js  # Generic CRUD factory used by all resource controllers
│   ├── tourController.js
│   ├── userController.js
│   ├── reviewController.js
│   ├── viewsController.js
│   └── errorController.js
├── models/                # Mongoose schemas
│   ├── tourModel.js
│   ├── userModel.js
│   └── reviewModel.js
├── routes/                # Express routers
│   ├── tourRoutes.js
│   ├── userRoutes.js
│   ├── reviewRoutes.js
│   └── viewRoutes.js
├── views/                 # Pug templates (SSR + email)
│   ├── base.pug
│   ├── overview.pug
│   ├── tour.pug
│   ├── login.pug
│   ├── account.pug
│   ├── error.pug
│   └── email/
│       ├── baseEmail.pug
│       ├── welcome.pug
│       └── passwordReset.pug
├── public/                # Static assets
│   ├── css/style.css
│   ├── img/
│   └── js/
│       ├── index.js       # Frontend entry point
│       ├── bundle.js      # Parcel output (committed or built locally)
│       ├── login.js
│       ├── maptiler.js
│       ├── updateSettings.js
│       └── alert.js
├── utils/
│   ├── appError.js        # Custom operational error class
│   ├── catchAsync.js      # Async error wrapper
│   ├── apiFeatures.js     # Filter / sort / paginate query builder
│   └── email.js           # Email class (Nodemailer + Pug templates)
└── dev-data/
    └── data/
        ├── import-dev-data.js  # Seed / delete script
        ├── tours.json
        ├── users.json
        └── reviews.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Mailtrap** account for development email testing (optional but recommended)

### Installation

```bash
git clone https://github.com/your-username/natours.git
cd natours
npm install
```

### Environment Variables

Create a `config.env` file in the project root (never commit this file):

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/natours
DATABASE_LOCAL=mongodb://localhost:27017/natours
DATABASE_PASSWORD=your_atlas_password

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (development — Mailtrap)
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=25
EMAIL_FROM=Natours <natours@example.com>

# Email (production — Brevo)
BREVO_HOST=smtp-relay.brevo.com
BREVO_PORT=587
BREVO_USERNAME=your_brevo_login_email
BREVO_PASSWORD=your_brevo_smtp_key
```

### Running the App

```bash
# Development (with auto-reload via nodemon)
npm start

# Production
npm run start:prod

# Build & watch frontend JS (run in a separate terminal during development)
npm run watch:js
```

The server starts on `http://localhost:3000` by default.

### Seeding the Database

Import sample tours, users, and reviews:

```bash
node dev-data/data/import-dev-data.js --import
```

Delete all seeded data:

```bash
node dev-data/data/import-dev-data.js --delete
```

---

## API Reference

All API endpoints are prefixed with `/api/v1`. Responses follow the JSend convention (`status`, `data`).

### Authentication Endpoints

| Method  | Endpoint                      | Access | Description                       |
| ------- | ----------------------------- | ------ | --------------------------------- |
| `POST`  | `/users/signup`               | Public | Register a new account            |
| `POST`  | `/users/login`                | Public | Log in and receive a JWT          |
| `GET`   | `/users/logout`               | Public | Clear the JWT cookie              |
| `POST`  | `/users/forgotPassword`       | Public | Request a password reset email    |
| `PATCH` | `/users/resetPassword/:token` | Public | Reset password with emailed token |

### Tours Endpoints

| Method   | Endpoint                                                  | Access            | Description                             |
| -------- | --------------------------------------------------------- | ----------------- | --------------------------------------- |
| `GET`    | `/tours`                                                  | Public            | List all tours (filter, sort, paginate) |
| `GET`    | `/tours/:id`                                              | Public            | Get a single tour                       |
| `GET`    | `/tours/top-5-cheap`                                      | Public            | Top 5 cheap, highly-rated tours         |
| `GET`    | `/tours/tour-stats`                                       | Public            | Aggregated stats by difficulty          |
| `GET`    | `/tours/monthly-plan/:year`                               | Guide+            | Tours breakdown by month                |
| `GET`    | `/tours/tours-within/:distance/center/:latlng/unit/:unit` | Public            | Tours within a radius                   |
| `GET`    | `/tours/distances/:latlng/unit/:unit`                     | Public            | Distances from a point to all tours     |
| `POST`   | `/tours`                                                  | Admin, Lead-Guide | Create a tour                           |
| `PATCH`  | `/tours/:id`                                              | Admin, Lead-Guide | Update a tour (supports image upload)   |
| `DELETE` | `/tours/:id`                                              | Admin, Lead-Guide | Delete a tour                           |

**Query string examples:**

```
GET /api/v1/tours?difficulty=easy&sort=-ratingsAverage&limit=5
GET /api/v1/tours?price[gte]=500&price[lte]=1500
GET /api/v1/tours?fields=name,price,duration
GET /api/v1/tours?page=2&limit=10
```

### Users Endpoints

| Method   | Endpoint                  | Access    | Description                  |
| -------- | ------------------------- | --------- | ---------------------------- |
| `GET`    | `/users/me`               | Logged in | Get own profile              |
| `PATCH`  | `/users/updateMe`         | Logged in | Update name, email, or photo |
| `PATCH`  | `/users/updateMyPassword` | Logged in | Change password              |
| `DELETE` | `/users/deleteMe`         | Logged in | Deactivate own account       |
| `GET`    | `/users`                  | Admin     | List all users               |
| `GET`    | `/users/:id`              | Admin     | Get a user                   |
| `PATCH`  | `/users/:id`              | Admin     | Update a user                |
| `DELETE` | `/users/:id`              | Admin     | Delete a user                |

### Reviews Endpoints

| Method   | Endpoint       | Access            | Description      |
| -------- | -------------- | ----------------- | ---------------- |
| `GET`    | `/reviews`     | Logged in         | List all reviews |
| `POST`   | `/reviews`     | User              | Create a review  |
| `GET`    | `/reviews/:id` | Logged in         | Get a review     |
| `PATCH`  | `/reviews/:id` | User (own), Admin | Update a review  |
| `DELETE` | `/reviews/:id` | User (own), Admin | Delete a review  |

Reviews can also be scoped to a tour:

```
GET  /api/v1/tours/:tourId/reviews
POST /api/v1/tours/:tourId/reviews
```

---

## Authentication & Security

- **Tokens** are signed JWTs (`HS256`) delivered as both a JSON response body and a `httpOnly` cookie (marked `secure` in production).
- **`protect` middleware** reads the token from the `Authorization: Bearer …` header or the `jwt` cookie, verifies signature, confirms the user account still exists, and checks whether the password was changed after the token was issued.
- **`restrictTo(...roles)`** middleware enforces role-based access. Available roles: `user`, `guide`, `lead-guide`, `admin`.
- **Passwords** are hashed with bcrypt (cost 12) before persistence and never returned in any API response.
- **Password reset** generates a `crypto.randomBytes(32)` token, stores its SHA-256 hash in the database with a 10-minute expiry, and emails the raw token. On reset, the incoming token is re-hashed for safe comparison.
- **Rate limiting** — 100 requests per hour per IP address on all `/api` routes.
- **HTTP security headers** set by Helmet.
- **NoSQL injection** and **XSS** inputs are sanitised before reaching the database.
- **HTTP Parameter Pollution** is blocked with hpp (whitelist of allowed duplicate query params).

---

## Data Models

### Tour

| Field            | Type            | Notes                             |
| ---------------- | --------------- | --------------------------------- |
| `name`           | String          | Unique, 10–40 chars               |
| `slug`           | String          | Auto-generated via slugify        |
| `duration`       | Number          | Days                              |
| `maxGroupSize`   | Number          |                                   |
| `difficulty`     | String          | `easy` \| `medium` \| `difficult` |
| `ratingsAverage` | Number          | 1–5, auto-rounded to 1 decimal    |
| `price`          | Number          |                                   |
| `startLocation`  | GeoJSON Point   | Tour starting point               |
| `locations`      | [GeoJSON Point] | Each stop with a `day` field      |
| `guides`         | [ObjectId]      | References to User documents      |
| `reviews`        | Virtual         | Populated from Review model       |

### User

| Field      | Type    | Notes                                        |
| ---------- | ------- | -------------------------------------------- |
| `name`     | String  | Required                                     |
| `email`    | String  | Unique, validated                            |
| `photo`    | String  | Filename, default `default.jpg`              |
| `role`     | String  | `user` \| `guide` \| `lead-guide` \| `admin` |
| `password` | String  | Hashed, hidden from output                   |
| `active`   | Boolean | Soft-delete flag, hidden from output         |

### Review

| Field    | Type     | Notes             |
| -------- | -------- | ----------------- |
| `review` | String   | Required          |
| `rating` | Number   | 1–5               |
| `tour`   | ObjectId | Reference to Tour |
| `user`   | ObjectId | Reference to User |

A compound unique index on `{tour, user}` enforces one review per user per tour. A static `calcAverageRatings()` method recalculates `ratingsAverage` and `ratingsQuantity` on the parent tour automatically after every review change.

---

## Email Service

The `Email` class in `utils/email.js` renders **Pug templates** from `views/email/` and delivers them via Nodemailer:

| Template            | Trigger                |
| ------------------- | ---------------------- |
| `welcome.pug`       | New account signup     |
| `passwordReset.pug` | Password reset request |

- **Development:** messages are caught by [Mailtrap](https://mailtrap.io) and never delivered to real inboxes.
- **Production:** messages are sent via [Brevo](https://www.brevo.com) SMTP.

---

## Frontend

The browser-side code lives in `public/js/` and is bundled by **Parcel** into `bundle.js`.

| Module              | Responsibility                                             |
| ------------------- | ---------------------------------------------------------- |
| `index.js`          | Entry point — wires all DOM event listeners                |
| `login.js`          | Login / logout via axios API calls                         |
| `updateSettings.js` | Update profile data or password via axios                  |
| `maptiler.js`       | Renders an interactive map with markers for each tour stop |
| `alert.js`          | Injects a dismissing success/error banner into the DOM     |

Build the bundle before running in production:

```bash
npm run build:js
```

---

## Scripts

| Script               | Command                                 | Description                               |
| -------------------- | --------------------------------------- | ----------------------------------------- |
| `npm start`          | `nodemon server.js`                     | Start in development with auto-reload     |
| `npm run start:prod` | `NODE_ENV=production nodemon server.js` | Start in production mode                  |
| `npm run debug`      | `ndb server.js`                         | Start with Node.js debugger (ndb)         |
| `npm run watch:js`   | `parcel watch public/js/index.js`       | Watch & incrementally bundle frontend JS  |
| `npm run build:js`   | `parcel build public/js/index.js`       | Build & minify frontend JS for production |

---

## License

This project was built for learning purposes following Jonas Schmedtmann's Node.js course. It is not intended for commercial use.-API

### Go to [Documentation](https://documenter.getpostman.com/view/30951605/2sA2r53jwZ)
