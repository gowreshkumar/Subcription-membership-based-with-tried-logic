# 🔐 Member Vaults

> A futuristic, dark-themed **neon-glassmorphism** subscription membership platform built with HTML, CSS, ES6 JavaScript, PHP 8, and MySQL — powered by XAMPP.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Membership Tiers](#membership-tiers)
7. [Prerequisites](#prerequisites)
8. [Installation & Setup](#installation--setup)
9. [Running on Localhost](#running-on-localhost)
10. [Default Credentials](#default-credentials)
11. [Page Reference](#page-reference)
12. [API Endpoints](#api-endpoints)
13. [Access Control Logic](#access-control-logic)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Member Vaults** is a full-stack subscription membership web application. Users can register, choose one of four membership plans (Free, Silver, Gold, Premium), and access tier-gated content from their personal dashboard. Admins can monitor platform statistics and manage user subscriptions from a dedicated control center.

The entire UI is built around a **dark neon-glassmorphism aesthetic** — frosted glass cards, animated gradient text, glowing neon accents, floating orbs, and subtle micro-animations — giving it a premium, futuristic look and feel.

---

## Features

### User-Facing
- 🚀 **Registration** with plan selection (Free, Silver, Gold, Premium)
- 🔐 **Secure login** with bcrypt password hashing
- 📊 **Personal dashboard** — active plan badge, expiry countdown timer (live seconds)
- 🔓 **Tier-based content unlock** — each plan reveals more sections
- ⬆️ **Plan upgrade / switch** at any time from the Plans page
- 🔔 **Toast notifications** for all actions
- 📱 **Responsive** — works on desktop, tablet, and mobile

### Admin-Facing
- 📈 **Stats dashboard** — total users, active subscriptions, monthly recurring revenue
- 📊 **Plan distribution** bar chart (live %)
- 👥 **User management table** — view all users with current plan
- ✏️ **Inline plan editor** — change any user's plan with a dropdown + save
- 🔍 **Live search** across username and email

### System
- ⏱️ **Auto-expiry** — subscriptions past their `expiry_date` are automatically marked expired on every API call
- 📜 **Audit log** — every login, registration, and plan change is recorded
- 🛡️ **Role-based access control** — users can't reach admin pages; non-logged-in users are redirected to login

---

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | HTML5, CSS3 (Vanilla), ES6 JS  |
| Backend     | PHP 8.2                        |
| Database    | MySQL 8 (via XAMPP)            |
| Server      | Apache (via XAMPP)             |
| Fonts       | Google Fonts (Outfit, Space Grotesk) |
| Dev Environment | XAMPP on Windows          |

---

## Project Structure

```
subscriptionmembership/
│
├── index.html               ← Landing page
├── login.html               ← Login page
├── register.html            ← Registration page
├── dashboard.html           ← User dashboard
├── plans.html               ← Plan comparison & subscription
├── admin.html               ← Admin control panel
├── README.md                ← This file
│
├── css/
│   ├── style.css            ← Design tokens, layout, utilities
│   └── components.css       ← Navbar, cards, tables, forms, animations
│
├── js/
│   ├── main.js              ← API helper, toasts, auth guards, nav
│   ├── auth.js              ← Login & register form logic
│   ├── dashboard.js         ← Subscription render, tier content, countdown
│   ├── plans.js             ← Plan card rendering, subscribe/upgrade
│   └── admin.js             ← Stats, user table, plan update, search
│
├── php/
│   ├── auth/
│   │   ├── register.php     ← POST: create user + subscription
│   │   ├── login.php        ← POST: authenticate + set session
│   │   ├── logout.php       ← GET: destroy session
│   │   └── check_session.php← GET: return current session user
│   │
│   ├── plans/
│   │   └── get_plans.php    ← GET: all plans (public)
│   │
│   ├── subscription/
│   │   ├── subscribe.php    ← POST: create/switch subscription
│   │   └── my_subscription.php ← GET: current user's active sub
│   │
│   └── admin/
│       ├── users.php        ← GET: all users with plan info (admin)
│       ├── update_plan.php  ← POST: change a user's plan (admin)
│       └── dashboard_stats.php ← GET: platform stats (admin)
│
├── config/
│   ├── db.php               ← PDO singleton database connection
│   └── session.php          ← Session helpers & auth guard functions
│
└── db/
    └── membervaults.sql     ← Full schema + seed data
```

---

## Database Schema

### `plans`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR | Free / Silver / Gold / Premium |
| tier | TINYINT | 1 to 4 |
| price | DECIMAL | Monthly price in USD |
| duration_days | INT | 0 = lifetime (Free), 30 = monthly |
| badge_color | VARCHAR | Hex color for UI badges |
| features | JSON | Array of feature strings |

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR | Unique username |
| email | VARCHAR | Unique email |
| password_hash | VARCHAR | bcrypt hashed password |
| role | ENUM | `user` or `admin` |
| created_at | TIMESTAMP | Registration date |

### `subscriptions`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | FK → users |
| plan_id | INT | FK → plans |
| start_date | DATE | Subscription start |
| expiry_date | DATE | NULL for Free (lifetime), date for paid |
| status | ENUM | `active`, `expired`, `cancelled` |

### `audit_log`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | FK → users (nullable) |
| action | VARCHAR | e.g. `login`, `register`, `subscribe` |
| detail | TEXT | Extra context |
| ip_address | VARCHAR | Client IP |
| created_at | TIMESTAMP | Log timestamp |

---

## Membership Tiers

| Plan    | Tier | Price     | Content Unlocked |
|---------|------|-----------|-----------------|
| 🆓 Free    | 1    | $0 / forever | Public articles, basic profile, community access |
| 🥈 Silver  | 2    | $9.99 / mo  | + Community forum, monthly newsletter, downloads |
| 🥇 Gold    | 3    | $19.99 / mo | + 200+ premium tutorials, priority support, analytics |
| 💎 Premium | 4    | $39.99 / mo | + Vault content, 1-on-1 sessions, API key, lifetime updates |

> Users can upgrade or switch plans any time. The old subscription is cancelled instantly and a new one starts with a fresh expiry date.

---

## Prerequisites

Before running this project you need:

1. **XAMPP** installed — [Download XAMPP](https://www.apachefriends.org/download.html)
   - Includes Apache, MySQL, and PHP 8.2 out of the box
2. A modern web browser (Chrome, Firefox, Edge)
3. The project folder placed inside `c:\xampp\htdocs\subscriptionmembership\`

---

## Installation & Setup

### Step 1 — Clone / Download the project

Place the entire project folder at:
```
c:\xampp\htdocs\subscriptionmembership\
```

### Step 2 — Start XAMPP

1. Open **XAMPP Control Panel** (search for it in the Start Menu)
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show a green "Running" status

### Step 3 — Import the Database

**Option A — Automatic (already done if you ran the CLI command):**

Open a terminal and run:
```powershell
c:\xampp\mysql\bin\mysql.exe -u root -e "source c:/xampp/htdocs/subscriptionmembership/db/membervaults.sql"
```

**Option B — Via phpMyAdmin (manual):**

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **Import** in the top navigation
3. Click **Choose File** and select `db/membervaults.sql`
4. Click **Go** at the bottom

### Step 4 — (Optional) Change Database Password

If your XAMPP MySQL root has a **password** (unusual on fresh installs), open `config/db.php` and update:

```php
define('DB_PASS', 'your_mysql_password');
```

By default it is empty `''` which works for fresh XAMPP installs.

---

## Running on Localhost

After completing the setup steps above:

1. Make sure **Apache** and **MySQL** are running in XAMPP
2. Open your browser and visit:

```
http://localhost/subscriptionmembership/
```

That's it — the app will load immediately.

---

## Default Credentials

### Admin Account
| Field    | Value |
|----------|-------|
| Email    | `admin@membervaults.com` |
| Password | `Admin@1234` |
| Redirect | `/admin.html` |

### Creating a User Account
Go to `http://localhost/subscriptionmembership/register.html` and fill in the form. You can register with any email/password and choose a plan during registration.

---

## Page Reference

| URL | Page | Access |
|-----|------|--------|
| `/` or `/index.html` | Landing page | Public |
| `/login.html` | Sign in | Public |
| `/register.html` | Create account | Public |
| `/dashboard.html` | User dashboard | Logged-in users |
| `/plans.html` | View & change plans | Logged-in users |
| `/admin.html` | Admin control panel | Admin only |

---

## API Endpoints

All endpoints return JSON. Base path: `/subscriptionmembership/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `php/auth/register.php` | None | Register new user |
| POST | `php/auth/login.php` | None | Login |
| GET | `php/auth/logout.php` | Session | Logout |
| GET | `php/auth/check_session.php` | None | Returns session state |
| GET | `php/plans/get_plans.php` | None | List all plans |
| POST | `php/subscription/subscribe.php` | User | Subscribe / switch plan |
| GET | `php/subscription/my_subscription.php` | User | Get active subscription |
| GET | `php/admin/users.php` | Admin | All users + plans |
| POST | `php/admin/update_plan.php` | Admin | Change user's plan |
| GET | `php/admin/dashboard_stats.php` | Admin | Platform stats |

---

## Access Control Logic

```
Public Pages       → index.html, login.html, register.html
Logged-In Pages    → dashboard.html, plans.html
  └── Guard: check_session.php → if not logged in, redirect to /login.html
Admin Pages        → admin.html
  └── Guard: check_session.php → if not admin role, redirect to /dashboard.html
```

Tier-locked content on the dashboard is controlled in `js/dashboard.js`:
- The PHP API returns the user's current plan **tier** (1–4)
- JS renders content blocks as **unlocked** (visible) or **locked** (blurred + lock icon)
- A server-side check also enforces this in `my_subscription.php`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page shows PHP code as text | Apache is not running — start it in XAMPP Control Panel |
| "Database connection failed" | MySQL is not running — start it in XAMPP Control Panel |
| Admin login fails | Re-run the DB import or visit `http://localhost/subscriptionmembership/fix_admin_password.php` if the file exists |
| "No active subscription" on dashboard | The user has no active subscription row — register again or use plans page to subscribe |
| Blank page / JS errors | Open browser DevTools (F12) → Console tab to see the specific error |
| Port conflict on 80 or 3306 | In XAMPP Control Panel → Config → change Apache port to 8080, then access via `http://localhost:8080/subscriptionmembership/` |

---

## Design System

The UI is built on CSS custom properties defined in `css/style.css`:

```css
--neon-cyan:    #00f5ff   /* Primary accent */
--neon-purple:  #a855f7   /* Secondary accent */
--neon-pink:    #f72585   /* Danger / highlight */
--neon-gold:    #f59e0b   /* Gold tier */
--bg-base:      #05050f   /* Page background */
--glass-border: rgba(255,255,255,0.08)
```

---

## License

This project is for educational and personal use.  
Built with ❤️ using HTML · CSS · ES6 · PHP · MySQL · XAMPP.
