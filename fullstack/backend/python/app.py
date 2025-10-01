from flask import Flask, jsonify, request
from typedb.driver import TypeDB, Credentials, DriverOptions, TransactionType
import queries
from flask_cors import CORS
from config import *

app = Flask(__name__)
CORS(app)

typedb = TypeDB.driver(TYPEDB_ADDRESS, Credentials(TYPEDB_USERNAME, TYPEDB_PASSWORD), DriverOptions(TYPEDB_TLS_ENABLED, None))

@app.route('/')
def index():
    return jsonify({"message": "Python backend is running"})

@app.route('/api/pages')
def get_page_list():
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return jsonify(list(tx.query(queries.PAGE_LIST_QUERY).resolve().as_concept_documents()))

@app.route('/api/location/<place_id>')
def get_location_page_list(place_id):
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return jsonify(list(tx.query(queries.location_query(place_id)).resolve().as_concept_documents()))

@app.route('/api/user/<id>')
@app.route('/api/group/<id>')
@app.route('/api/organization/<id>')
def get_page(id):
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return jsonify(next(tx.query(queries.page_query(id)).resolve().as_concept_documents()))

@app.route('/api/posts')
def get_posts():
    page_id = request.args.get('pageId')
    if not page_id:
        return jsonify({'error': 'Missing pageId'}), 400
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return jsonify(list(tx.query(queries.posts_query(page_id)).resolve().as_concept_documents()))

@app.route('/api/comments')
def get_comments():
    post_id = request.args.get('postId')
    if not post_id:
        return jsonify({'error': 'Missing postId'}), 400
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return jsonify(list(tx.query(queries.comments_query(post_id)).resolve().as_concept_documents()))

@app.route('/api/create-user', methods=['POST'])
def post_create_user():
    payload = request.json
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
        tx.query(queries.create_user_query(payload)).resolve()
        tx.commit()
    return jsonify(None), 200

@app.route('/api/create-group', methods=['POST'])
def post_create_group():
    payload = request.json
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
        tx.query(queries.create_group_query(payload)).resolve()
        tx.commit()
    return jsonify(None), 200

@app.route('/api/create-organization', methods=['POST'])
def post_create_organization():
    payload = request.json
    with typedb.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
        tx.query(queries.create_organization_query(payload)).resolve()
        tx.commit()
    return jsonify(None), 200

@app.route('/api/media/<id>')
def get_media(id):
    # Not implemented, always returns 404
    return '', 404

@app.route('/api/media', methods=['POST'])
def post_media():
    content_type = request.headers.get('Content-Type', '')
    data = request.get_data()
    # Simulate base64 encoding and return a fake id
    # In production, store the media and return its id
    return jsonify({'id': '123'}), 200

if __name__ == '__main__':
    print(TYPEDB_ADDRESS)
    app.run(debug=True, port=8080) 
