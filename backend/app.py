from flask import Flask, request, jsonify
from sklearn.cluster import DBSCAN
import numpy as np

app = Flask(__name__)

@app.route("/cluster", methods=['POST'])
def clusterFiles():
    data = request.json.get("data")
    if not data:
        return jsonify({"error": "No data provided"}), 400

    data = np.array(data)
    print(data)

    model = DBSCAN()
    labels = model.fit(X)

    return labels



if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)