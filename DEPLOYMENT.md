# 🚀 EduTuition Pro - Production Deployment Guide
# නිෂ්පාදන මට්ටමේ සජීවීව Deploy කිරීමේ උපදෙස් සංග්‍රහය

මෙම Tuition Management පද්ධතිය සජීවීව (Live Online) ඕනෑම කෙනෙකුට පරිහරණය කළ හැකි ලෙස Free (නොමිලේ) හෝ VPS Server එකක Host කරගැනීමට ක්‍රම 4ක් මෙහි විස්තර කර ඇත.

---

## ⚡ Method 1: Vercel (1-Click Deployment - වේගවත්ම සහ පහසුම ක්‍රමය / Recommended)

Vercel හරහා **React Frontend** සහ **Express Serverless API** දෙකම එකම Vercel Project එකකින් 1-Click මගින් නොමිලේ Deploy කළ හැක.

### පියවර 1: GitHub ගිණුමට Code එක Push කරන්න
1. **[GitHub.com](https://github.com)** වෙත ගොස් New Repository එකක් (`edutuition-pro`) සාදන්න.
2. ඔබගේ Terminal / PowerShell එකේ පහත විධාන ක්‍රියාත්මක කරන්න:
```bash
cd d:\tution_management
git remote add origin https://github.com/YOUR_USERNAME/edutuition-pro.git
git push -u origin main
```

### පියවර 2: Vercel වෙත Import කර Deploy කරන්න
1. **[https://vercel.com](https://vercel.com)** වෙත ගොස් ඔබගේ GitHub ගිණුමෙන් Login වන්න.
2. **"Add New..."** -> **"Project"** තෝරන්න.
3. ඔබේ `edutuition-pro` GitHub repository එක සොයා **"Import"** ඔබන්න.
4. **Environment Variables** කොටස විවෘත කර පහත දෑ ඇතුළත් කරන්න:
   - **Key**: `JWT_SECRET` | **Value**: `tuition_production_secret_key_2025` *(ඔබ කැමති රහස්‍ය අකුරු පෙළක්)*
   - *(විකල්පයි / Optional)*: ඔබ සතුව MongoDB Atlas URL එකක් ඇත්නම්:
     - **Key**: `MONGODB_URI` | **Value**: `mongodb+srv://...`
5. **"Deploy"** බොත්තම ඔබන්න! 🚀

> **සටහන (Note)**: `vercel.json` ගොනුව දැනටමත් සකස් කර ඇති බැවින්, Build Command හෝ Output Directory වෙනස් කිරීමට අවශ්‍ය නොවේ. Vercel විසින් ස්වයංක්‍රීයව Frontend එක Build කර API එක Serverless Function එකක් ලෙස Deploy කරනු ඇත!

---

## 🏆 Method 2: Render.com (Full-Stack Web Service)

### පියවර 1: ව්‍යාපෘතිය GitHub ගිණුමට Push කරන්න
ඔබගේ පරිගණකයේ Terminal / PowerShell එක open කර පහත විධාන ක්‍රියාත්මක කරන්න:

```bash
cd d:\tution_management
git init
git add .
git commit -m "Initial release of EduTuition Pro"
git branch -M main
```

දැන් GitHub.com හි **New Repository** එකක් හදාගෙන:
```bash
git remote add origin https://github.com/YOUR_USERNAME/edutuition-pro.git
git push -u origin main
```

---

### පියවර 2: Render.com හි Web Service එකක් සාදන්න
1. [https://render.com](https://render.com) වෙත ගොස් නොමිලේ Account එකක් සාදන්න (Sign Up with GitHub).
2. **"New +"** බොත්තම ඔබා **"Web Service"** තෝරන්න.
3. ඔබේ GitHub repository එක (`edutuition-pro`) තෝරන්න.
4. පහත විස්තර ඇතුළත් කරන්න:
   - **Name**: `edutuition-pro` (හෝ ඔබ කැමති නමක්)
   - **Region**: `Singapore` (ශ්‍රී ලංකාවට ආසන්නතම සහ වේගවත්ම)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

---

### පියවර 3: Environment Variables (පරිසර විචල්‍යයන්) එකතු කරන්න
**Environment Variables** කොටසට ගොස් පහත දෑ ඇතුළත් කරන්න:
- `NODE_ENV`: `production`
- `JWT_SECRET`: `tuition_jwt_secure_key_2025_prod` (ඕනෑම රහස්‍ය අකුරු සංකලනයක්)
- `MONGODB_URI`: *(විකල්පයි / Optional)* ඔබට MongoDB Atlas cloud database එකක් ඇත්නම් එහි Connection URI එක ලබාදෙන්න. ලබා නොදුන්නද පද්ධතිය ස්වයංක්‍රීයව Built-in Persistent Datastore මගින් කිසිදු දෝෂයකින් තොරව ක්‍රියාත්මක වේ!

5. **"Deploy Web Service"** ඔබන්න. 
මිනිත්තු 2-3ක් ඇතුළත ඔබේ Tuition App එක `https://edutuition-pro.onrender.com` වැනි නොමිලේ ලැබෙන SSL (HTTPS) සහිත සජීවී වෙබ් ලිපිනයකින් ක්‍රියාත්මක වනු ඇත! 🎉

---

## ⚡ Method 2: Railway.app හරහා Deploy කිරීම

1. [https://railway.app](https://railway.app) වෙත ගොස් GitHub හරහා Login වන්න.
2. **"New Project"** -> **"Deploy from GitHub repo"** තෝරන්න.
3. අපගේ repository එක තෝරන්න.
4. Railway විසින් ස්වයංක්‍රීයව `Dockerfile` එක හෝ `package.json` හඳුනාගෙන Build කරනු ඇත.
5. **Variables** ටැබ් එකට ගොස් `PORT=5000` සහ `JWT_SECRET=your_secret_key` එකතු කරන්න.
6. **Settings** -> **Generate Domain** ලබාදී Live URL එක ලබාගන්න.

---

## 🌐 Method 3: Split Deployment (Vercel Frontend + Render Backend)

ඔබට Frontend එක Vercel හි සහ Backend එක Render හි වෙන වෙනම run කිරීමට අවශ්‍ය නම්:

### Backend (Render / Railway):
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`

### Frontend (Vercel):
1. [https://vercel.com](https://vercel.com) හි New Project තෝරන්න.
2. Root directory එක ලෙස `frontend` තෝරන්න.
3. **Environment Variables** හි:
   - `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com/api`
4. Deploy ඔබන්න.

---

## 🐳 Method 4: Docker / VPS Server (DigitalOcean, Hetzner, AWS, Linode)

ඔබට තමන්ගේම Linux VPS server එකක (Ubuntu/Debian) Docker හරහා Run කිරීමට අවශ්‍ය නම්:

```bash
# 1. Repository එක clone කරන්න
git clone https://github.com/YOUR_USERNAME/edutuition-pro.git
cd edutuition-pro

# 2. Docker container එක MongoDB සමග background එකේ run කරන්න
docker compose up -d --build
```
පද්ධතිය Port `5000` හරහා ක්‍රියාත්මක වන අතර Nginx Reverse Proxy සහ Let's Encrypt SSL මගින් ඔබගේ Custom Domain එකට පහසුවෙන්ම සම්බන්ධ කළ හැක.

---

## 🔑 සජීවී පද්ධතියේ පෙරනිමි ගිණුම් (Default Login Credentials)

පද්ධතිය ප්‍රථම වරට Boot වන විට නියැදි දත්ත ස්වයංක්‍රීයව seed වේ:

| භූමිකාව (Role) | Email | මුරපදය (Password) |
|---|---|---|
| **ගුරුවරයා / Admin** | `teacher@tuition.lk` | `password123` |
| **ශිෂ්‍ය 1 (Kamal)** | `student1@tuition.lk` | `password123` |
| **ශිෂ්‍ය 2 (Nimali)** | `student2@tuition.lk` | `password123` |
| **දෙමාපියන් (Parent)** | `parent1@tuition.lk` | `password123` |

---

## 💡 ප්‍රයෝජනවත් උපදෙස් (Pro Tips)
- Render Free tier එකේදී සේවාදායකය විනාඩි 15ක් භාවිත නොවූ විට sleep මාදිලියට යයි. නැවත open කරන විට තත්පර 30ක් පමණ ගතවිය හැක. UptimeRobot ([https://uptimerobot.com](https://uptimerobot.com)) වැනි නොමිලේ සේවාවකින් සෑම විනාඩි 10කට වරක් `/api/health` එක ping කිරීමට දැමීමෙන් server එක සැමවිටම 100% active තබාගත හැක!
