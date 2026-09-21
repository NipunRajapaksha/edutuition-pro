# EduTuition Pro (ශිල්ප ඇකඩමි)
### Modern Mobile-First Tuition Class Management SaaS Application

EduTuition Pro is an all-in-one Tuition Class Management mobile application designed for private tuition teachers and small-to-medium tuition institutes. It features role-based portals for **Teacher/Admin**, **Student**, and **Parent**, bilingual support (**English & Sinhala / සිංහල**), dynamic **QR attendance**, **digital payment receipts**, **AI academic assistant**, auto-computed **exam rankings & report cards**, and comprehensive analytics.

---

## 🌟 Key Features

### 1. Multi-Role Portals & RBAC
- **Teacher / Admin**: Manage the entire institute, enrolled students, classes, attendance, fee collections, homework assignments, exams, study materials, announcements, and AI diagnostics.
- **Student**: View personalized daily timetable, attendance gauge, pending homework with submission portal, exam marks & class ranks, fee dues, and digital student QR ID card.
- **Parent**: Dedicated child monitoring portal with attendance percentage (<75% low attendance warning banners), fee payment history & overdue alerts, report cards, and teacher notes.

### 2. Fast Attendance & QR Scanner
- Select: Class → Date → Students.
- 1-Click **"Mark All Present"** for ultra-fast session management.
- Dynamic **Class QR Code Generator**: Teachers display or project a live session QR code; students scan using their mobile camera to automatically mark attendance.
- Duplicate prevention: Enforces unique `(classId, studentId, date)` constraints.

### 3. Tuition Fee Management & Digital Receipts
- Record payments across payment methods: **Cash**, **Bank Transfer**, **Online Payment**, **Other**.
- Auto-calculated balance and statuses: `Paid`, `Partially Paid`, `Pending`, `Overdue`.
- **Digital Payment Receipts**: Instant printable receipt modal with cryptographic verification hash and scannable QR verification code.

### 4. Homework & Assignment Tracking
- Teachers assign tasks with deadline dates, instructions, and target marks.
- Students submit solutions with explanations and attached files.
- Teachers review submissions, award marks, and provide personalized feedback.

### 5. Examination & Auto-Grading Engine
- Schedule Monthly Tests, Term Tests, Model Papers, Class Tests, and Final Exams.
- Bulk marks entry with real-time automatic calculation of:
  - Percentage
  - Standard Sri Lankan grades (`A`, `B`, `C`, `S`, `F`)
  - Class Ranking (`#1`, `#2`, `#3`...)
  - Class Average, Highest Mark, and Lowest Mark.

### 6. AI-Powered Educational Tools
1. **AI Student Performance Insights**: Automatically evaluates student attendance, homework completion, and test trajectory to generate tailored diagnostic summaries.
2. **AI Homework Generator**: Enter Grade, Subject, Topic, and Difficulty to synthesize structured questions and marking guides.
3. **AI Quiz Generator**: Generates multiple-choice quizzes with answer keys and conceptual explanations.
4. **AI Exam Paper Generator**: Synthesizes formal examination question papers with Part A (Short Answer) and Part B (Structured Essay) problems.
5. **AI Student Risk Detector**: Scans all students and flags academic risks (attendance < 75% or failing test scores) with actionable intervention strategies.

### 7. Bilingual Engine (English + සිංහල)
- Instant dynamic toggle between English and Sinhala (සිංහල) across all dashboards, forms, buttons, and receipts.
- Implemented with clean Unicode typography using **Noto Sans Sinhala** and **Inter**.

### 8. Exportable Reports
- Comprehensive **Student**, **Class**, and **Financial** reports available in both printable view and downloadable **CSV** format.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Execution

#### 1. Backend Server
```bash
cd backend
npm install
node server.js
```
The server starts on `http://localhost:5000`. If no local MongoDB is detected, it automatically operates in zero-configuration persistent storage mode, seeded with realistic tuition data!

#### 2. Mobile Frontend (React Native + Web Preview)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **`http://localhost:3000`**. You can toggle between **Mobile Frame** and **Full Screen** views.

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher / Admin** | `teacher@tuition.lk` | `password123` | Master N. Perera (All classes & institutes) |
| **Student 1** | `student1@tuition.lk` | `password123` | Kasun Bandara (Grade 10 Maths & Science) |
| **Student 2** | `student2@tuition.lk` | `password123` | Dilani Senanayake (Grade 10 Maths) |
| **Parent** | `parent1@tuition.lk` | `password123` | Sunil Bandara (Parent of Kasun Bandara) |

*Tip: The login screen includes **1-Tap Quick Demo Role Buttons** for instantaneous switching between roles!*

---

## 📂 Project Structure

```
d:/tution_management/
├── backend/
│   ├── config/db.js                  # Database connection with resilient fallback
│   ├── middleware/auth.js            # JWT verification & RBAC
│   ├── middleware/errorHandler.js    # Error handling
│   ├── models/                       # Mongoose schemas (User, Student, Class, etc.)
│   ├── controllers/                  # 13 REST controllers (Auth, Student, Fees, AI, etc.)
│   ├── routes/                       # REST API endpoints
│   ├── services/storage.js           # Persistent data layer
│   ├── seed/seedData.js              # Realistic Sri Lankan tuition academy seed data
│   └── server.js                     # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── api/client.js             # Axios API client with token interceptor
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Auth state & quick demo logins
    │   │   ├── ThemeContext.jsx      # Dark & Light theme palette
    │   │   └── LanguageContext.jsx   # English & Sinhala i18n
    │   ├── components/
    │   │   ├── Header.jsx            # Top bar with role badge & toggles
    │   │   ├── BottomNav.jsx         # Role-specific bottom navigation tabs
    │   │   ├── StatCard.jsx          # Metric cards
    │   │   ├── QuickActionBtn.jsx    # 1-tap quick action buttons
    │   │   ├── DigitalReceiptModal.jsx # Verified receipt with QR barcode
    │   │   ├── StudentIdCardModal.jsx# Digital Student ID with QR code
    │   │   ├── QrAttendanceModal.jsx # Dynamic class QR code & scanner
    │   │   └── ChartViewer.jsx       # Responsive SVG progress & trend charts
    │   ├── screens/
    │   │   ├── auth/LoginScreen.jsx
    │   │   ├── teacher/              # Dashboard, Students, Attendance, Fees, AI, Reports, etc.
    │   │   ├── student/              # Dashboard, My Classes, Homework, Results, Fees, etc.
    │   │   ├── parent/               # Dashboard, Child Attendance, Fees, Progress
    │   │   └── shared/               # Announcements, Notifications, Calendar, More Menu
    │   └── utils/translations.js     # English & Sinhala translation dictionary
    └── App.jsx                       # Root application component
```
