# TwiLearn - Twi Language Learning Web App

When it comes to situations such as students going on internships which require communication with customers it becomes a problem when there is a language barrier between the two individuals. The solution to this is a simple Django based web app that teaches Student local languages like Twi to break the language Barrier.
The tools to be used for this project are HTML, CSS, JavaScript, Django and Django Rest Framework(DRF)
This projcet is a Django-based web app which is used in learning the Twi (Asante) language, featuring study activities, flashcards, quizzes, and progress tracking.

## Features

- **Word Management**: This adds and organizes Twi vocabulary words with translations, pronunciations, and example sentences
- **Grouping**: Organize words into thematic groups for focused study
- **Study Activities**: These are multiple activity types including flashcards, quizzes, and matching exercises
- **Session Tracking**: Track study sessions with scores and progress statistics
- **Modern Frontend**: Responsive UI with dark mode support

## Tech Stack

- **Backend**: Django 
- **API**: Django REST 
- **Frontend**: JavaScript with TailwindCSS
- **Database**: SQLite

## Setup Instructions

### 1. Install Dependencies

Create a virtual environment and install the required packages:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run Migrations

Create the database tables:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (Optional)

Create an admin account to manage data via the Django admin:

```bash
python manage.py createsuperuser
```

### 4. Run Development Server

Start the development server:

```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`

### 5. Access Admin Panel

Visit `http://localhost:8000/admin` to manage groups, words, activities, and sessions.

## API Endpoints

The Django REST Framework provides the following API endpoints:

- `GET/POST /api/groups/` - Manage word groups
- `GET/POST /api/words/` - Manage vocabulary words
- `GET/POST /api/study-activities/` - Manage study activities
- `GET/POST /api/study-sessions/` - Manage study sessions
- `POST /api/study-activities/{id}/start_session/` - Start a new study session
- `POST /api/study-activities/{id}/complete_session/` - Complete a study session
- `GET /api/study-sessions/stats/` - Get study statistics

## Frontend Structure

The frontend is served from the root URL and uses client-side routing:

- `#/dashboard` - Main dashboard with statistics
- `#/study_activities` - List of study activities
- `#/words` - Vocabulary word list
- `#/groups` - Word groups
- `#/study_sessions` - Study session history
- `#/settings` - Application settings

## Development

To add new features:

1. Modify models in `api/models.py`
2. Run migrations: `python manage.py makemigrations && python manage.py migrate`
3. Update serializers in `api/serializers.py`
4. Update views in `api/views.py`
5. Frontend JavaScript files are in `static/js/`

## Deployment (Render.com)

This project is configured for deployment on Render.com with the following files:

- `render.yaml` - Render service configuration
- `Procfile` - Specifies the web process (gunicorn)
- `render-build.sh` - Build script for migrations and static files
- `requirements.txt` - Updated with production dependencies

### Deployment Steps:

1. **Push your code to GitHub**
2. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Configure environment variables as needed

3. **Environment Variables (automatically set by render.yaml):**
   - `DEBUG=False`
   - `SECRET_KEY`
   - `DATABASE_URL` (auto-created PostgreSQL)
   - `ALLOWED_HOSTS` 

4. **The build process will:**
   - Install dependencies
   - Run database migrations
   - Collect static files
   - Start the gunicorn server

### Local Development vs Production:

- **Local**: Uses SQLite database, DEBUG=True
- **Production**: Uses PostgreSQL, DEBUG=False, SSL enabled

## License

This project is open source and available for educational purposes.
