# Online Course Registration System

An automated, web-based university course registration platform built with a custom dark-forest green design theme, role-based access management, prerequisite validation, credit limit tracking, and schedule conflict detection.

---

## 🎨 Color Palette Specifications

This project implements the custom HSL/Hex color system:
- **`#051F20`**: Dark Forest Green (Primary App Background & Header)
- **`#0B2B26`**: Deep Teal (Card Containers & Sidebar Navigation)
- **`#163832`**: Forest Teal Accent (Input fields, Data Tables & Sub-panels)
- **`#235347`**: Mid Sage Green (Action Buttons & Primary Interactivity)
- **`#8EB69B`**: Soft Sage Mint (Borders, Badges & Secondary Accents)
- **`#DAF1DE`**: Light Mint (Primary Text & Clean Typography)

---

## 🚀 Key Features

1. **Role-Based Authentication & Access Control**
   - Quick role switcher for **Student**, **Instructor**, and **Admin**.
   - Profile badge updates and dedicated navigation views for each role.

2. **Student Portal & Course Registration**
   - **Course Catalog**: Filter by department (CSE, EEE, MATH, BBA) or search by code/title/faculty.
   - **Prerequisite Checking**: Automatically detects if student has completed required prerequisites.
   - **Credit Limit Tracker**: Live progress bar enforcing student credit limits (e.g. max 15 credits).
   - **Schedule Conflict Engine**: Real-time detection of day and time slot overlaps (e.g., Mon/Wed 09:00 - 10:30).
   - **My Enrolled Timetable**: View and manage enrolled courses with one-click drop action.

3. **Instructor Portal**
   - View enrolled student roster per section.
   - Grade entry interface and roster export options.

4. **Administrator Portal**
   - Add/Offer new courses (Code, Title, Dept, Credits, Days, Start/End Time, Room, Prereq, Capacity).
   - Manage and delete existing catalog courses.

5. **Local Data Persistence**
   - Uses browser `localStorage` to save catalog modifications, enrollments, and student state.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (CSS Custom Properties & Flexbox/Grid), JavaScript (ES6 Modules)
- **Icons**: Font Awesome 6.4
- **Fonts**: Plus Jakarta Sans (Google Fonts)

---

## 📥 How to Run Locally

Simply open `index.html` in any web browser, or serve it using Live Server / any local HTTP server:

```bash
# Using python HTTP server
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## 🌐 Git & GitHub Workflow Guide

To push this project to your GitHub repository:

```bash
# 1. Initialize local Git repository
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Online Course Registration System with custom theme"

# 4. Add your remote GitHub repository URL
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 5. Push to GitHub main branch
git branch -M main
git push -u origin main
```
