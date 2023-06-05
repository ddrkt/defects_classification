from flask import Flask
from flask_cors import CORS
from project import api
from project.settings import configure_application
# from apps.licenses.resources import register_resources as register_license_endpoints
from apps.ai_module.resources import register_resources as register_ai_resources


def register_api_endpoints(api_app):
    # register_license_endpoints(api_app)
    register_ai_resources(api_app)


def create_app():
    application = Flask(
        __name__,
        instance_relative_config=True
    )
    configure_application(application)
    CORS(application)
    # db.init_app(application)
    # migrate.init_app(application, db)
    register_api_endpoints(api)
    api.init_app(application)
    return application
