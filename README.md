# CWC - Content with Coffee

CWC is a social network tailored for coffee enthusiasts. This platform is designed for users who want to share their coffee experiences, discover others' stories, and connect with like-minded individuals.

## Overview
The project was built with the following objectives:
- **Dynamic Landing Page:** A landing page that explains the platform and its benefits.
- **User Registration & Authentication:** Users can register using their Google account or a simple, fast registration form, followed by a login process.
- **Interactive Feed:** After logging in, users can scroll through a paginated feed displaying posts from community members.
- **User Profiles & Stories:** View other users’ walls and stories. Follow or unfollow users with a single click.
- **Engagement Features:** Like posts and leave comments, as well as quickly upload new posts.
- **Profile Management:** Update existing posts, change user details, and update the profile picture.
- **Real-Time Chat:** Engage in real-time chat using Socket.io to receive instant messages.
- **Production Deployment:** The project has been deployed to production using a domain provided by the college.

## Technologies Used
- **MERN Stack:** MongoDB, Express.js, React, and Node.js.
- **Google Authentication:** For streamlined user sign-in.
- **Socket.io:** For real-time messaging.
- **Concurrently:** Run both the frontend and backend servers simultaneously with a single command (`npm run dev`).

## How It Works
1. **Landing Page:** Users are greeted with a dynamic landing page that explains the platform.
2. **Registration:** New users can sign up using Google or a quick registration form.
3. **Login:** Registered users can log in to access the application.
4. **Feed:** Once logged in, users see a paginated feed of posts from the community.
5. **Profile & Interaction:** Users can visit other profiles, follow/unfollow, like, comment on posts, and update their own posts and profile details.
6. **Chat:** Real-time chat functionality allows users to communicate instantly.
7. **Production Ready:** The application is deployed on a custom domain provided by the college.

## Installation & Setup
To get started with the project, follow these steps:

1. **Clone the repository:**
   git clone https://github.com/yourusername/CWC-Content-With-Coffee.git

2. **Navigate into the project directory:**
   cd CWC--content-with-coffee
   
3. **Install dependencies and run the project concurrently:**
   npm run dev
