# ProCraft — Production Deployment Guide

ProCraft Hardware & Paint Studio is configured as a **unified, self-contained full-stack application**. In production mode, the Express server serves both the **REST/Socket.IO API** and the **built React static frontend** on port `5000` (or `$PORT`).

---

## 1. Deploying Locally in Production Mode (1 Command)

To test or run the production build locally on your machine:

```bash
# In the project root (e:\abc\):
npm run deploy:local
```

What this does:
1. Builds the React 18 frontend (`client/dist`).
2. Compiles the TypeScript Express backend (`server/dist`).
3. Starts the production server on `http://localhost:5000` (serving both the UI and API).

---

## 2. Deploying with Docker (VPS / AWS / Google Cloud / Azure)

A multi-stage `Dockerfile` and `docker-compose.prod.yml` are included in the root directory. To launch the entire production application along with a persistent MongoDB database in one click:

```bash
# Using modern Docker Compose V2 (recommended):
docker compose -f docker-compose.prod.yml up --build -d

# Or with legacy Docker Compose V1:
docker-compose -f docker-compose.prod.yml up --build -d
```

- **Production App & Storefront**: Available at `http://localhost:5000`
- **Database**: Automatically provisions a persistent MongoDB container volume (`mongo-prod-data`).

---

## 3. Deploying to Cloud Platforms (Render / Railway / Fly.io)

### 1-Click Free Deploy on Render (Recommended):
We have included a `render.yaml` Blueprint file in the root directory.
1. Push your repository to **GitHub**.
2. Go to **[render.com](https://render.com)** and sign in with GitHub (100% Free).
3. Click **New +** -> **Blueprint** -> Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `procraft-studio`
   - **Plan**: `Free ($0/month)`
   - **Build & Start Commands**: Automatically set (`npm install && npm run build` -> `npm start`)
   - **Security**: Automatically generates a secure `JWT_SECRET` key.
5. Click **Apply** — your app is now permanently live on `https://procraft-studio.onrender.com`!

### Manual Setup (Without Blueprint):
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment Variables**:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secure_random_string`
   - `MONGODB_URI=mongodb+srv://...` *(or leave blank to use the built-in automatic database fallback)*
