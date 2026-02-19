# 🧒 KidCare — Kid Caretaker Recommendation App

A full-stack MVP for safe, age-appropriate video recommendations for kids (ages 6–15).

| Layer    | Tech                          |
| -------- | ----------------------------- |
| Server   | FastAPI + SQLAlchemy (async)  |
| Client   | React 18 + TypeScript + Vite  |
| Database | SQLite (aiosqlite) — zero config |
| Auth     | JWT (python-jose + bcrypt)    |
| Styling  | Tailwind CSS                  |

---

## 🚀 Quick Start (Docker Compose)

> **Prerequisite:** Docker & Docker Compose installed.

```bash
# 1. Clone / enter the project
cd recommendor_app

# 2. Build & start all services
docker compose up --build

# 3. Open in browser
#    Client : http://localhost:5173
#    Server : http://localhost:8000/docs  (Swagger UI)
```

The server **automatically** creates database tables and seeds 15 sample videos on first start.

---

## 📁 Project Structure

```
recommendor_app/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py            # FastAPI app + all routes
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT + password hashing utilities
│   ├── recommender.py      # Tag-based recommendation engine
│   ├── database.py         # Async engine + session setup
│   └── seed.py             # Seeds 15 sample videos
└── client/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx          # React Router setup
        ├── types.ts         # Shared TypeScript types
        ├── api/
        │   └── client.ts    # Axios API client
        └── pages/
            ├── AuthPage.tsx            # Login / Register
            ├── DashboardPage.tsx       # Parent dashboard
            ├── AddChildPage.tsx        # Create child profile
            ├── ProfileSelector.tsx     # Child profile picker
            ├── MoodSelector.tsx        # Mood input screen
            ├── RecommendationFeed.tsx  # Video recommendations
            └── VideoPlayer.tsx         # Embedded video player
```

---

## 🔗 API Endpoints

### Auth
| Method | Path              | Description           |
| ------ | ----------------- | --------------------- |
| POST   | `/auth/register`  | Register parent       |
| POST   | `/auth/login`     | Login parent          |

### Children
| Method | Path               | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/children/`       | Create child profile       |
| GET    | `/children/`       | List parent's children     |
| GET    | `/children/{id}`   | Get single child profile   |

### Videos
| Method | Path                                  | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| GET    | `/videos/recommend/{child_id}?mood=`  | Get mood-based recommendations       |
| POST   | `/videos/{video_id}/like?child_id=`   | Like / save a video                  |
| POST   | `/videos/{video_id}/watch?child_id=`  | Record watch history                 |

### Dashboard
| Method | Path                | Description            |
| ------ | ------------------- | ---------------------- |
| GET    | `/parent/dashboard` | Aggregated child stats |

---

## 🧠 Recommendation Algorithm

1. **Match interests** — map child interests to video categories
2. **Match mood** — filter by selected mood type
3. **Filter by age** — `min_age ≤ child.age ≤ max_age`
4. **Score** — `safety_score + education_score`
5. **Diversity** — penalize repeat categories
6. **Recency** — deprioritize recently watched videos

---

## 🛠 Running Without Docker

### Server
```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# No database setup needed — SQLite file is created automatically
python seed.py               # Seed sample videos
uvicorn main:app --reload    # http://localhost:8000
```

### Client
```bash
cd client
npm install
npm run dev                  # http://localhost:5173
```

> When running without Docker, update the Vite proxy target in `vite.config.ts` from `http://server:8000` to `http://localhost:8000`.

---

## 📝 Environment Variables

| Variable                     | Default                                    | Description                |
| ---------------------------- | ------------------------------------------ | -------------------------- |
| `DATABASE_URL`               | `sqlite+aiosqlite:///kidcare.db`           | SQLite connection string   |
| `SECRET_KEY`                 | `super-secret-dev-key-change-in-prod`      | JWT signing secret         |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `60`                                       | Token TTL in minutes       |

---

## License

MIT — built for learning purposes.
