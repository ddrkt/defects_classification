from project import db
from mixins import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.hybrid import hybrid_property


class License(BaseModel):
    token_hash = db.Column(db.String(255), nullable=False, unique=True)

    @hybrid_property
    def token(self):
        return self.token_hash

    @token.setter
    def token(self, token):
        self.token_hash = generate_password_hash(token)

    def verify_token(self, token):
        return check_password_hash(self.token, token)
