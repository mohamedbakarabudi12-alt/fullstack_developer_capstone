# Best Cars Dealership Review Platform

Best Cars is a full stack dealership directory and customer review application. Visitors can browse dealerships and read reviews. Registered users can sign in and submit a review with purchase and vehicle details.

## Repository name

**fullstack_developer_capstone**

## Project name

**Best Cars Dealership Review Platform**

## Features

- React pages for dealership browsing, dealer details, account registration, sign-in, and review submission
- Django endpoints for authentication, dealerships, reviews, vehicle makes and models, and sentiment analysis
- MongoDB-backed dealership, inventory, and review data served by the Node.js API
- Optional Flask and NLTK service for review sentiment analysis

## Technology

React, Django, Node.js, Express, MongoDB, Flask, and NLTK.

## Run locally

Start MongoDB and the Node API from `server/database`:

```powershell
docker compose up --build
```

In a second terminal, install the Python dependencies and start Django from `server`:

```powershell
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The Django application is available at `http://127.0.0.1:8000/`. To run the React development server instead, open `server/frontend`, run `npm install`, then `npm start`. The React development server proxies `/djangoapp` requests to Django.

Build the React app for Django's production template/static paths with:

```powershell
cd server/frontend
npm install
npm run build
```

## Main Django API routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/djangoapp/register` | Register a user |
| POST | `/djangoapp/login` | Sign in |
| POST | `/djangoapp/logout` | Sign out |
| GET | `/djangoapp/get_dealers` | List dealerships |
| GET | `/djangoapp/get_dealers/<state>` | Filter dealerships by state |
| GET | `/djangoapp/dealer/<id>` | Get a dealership |
| GET | `/djangoapp/reviews/dealer/<id>` | Get dealer reviews |
| GET | `/djangoapp/get_cars` | List available car makes and models |
| GET | `/djangoapp/analyze_review/<text>` | Return a review sentiment |
| POST | `/djangoapp/add_review` | Submit a review |

## Project layout

- `server/djangoapp` — Django views, API routes, and service helpers
- `server/database` — MongoDB seed data and Node.js API
- `server/frontend` — React app and static About/Contact pages
- `.github/workflows` — GitHub Actions lint workflow
