# Smart Job Seeker Platform

## Project Title

Smart Job Seeker Platform – AI-Powered Career Development, Recruitment & Skill Intelligence Platform

## Project Overview

Smart Job Seeker Platform is an AI-powered career development and recruitment platform designed to connect job seekers, HR teams, employers, and administrators within one intelligent ecosystem.

The platform combines job search, CV submission, AI-powered resume analysis, CV-job match scoring, HR remarks, AI-generated aptitude/coding/writing assessments, interview scheduling, real-time communication, and in-site video conferencing.

## Core Idea

The project combines ideas from:

- LinkedIn: profile, career identity, job discovery, recruiter communication
- BDjobs: job listings, CV submission, applicant tracking
- BambooHR: HR dashboard, candidate pipeline, interview scheduling
- AI: resume scoring, job matching, assessment generation, skill intelligence

## Initial User Roles

The first implementation will focus on:

- Admin
- HR / Recruiter
- Job Seeker / Applicant

## Main Features

- Role-based OTP login
- Admin, HR, and Job Seeker dashboards
- HR job posting
- CV upload and job application
- AI CV-job match score
- HR remarks on candidate CV
- AI-generated aptitude, coding, and writing assessments
- Google Calendar interview scheduling
- In-site video conference
- Real-time chat and notifications
- Admin monitoring and approval system

## Tech Stack

### Frontend
- React
- Tailwind CSS
- React Query
- Redux Toolkit
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### AI
- OpenAI API or local LLM
- Resume parsing
- CV-job match scoring
- AI assessment generation

### Real-Time
- Socket.IO
- WebRTC

### External Services
- Google Calendar API
- Email OTP service
- Cloudinary or AWS S3

## Project Structure

```text
smart-job-seeker-platform/
├── client/
├── server/
├── docs/
├── README.md
└── .gitignore