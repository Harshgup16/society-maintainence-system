# Society Maintenance Tracker — System Design Write-Up

## 1. Complaint History & Lifecycle Model
The complaint lifecycle enforces a strict, append-only state transition model:
- **States**: `OPEN` → `IN_PROGRESS` → `RESOLVED` (Terminal).
- **Append-Only Audit Log (`complaint_history`)**: Every status change or priority adjustment creates an immutable historical entry containing `complaint_id`, `changed_by`, `old_status`, `new_status`, `old_priority`, `new_priority`, `note`, and `created_at`.
- **Database Trigger**: A PostgreSQL `BEFORE UPDATE` trigger (`handle_complaint_status_change`) automatically validates state transitions, sets `resolved_at = NOW()` upon resolution, and prevents reopening closed complaints.

```
[OPEN] ──> [IN PROGRESS] ──> [RESOLVED (Terminal)]
   │                               │
   └────── (Direct Close) ─────────┘
```

---

## 2. Overdue Detection Mechanism
Overdue detection operates dynamically using a configurable SLA threshold stored in `app_settings` (`overdue_threshold_days`, default: 7 days):
- **SLA Threshold Calculation**: An automated database RPC function (`check_overdue_complaints()`) identifies any complaint in `open` or `in_progress` status created prior to `NOW() - threshold_days * INTERVAL '1 day'`.
- **Automatic Execution**: Invoked on every admin dashboard load to flag stale complaints by setting `is_overdue = true`.
- **Priority Sorting**: Overdue complaints automatically float to the top of admin filter views with high-visibility red badge indicators and left border highlights.

---

## 3. Photo Evidence & Storage Handling
Photo upload supports both file attachment (drag & drop) and live webcam snapshot capture:
- **Validation**: Enforces max 3 photos per complaint, max 5MB size limit per image, and restricted MIME types (`image/jpeg`, `image/png`, `image/webp`).
- **Private Storage Bucket**: Photos are stored securely in a private Supabase Storage bucket (`complaint-photos`) using path pattern `{complaint_id}/{timestamp}-{random}.jpg`.
- **Time-Bound Signed URLs**: Images are served exclusively via temporary time-bound signed URLs (3600s expiration) generated server-side. This ensures raw storage paths and bucket permissions are never exposed publicly.

---

## 4. Notification Engine & Resend Integration
Transactional emails are dispatched asynchronously via the Resend API engine:
- **Status Change Updates**: Triggered when an administrator alters a complaint status or priority. Assembles a responsive HTML template containing complaint category, status transition delta, admin notes, and direct portal deep-links sent to the resident's registered address.
- **Important Notice Broadcasts**: Publishing a society notice flagged as `Important` dispatches a society-wide broadcast email to all registered resident accounts.
- **Resend Free Tier Testing Support**: Built-in fallback handling automatically routes test emails to the verified project owner address (`hkgupta160420@gmail.com`) when target recipient domains are unverified on free tier API keys.

---

## 5. Security & Role-Based Access Control (RBAC)
- **Database RLS Policies**: Enforces strict data isolation (`auth.uid() = resident_id` for residents, full CRUD for admins).
- **JWT Claim Injection**: A custom Supabase access token hook (`custom_access_token_hook`) embeds `user_role` directly into session JWTs for sub-millisecond edge middleware routing.
