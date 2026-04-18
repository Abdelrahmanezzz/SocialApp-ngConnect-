# NgConnect 🔴

A modern social networking platform built with Angular 17+, where users can share posts, connect with friends, and stay updated with their community.

## 🌐 Live Demo

**[https://ngconnect-6a8jmch8z-salehhassan313-5018s-projects.vercel.app](https://ngconnect-6a8jmch8z-salehhassan313-5018s-projects.vercel.app)**

## ✨ Features

- 🔐 **Authentication** — Register, Login with email or username, Change password
- 📰 **Feed** — View posts from people you follow
- 📝 **Posts** — Create, edit and delete posts with image support
- 💬 **Comments** — Create, edit and delete comments on posts
- ❤️ **Likes** — Like and unlike posts with optimistic UI updates
- 👤 **Profile** — View your profile, posts, followers and following count
- 🖼️ **Photo Upload** — Update your profile photo
- 🔔 **Notifications** — View your notifications with unread count badge
- 🔍 **Post Detail** — View a single post with all its comments
- 🛡️ **Route Guards** — Protected routes for authenticated users

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Angular 21** | Frontend framework |
| **TypeScript** | Language |
| **Tailwind CSS** | Styling |
| **Angular Signals** | State management |
| **Reactive Forms** | Form handling and validation |
| **RxJS** | HTTP and async operations |
| **Font Awesome** | Icons |
| **Vercel** | Deployment |

## 📁 Project Structure

src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth and logged-in guards
│   │   ├── interceptors/    # Auth token interceptor
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # Auth, Post, Notification services
│   ├── features/
│   │   ├── auth/            # Login and Register pages
│   │   └── main/            # Feed, Profile, Notifications, Post Detail
│   ├── layout/
│   │   ├── auth-layout/     # Layout for login/register pages
│   │   └── main-layout/     # Layout with sidebar for main pages
│   └── shared/
│       └── components/      # Post, Sidebar, Not Found components
└── assets/
    └── images/              # Default avatar and static assets
