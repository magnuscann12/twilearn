"""
Django settings for twilearn project.
"""

from pathlib import Path
import os
import dj_database_url

# Only import dj_database_url if DATABASE_URL is set
if os.environ.get('DATABASE_URL'):
    try:
        import dj_database_url
    except ImportError:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent


# Security settings
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        'ALLOWED_HOSTS',
        'localhost,127.0.0.1'
    ).split(',')
    if host.strip()
]

# Only add WhiteNoise in production
ROOT_URLCONF = 'twilearn.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'twilearn.wsgi.application'

SECURE_SSL_REDIRECT = (
    os.environ.get('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
)

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = not DEBUG

if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Database configuration
if os.environ.get('DATABASE_URL'):
    # Use PostgreSQL on Render
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.config(
                conn_max_age=600,
                ssl_require=not DEBUG,
            )
        }
    except ImportError:
        # If dj_database_url is not available, use SQLite
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
    except Exception as e:
        import logging
        logging.error(f"Database configuration error: {e}")
        # Fallback to SQLite if database URL is invalid
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    # Use SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Only use WhiteNoise in production
if not DEBUG:
    try:
        STORAGES = {
            'staticfiles': {
                'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
            },
        }
        WHITENOISE_USE_FINDERS = True
    except ImportError:
        # If whitenoise is not available, use default storage
        pass

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:8000,http://127.0.0.1:8000').split(',')

# Add production domain if available
if not DEBUG and os.environ.get('ALLOWED_HOSTS'):
    for host in os.environ.get('ALLOWED_HOSTS').split(','):
        host = host.strip()
        if host:
            https_origin = f"https://{host}"
            http_origin = f"http://{host}"
            if https_origin not in CORS_ALLOWED_ORIGINS:
                CORS_ALLOWED_ORIGINS.append(https_origin)
            if http_origin not in CORS_ALLOWED_ORIGINS:
                CORS_ALLOWED_ORIGINS.append(http_origin)

# CSRF trusted origins should include the production domain
CSRF_TRUSTED_ORIGINS = []
if not DEBUG and os.environ.get('ALLOWED_HOSTS'):
    for host in os.environ.get('ALLOWED_HOSTS').split(','):
        host = host.strip()
        if host:
            CSRF_TRUSTED_ORIGINS.append(f"https://{host}")
            # Also add HTTP version for flexibility
            CSRF_TRUSTED_ORIGINS.append(f"http://{host}")
else:
    # Default for local development
    CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000']

CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'uw@3cf78imgk51gld!z6!2=*=m#+5)#d#1jm(6q8_g#xu1pj#4'
)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if not DEBUG:
    MIDDLEWARE.insert(
        1,
        'whitenoise.middleware.WhiteNoiseMiddleware'
    )

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'api',
]
