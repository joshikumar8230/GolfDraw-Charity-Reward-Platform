⛳ GolfDraw Platform

Role: Full Stack Developer
Focus: Subscription-Based Rewards + Charity Integration
Objective: Build a scalable platform combining golf score tracking, monthly draw rewards, and charity contributions with real payment integration.

📑 Table of Contents

Project Overview
Modules Implemented
Architecture Overview
Draw & Prize Logic
Tech Stack
Authentication & Security
Payment Integration
Deployment
Usage

📌 Project Overview

GolfDraw is a full-stack web application that combines golf performance tracking, subscription-based prize draws, and charitable contributions into a single platform.

The system is designed to:

Encourage user engagement through rewards
Support charities through subscription contributions
Provide a clean and modern user experience

The application follows a production-ready architecture and implements real-world features like payment gateways, draw engines, and admin control panels.

🧩 Modules Implemented
1. Subscription & Payment System
Monthly & Yearly subscription plans
Razorpay payment integration
Secure payment verification
Subscription lifecycle management

2. Score Management System
Users enter golf scores (1–45 range)
Only latest 5 scores retained
Oldest score automatically replaced
Reverse chronological display

3. Draw & Reward Engine
Admin generates monthly draw numbers
Match Types:
5 Match → Jackpot
4 Match
3 Match
Winners automatically calculated
Prize split among winners

4. Jackpot Rollover System
If no 5-match winner:
Jackpot is carried forward
Stored in jackpot_carry field
Automatically added to next draw

5. Charity System
Users select a charity
Contribution linked to subscription
Charity management via admin panel

6. Admin Dashboard
Create & run draws
Manage users & subscriptions
View and verify winners
Approve / reject proofs
Track prize distribution

7. Winner Verification System
Users upload proof
Admin approves/rejects

Status flow:

pending → approved → paid

🏗️ Architecture Overview

[Frontend: React + MUI] 
        ↓
[Backend: Node.js + Express]
        ↓
[Database: Supabase (PostgreSQL)]
        ↓
[Payment: Razorpay]

🔁 Flow Example

User subscribes → Payment success → Subscription activated →
User enters scores → Admin runs draw → Winners calculated →
User uploads proof → Admin approves → Payment processed

🎯 Draw & Prize Logic

Prize Distribution
Match Type	Pool Share	Rollover
5 Match	          40%	         ✅ Yes
4 Match	          35%	         ❌ No
3 Match	          25%	         ❌ No

Key Rules
Monthly draw execution
Equal prize split among winners
Jackpot carries forward if unclaimed
Only active users participate

🛠️ Tech Stack
Frontend
React.js
Material UI
React Router
SweetAlert2
Backend
Node.js
Express.js
JWT Authentication
Database
Supabase (PostgreSQL)
Payment
Razorpay

🔐 Authentication & Security

JWT-based authentication is used to secure the application.

Flow
User logs in
Server generates JWT
Token stored in client
Sent in Authorization header
Authorization: <JWT_TOKEN>
Protected Routes
Score submission
Draw participation
Payment verification
Admin actions

💳 Payment Integration

Razorpay is used for handling subscriptions.

Flow
Create order from backend
Open Razorpay checkout
User completes payment
Verify signature
Activate subscription

🧪 Test Payment Details

Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: 123
OTP: 1234

🚀 Deployment

Frontend
Vercel
Backend
Render / Node Server
Database
Supabase

▶️ Usage

Register / Login
Choose subscription plan
Complete payment
Enter golf scores
Wait for monthly draw
Check results
Upload proof if winner
Admin verifies & processes payout

⭐ Key Highlights

Real-world payment integration
Scalable database design
Automated draw engine
Jackpot rollover logic
Admin + User dashboards
Clean UI with Material UI

📈 Future Improvements

Razorpay integration
Email notifications
Analytics dashboard
Mobile app version
AI-based draw logic
