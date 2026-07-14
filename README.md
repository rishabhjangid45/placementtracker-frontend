# 🎓 Placement Tracker

This is the frontend (user interface) for the **Placement Tracker** website. It is designed to help students keep track of their job applications, see their coding progress, upload resumes, and check how well their resume matches a job description (ATS score).

---

## ✨ Features

### 1. 📊 Dashboard
* **Coding Stats**: Shows your solved coding questions and daily streak. Includes a sync button to refresh your stats.
* **Job Progress Chart**: A simple bar chart showing your job statuses (like Applied, Interview, Rejected). You can click on a bar to view those specific jobs.
* **Recent Resume**: Quickly shows your most recently uploaded resume.

### 2. 💼 Job Tracker
* A clean table listing all your job applications (Company name, Role, Date, and Status).
* Change a job's status (Applied, Online Assessment, Interview, Rejected, Selected) instantly using a simple dropdown.
* Add new jobs quickly using a simple form.

### 3. 📄 Resume & ATS Hub
* Drag and drop your resumes (PDF or Word files) to upload them.
* **ATS Score Checker**: Select a resume, paste a job description, and get a match score to see how well you fit the role.
* **Resume History**: View a list of all your uploaded resumes and download them whenever you need.

### 4. 🎨 Design & Theme
* **Modern Interface**: Uses clean, glass-like panels and transparent cards.
* **Theme Toggle (Dark & Light Mode)**: Switch between dark and light modes. The transition grows in a smooth circle starting right from where you click the button.
* **Dynamic Logo**: The tab icon (favicon) changes color automatically to look good on both dark and light browser tabs.

---

## 🛠️ Technologies Used

Here is a simple explanation of the tools and technologies used to build this application:

* **React**: The main framework used to build the website's user interface. It allows us to build the page using reusable blocks (components) like buttons, tables, and cards.
* **TypeScript**: A programming language that builds on top of JavaScript. It adds rules that prevent common coding mistakes, making the code safer and easier to maintain.
* **Vite**: A modern tool that runs the project locally during development and packages the code efficiently when it is ready to be published.
* **Tailwind CSS**: A stylesheet utility that allows us to design and customize the website's colors, spacing, and layout quickly without writing separate CSS files.
* **ShadCN UI**: A collection of beautifully designed and accessible interface pieces (like cards, dropdowns, and text inputs) that we use as building blocks.
* **React Query (TanStack Query)**: A tool that manages the data coming from the backend server. It handles loading states, automatically updates your dashboard when data changes, and temporarily saves data so the app feels fast.
* **Axios**: A helper tool used to send network requests to the backend server (such as logging in, saving jobs, or uploading resumes).
* **Recharts**: A library used to build the interactive charts and graphs shown on the dashboard.
* **React Router**: A tool that allows you to click around and change pages (like moving from Dashboard to Jobs) instantly without reloading the entire website.


Made By ~Rishabh~ :)
