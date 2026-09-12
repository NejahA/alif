from ..Config.mysqlconnection import connectToMySQL
from flask_app import DATABASE


class FilmMaker:
    def __init__ (self,data):
        self.id=data['id']
        self.name= data['name']
        self.created_at= data['created_at']
        self.updated_at= data['updated_at']

    
    @classmethod
    def save(csl,data):
        query = '''
                INSERT INTO film_makers (name) values (%(name)s)
                '''
        
        return connectToMySQL(DATABASE).query_db(query,data)