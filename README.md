CleanTrack
A comprehensive cleaning quality management system designed for airport maintenance tracking. CleanTrack helps facilities managers monitor cleaning quality across different locations with a user-friendly interface for staff members to submit cleaning reports and administrators to track performance.

Show Image

Features
Multi-language Support: Available in English, Armenian, and Russian
User Role Management: Admin and Staff roles with appropriate permissions
Location Management: Create and manage cleaning locations
Customizable Checklists: Define cleaning tasks for each location
Quality Tracking: Rate cleaning tasks from 1-10 with photo evidence
Performance Analytics: Track completion rates and cleaning history
Mobile-Friendly Interface: Responsive design for use on tablets and smartphones
Tech Stack
Backend
Django 4.2
Django REST Framework
PostgreSQL
JWT Authentication
Frontend
React 18
Tailwind CSS
React Router
Axios
Local Development Setup
Prerequisites
Python 3.8+
Node.js 16+
PostgreSQL 12+
Git
Backend Setup
Clone the repository
bash
git clone https://github.com/yourusername/cleantrack.git
cd cleantrack
Create a virtual environment
bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
Install dependencies
bash
cd backend
pip install django==4.2.21 djangorestframework djangorestframework-simplejwt django-cors-headers django-filter pillow psycopg2-binary
Set up the database
bash
# Create the PostgreSQL database
createdb cleantrack

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser
Start the development server
bash
python manage.py runserver
The backend API will be available at http://localhost:8000/

Frontend Setup
Navigate to the frontend directory
bash
cd frontend
Install dependencies
bash
npm install
Create a .env file in the frontend directory
PORT=3001
REACT_APP_API_URL=http://localhost:8000/api
Start the development server
bash
npm start
The frontend will be available at http://localhost:3001/

Demo Accounts
For testing purposes, the following demo accounts are available:

Admin:
Username: admin
Password: admin123
Staff:
Username: staff1
Password: staff123
API Documentation
The API endpoints are as follows:

Authentication: /api/auth/
Login: POST /api/auth/login/
Refresh Token: POST /api/auth/refresh/
Register: POST /api/auth/register/
User Details: GET /api/auth/me/
Locations: /api/cleanings/locations/
List/Create: GET, POST /api/cleanings/locations/
Retrieve/Update/Delete: GET, PUT, DELETE /api/cleanings/locations/{id}/
Statistics: GET /api/cleanings/locations/{id}/stats/
Checklist Items: /api/cleanings/checklist-items/
List/Create: GET, POST /api/cleanings/checklist-items/
Retrieve/Update/Delete: GET, PUT, DELETE /api/cleanings/checklist-items/{id}/
Submissions: /api/cleanings/submissions/
List/Create: GET, POST /api/cleanings/submissions/
Retrieve/Update/Delete: GET, PUT, DELETE /api/cleanings/submissions/{id}/
Today's Submissions: GET /api/cleanings/submissions/today/
Statistics: GET /api/cleanings/submissions/stats/
Project Structure
cleantrack/
│
├── backend/                # Django backend
│   ├── accounts/           # User authentication app
│   ├── cleanings/          # Cleaning management app
│   ├── cleantrack/         # Project configuration
│   ├── manage.py
│   └── ...
│
└── frontend/               # React frontend
    ├── public/             # Static files
    ├── src/                # Source code
    │   ├── components/     # Reusable components
    │   ├── contexts/       # React contexts (auth, language)
    │   ├── locales/        # Translation files
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   └── ...
    └── ...
Deployment
Backend
Set DEBUG=False in settings.py
Configure proper ALLOWED_HOSTS
Set up a production database
Configure static files handling with a web server (Nginx/Apache)
Use Gunicorn or uWSGI as the WSGI server
Frontend
Build the production bundle:
bash
npm run build
Serve the static files with a web server like Nginx
License
MIT License

Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
Contact
Project Link: https://github.com/yourusername/cleantrack

