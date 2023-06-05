from project import db
from sqlalchemy.ext.declarative import declared_attr


class DefaultTableNameMixin(object):

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()


class BaseModel(DefaultTableNameMixin, db.Model):
    """
    Basic model that contains default methods and fields
    """
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime,
                              default=db.func.current_timestamp(),
                              onupdate=db.func.current_timestamp())

    def get_pk(self):
        return self.id
