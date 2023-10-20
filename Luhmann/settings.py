from pathlib import Path
import os
import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent


DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

SECRET_KEY = config('SECRET_KEY', default='django-insecure-j+*zwrx525g=dva*5qum2-=0ev(o7yx2+fn*==dgd=p1rq+mcc')

ALLOWED_HOSTS = ["*"]
X_FRAME_OPTIONS = 'ALLOWALL'
IMPORT_EXPORT_USE_TRANSACTIONS = True


INSTALLED_APPS = [
    'daphne',
    'django_cleanup.apps.CleanupConfig',
    'Trees.apps.TreesConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.conf',
    'import_export',
    
]

ASGI_APPLICATION = "Luhmann.asgi.application"

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'Luhmann.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

try:
    DATABASES = {
        'default': dj_database_url.config(
            default=config('DATABASE_URL')
        )
    }
except:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

"""if os.getenv('BUCKETEER_AWS_ACCESS_KEY_ID'):
    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

    # aws settings
    AWS_ACCESS_KEY_ID = os.getenv('BUCKETEER_AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('BUCKETEER_AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('BUCKETEER_BUCKET_NAME')
    AWS_DEFAULT_ACL = None
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    # s3 static settings
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    # s3 public media settings
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles')
    DEFAULT_FILE_STORAGE = 'Trees.storage_backends.PublicMediaStorage'
else:
"""
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

# Base url to serve media files
MEDIA_URL = '/media/'
# Path where media is stored
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIAFILES_DIRS = (
    os.path.join(BASE_DIR, 'media'),
)
# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'