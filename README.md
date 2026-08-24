# Society Maintenance Tracker

A high-performance, editorial-style **Society Maintenance Tracker** built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Supabase (PostgreSQL, Auth, Storage)**, and **Resend**.

Designed with inspiration from **Akaru.fr** (warm cream palette, editorial typography, full-width row hover slide animations, pill-shaped badges, and high-contrast minimal elements).

---

## Features

### 🏢 Resident Features
- **Authentication**: Sign up with full name, apartment number, and phone number.
- **Raise Complaints**: Select category, enter detailed description, and upload up to 3 supporting photos (drag-and-drop with previews).
- **Complaint Dashboard**: View complaints in Akaru-style interactive rows with status badges and categories.
- **Filter & Sort**: Sort complaints by newest/oldest and filter by category, status, or priority.
- **Detailed History & Timeline**: Track complete append-only audit trail for every complaint along with signed photo attachments.
- **Notice Board**: View society announcements and important admin updates.

### 🛡️ Admin Features
- **Admin Dashboard**: Real-time KPI metrics (Total, Open, In Progress, Resolved, Overdue) and interactive **Recharts** charts (Status breakdown & Category distribution).
- **Complaint Management**: View all resident complaints with multi-parameter filtering.
- **Status & Priority Controls**: Enforced status transition workflow (prevents reopening resolved complaints) with optional audit notes.
- **SLA & Overdue Detection**: Configurable threshold (default 7 days) that automatically flags overdue complaints.
- **Notice Management**: Publish notices and trigger automated email broadcasts to residents for important updates.
- **Email Notifications**: Integrated with **Resend** for automated notification on status/priority changes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components & Route Handlers) |
| **Styling** | Tailwind CSS v4 + Custom Akaru Design System (`#f0ece4` cream theme) |
| **Database** | Supabase PostgreSQL (7 normalized tables, custom ENUMs, triggers) |
| **Authentication** | Supabase Auth (SSR Cookie Sessions + Custom JWT Claims) |
| **Authorization** | Row Level Security (RLS) policies for DB & Storage isolation |
| **Storage** | Supabase Storage (`complaint-photos` private bucket with Signed URLs) |
| **Email Engine** | Resend API |
| **Analytics** | Recharts (Responsive Bar & Pie Charts) |

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account (or local Supabase instance)
- Resend API key for email notifications

### 2. Installation
```bash
# Clone repository & navigate to directory
git clone https://github.com/your-username/society-maintenance-tracker.git
cd society-maintenance-tracker

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
1. Open your Supabase SQL Editor.
2. Run the script provided in `supabase/schema.sql`. This creates:
   - Tables: `profiles`, `user_roles`, `complaints`, `complaint_history`, `complaint_photos`, `notices`, `app_settings`
   - ENUMs: `app_role`, `complaint_category`, `complaint_status`, `complaint_priority`
   - Triggers for user signup, timestamps, resolution timestamps, and overdue checks
   - RLS security policies and private `complaint-photos` storage bucket

### 5. Create an Admin User
To promote a user to admin:
```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = 'USER_UUID_HERE';
```

### 6. Run Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
unthinkable/
├── app/
│   ├── admin/             # Admin layout, dashboard, complaints, notices, settings
│   ├── resident/          # Resident layout, dashboard, new complaint, notices
│   ├── api/               # Route Handlers for complaints, admin workflows, notices, settings
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── globals.css        # Akaru design system styles & CSS variables
│   └── layout.js          # Root layout
├── components/
│   ├── complaints/        # ComplaintCard, ComplaintForm, ComplaintFilters, StatusTimeline, PhotoGallery
│   ├── dashboard/         # StatCard, StatusChart, CategoryChart
│   ├── notices/           # NoticeCard, NoticeForm
│   └── layout/            # Header, Sidebar, Loading
├── lib/
│   ├── constants.js       # Categories, Statuses, Priorities, Transition matrix
│   ├── utils.js           # Date formatters, helper functions
│   ├── validations.js     # Zod validation schemas
│   ├── email.js           # Resend email notification helper
│   └── supabase/          # Supabase browser, server, and admin clients
├── supabase/
│   └── schema.sql         # Complete PostgreSQL DDL, triggers, and RLS policies
├── SYSTEM_DESIGN.md       # Comprehensive system design documentation
└── README.md
```

---

## Documentation
- Detailed architectural breakdown, ERD diagrams, and security specifications can be found in [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).
