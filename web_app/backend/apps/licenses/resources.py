from mixins import TokenResourceMixin, LicenseAuthMixin
from apps.licenses.models import License
from project import db
from flask_restful import Resource, abort
from flask import jsonify


class LicensesResource(TokenResourceMixin):
    def post(self):
        new_license = License()
        token = self.generate_token(15)
        new_license.token = token
        db.session.add(new_license)
        db.session.commit()
        return jsonify({'id': new_license.id, 'token': token})


class LicenseCheckResource(LicenseAuthMixin, Resource):
    def post(self):
        license_id = self.verify_license()
        if not license_id:
            return {'token_valid': False, 'license_id': None}
        return {'token_valid': True, 'license_id': license_id}

    def get(self):
        abort(405, error='Method not allowed')


def register_resources(api):
    api.add_resource(LicensesResource, '/licenses')
    api.add_resource(LicenseCheckResource, '/verify_license')
