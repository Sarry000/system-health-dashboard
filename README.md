System Health Monitoring Dashboard
This project is a complete, end-to-end system for monitoring the security compliance of multiple computers from a central web-based dashboard. It consists of a cross-platform client utility, a backend API server, and a frontend admin dashboard.

(Note: You will need to take a screenshot of your final dashboard, upload it to a site like Imgur, and replace the URL above.)

Features
Centralized Monitoring: View the health status of all registered machines in a single, easy-to-use interface.

Real-time Updates: The dashboard polls for new data, providing a near real-time view of your network's health.

Key Security Checks: The client utility monitors critical security policies:

Disk Encryption: Verifies if the main system drive is encrypted (e.g., BitLocker on Windows).

Antivirus Status: Checks if a common antivirus program is running.

Sleep Policy Compliance: Ensures the machine is set to sleep or lock after 10 minutes or less of inactivity.

Cross-Platform Utility: The Python-based utility is designed to run on Windows, macOS, and Linux.

Modern Tech Stack: Built with a robust and scalable stack including React, Node.js, and Google Firestore.

Tech Stack
Frontend: React (Vite)

Backend: Node.js, Express.js

Database: Google Firestore

Client Utility: Python

Getting Started
Follow these instructions to set up and run the project on your local machine.

1. Prerequisites
Ensure you have the following software installed:

Node.js (which includes npm)

Python

Git

2. Firebase Setup (Required)
The project uses a free Google Firebase project for its database.

Create a Firebase Project:

Go to the Firebase Console and create a new, free project.

Set Up Firestore:

Inside your project, navigate to Build > Firestore Database.

Click "Create database" and choose to start in Test mode.

Get Service Account Key:

In your project settings (click the ⚙️ icon), go to the Service accounts tab.

Click "Generate new private key".

A JSON file will be downloaded. Rename this file to serviceAccountKey.json.

3. Local Installation
Clone the Repository:

git clone https://github.com/Sarry000/system-health-dashboard.git
cd system-health-dashboard

Set Up the Backend:

Move the serviceAccountKey.json file you downloaded into the system-local-backend folder.

Navigate to the backend directory and install dependencies:

cd system-local-backend
npm install

Set Up the Frontend:

Navigate to the frontend directory and install dependencies:

cd ../system-frontend
npm install

Set Up the Python Utility:

Navigate to the Python utility directory:

cd ../system-utility-python

Create and activate a virtual environment:

# On Windows
python -m venv venv
.\venv\Scripts\activate

Install required packages:

pip install requests

How to Run the Application
To run the project, you need to have three separate terminals open and running at the same time.

Terminal 1: Start the Backend Server
# Navigate to the backend folder
cd path/to/system-local-backend

# Start the server
node index.js

(You should see the message: ✅ Local server running on http://localhost:3001)

Terminal 2: Start the Frontend Dashboard
# Navigate to the frontend folder
cd path/to/system-frontend

# Start the development server
npm run dev

(This will open the dashboard in your browser, usually at http://localhost:5173)

Terminal 3: Start the Python Utility
# Navigate to the utility folder
cd path/to/system-utility-python

# Activate the virtual environment (if not already active)
.\venv\Scripts\activate

# Run the script
python utility.py

(This will begin collecting and sending health data to your server.)

You should now see your machine's data appear on the dashboard.

Project Architecture
The system is composed of three independent components that work together:

The Python Utility: Runs on a client machine. It periodically checks system settings using native OS commands, packages the results into a JSON payload, and sends it to the backend server's API endpoint.

The Node.js Backend: Acts as the central hub. It receives the JSON data from any number of utilities, authenticates with the Firestore database using a secure service account key, and saves the data. It also exposes an endpoint for the frontend to fetch this data.

The React Frontend: The user-facing dashboard. It polls the backend server for the latest data and uses it to render the summary cards and the machine status table, providing a clear and up-to-date view of the system's health.
