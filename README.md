# Open Job Portal

A web application built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS, allowing users to find jobs, post jobs, and manage applications.



---

## Features ✨

* **Job Search:** Users can search for jobs based on keywords, location, and job type.
* **User Roles:** Separate registration and dashboards for **Job Seekers** and **Employers**.
* **Job Posting:** Employers can post new job listings.
* **Job Application:** Job seekers can apply for jobs.
* **Employer Dashboard:**
    * View posted jobs.
    * View applicants for each job (including links to their profiles).
    * Update applicant status (Applied, Viewed, Interviewing, Rejected, Hired).
    * Delete posted jobs.
* **Job Seeker Dashboard:**
    * View applied jobs and their status.
    * Edit their public profile (name, contact, bio, skills).
* **Public Profiles:** Employers can view the profiles of job seekers who have applied.

---

## Tech Stack 🛠️

* **Backend:**
    * Node.js
    * Express.js
    * MongoDB (with Mongoose ODM)
    * `express-session` & `connect-mongo` (for session management)
    * `bcryptjs` (for password hashing)
    * `cors` (for handling cross-origin requests)
    * `dotenv` (for environment variables)
* **Frontend:**
    * HTML5
    * CSS3
    * Vanilla JavaScript (using Fetch API for AJAX)
* **Database:**
    * MongoDB Atlas (Cloud-hosted)
* **Deployment:**
    * Render (Backend: Web Service, Frontend: Static Site)

---

## Local Setup ⚙️

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create `.env` file:** Create a `.env` file in the root directory and add your environment variables (see below).
4.  **Run the server:**
    ```bash
    npm run dev
    ```
5.  Open your browser to `http://localhost:3000`.

---

## Environment Variables 🔑

Create a `.env` file in the root of the project and add the following variables:
