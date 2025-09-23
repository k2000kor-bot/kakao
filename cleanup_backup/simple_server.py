from flask import Flask, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'message': 'CORBU.AI Backend Server is running'
    })

@app.route('/api/status')
def api_status():
    return jsonify({
        'success': True,
        'data': {
            'server': 'CORBU.AI Backend',
            'version': '1.0.0',
            'status': 'active',
            'timestamp': datetime.datetime.now().isoformat()
        }
    })

@app.route('/api/test')
def test():
    return jsonify({
        'success': True,
        'message': 'Backend server is working correctly',
        'timestamp': datetime.datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8005, debug=True)
