from flask_restful import Resource, abort
from flask import request, jsonify
# from mixins import LicenseAuthMixin
from apps.ai_module.common import preprocess_img, predict_result

class AIPredictionResource(Resource):
    def post(self):
        # if not self.verify_license():
        #     abort(403, error='Invalid license key provided')

        try:
            if 'files[]' not in request.files:
                abort(400, error='No files provided')

            files = request.files.getlist('files[]')
            images = [preprocess_img(file.stream) for file in files]
            predictions = predict_result(images)

            results = []
            for id in range(0, len(images)):
                results.append(
                    {
                        'id': id,
                        'result': float(predictions.flat[id])
                    }
                )

            return jsonify(results)
        except:
            abort(400, error='File cannot be processed!')
            

    def get(self):
        abort(405, error='Method not allowed')

    def delete(self):
        abort(405, error='Method not allowed')

    def put(self):
        abort(405, error='Method not allowed')

    def patch(self):
        abort(405, error='Method not allowed')


def register_resources(api):
    api.add_resource(AIPredictionResource, '/predict')
