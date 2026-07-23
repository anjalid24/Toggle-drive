# Toggle Drive

A personal cloud storage platform — a mini Google Drive built on the **MERN**
stack (MongoDB, Express, React, Node).

## Features

- User signup / login (JWT auth, bcrypt-hashed passwords)
- Upload, download, and delete files
- Create folders and browse them with breadcrumbs
- Share files via public links (with optional expiry)
- Search files across the whole drive
- Storage-usage dashboard (quota, file/folder counts, breakdown by type)

## Architecture

The project follows a clean, layered architecture so responsibilities stay
separated and the code is easy to test and extend.

```
Toggle-drive/
├── server/                 # Express + MongoDB REST API
│   └── src/
│       ├── config/         # env config + DB connection (single source of truth)
│       ├── models/         # Mongoose schemas (User, Folder, File)
│       ├── repositories/   # data-access layer (isolates Mongoose)
│       ├── services/       # business logic
│       │   └── storage/    # swappable storage providers (local disk today)
│       ├── controllers/    # thin HTTP handlers
│       ├── routes/         # route definitions + validation wiring
│       ├── middleware/     # auth, validation, upload, async + error handling
│       ├── validators/     # express-validator rule sets
│       ├── utils/          # ApiError, logger, token helpers
│       ├── app.js          # Express app assembly (no listener — testable)
│       └── index.js        # bootstrap: connect DB, start server, graceful stop
└── client/                 # React (Vite) single-page app
    └── src/
        ├── api/            # typed fetch client
        ├── context/        # auth context/provider
        ├── components/     # Layout, Modal
        ├── pages/          # Login, Signup, Drive, Dashboard, SharedFile
        └── utils/          # formatting helpers
```

### Request flow

```
route → validate → controller → service → repository → model
                                    │
                                    └── storageService → StorageProvider (local/…)
```

- **Controllers** only translate HTTP ↔ service calls; they contain no logic.
- **Services** hold all business rules (quota checks, sharing, cascades).
- **Repositories** are the only place that talks to Mongoose.
- **Storage** is behind a `StorageProvider` interface. Files are written to
  local disk today; an S3 (or other) provider can be added later by
  implementing the same interface and registering it in `storageService.js` —
  no controller or service changes required.

### Storage & downloads

Uploads are held in memory by Multer and handed to the active storage provider.
Downloads use a short-lived, signed download token to authorise a direct file
stream (`GET /api/files/:id/raw?token=…`). This mirrors the S3 presigned-URL
pattern, so switching to S3 later means returning a presigned URL from
`storageService.buildDownloadUrl` instead of the local stream URL — nothing
else changes.

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod` or a connection string)

### 1. Backend

```bash
cd server
cp .env.example .env        # then edit values (at minimum JWT_SECRET, MONGO_URI)
npm install
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000 (proxies /api to :5000)
```

Open http://localhost:3000, create an account, and start uploading.

### Tests

```bash
cd server && npm test
```

## API overview

| Method | Endpoint                     | Auth   | Description                       |
| ------ | ---------------------------- | ------ | -------------------------------- |
| POST   | `/api/auth/signup`           | –      | Create an account                |
| POST   | `/api/auth/login`            | –      | Log in                           |
| GET    | `/api/auth/me`               | ✓      | Current user                     |
| GET    | `/api/files`                 | ✓      | List files (`?folder=` `?search=`)|
| POST   | `/api/files`                 | ✓      | Upload a file (multipart)        |
| GET    | `/api/files/:id/download`    | ✓      | Get a short-lived download URL   |
| GET    | `/api/files/:id/raw?token=`  | token  | Stream the file bytes            |
| DELETE | `/api/files/:id`             | ✓      | Delete a file                    |
| POST   | `/api/files/:id/share`       | ✓      | Create/refresh a share link      |
| DELETE | `/api/files/:id/share`       | ✓      | Revoke a share link              |
| GET    | `/api/files/storage`         | ✓      | Storage-usage stats              |
| GET    | `/api/folders`               | ✓      | List folders (`?parent=`)        |
| POST   | `/api/folders`               | ✓      | Create a folder                  |
| DELETE | `/api/folders/:id`           | ✓      | Delete a folder (cascades)       |
| GET    | `/api/share/:token`          | –      | Resolve a public share link      |

## Roadmap

- S3 storage provider + CloudFront-hosted client
- Containerisation and AWS deployment (ECS, load balancer, auto scaling)

These are intentionally deferred; the storage abstraction is already in place so
adding the S3 provider is a self-contained change.
