"""
WSGI config for twilearn project.
"""

import os
import logging

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'twilearn.settings')

# Set up logging
logging.basicConfig(level=logging.INFO)

application = get_wsgi_application()
