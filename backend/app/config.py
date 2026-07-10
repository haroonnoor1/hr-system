import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-change-me')

    # MySQL via PyMySQL
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://root:password@localhost/hr_system'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-me')
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    # Mail
    MAIL_SERVER          = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT            = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS         = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME        = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD        = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER  = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@hrms.com')

    FRONTEND_URL          = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    RESET_TOKEN_EXPIRES   = int(os.getenv('RESET_TOKEN_EXPIRES', 30))   # minutes


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig,
}
