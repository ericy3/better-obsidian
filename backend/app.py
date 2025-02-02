from fastapi import FastAPI, Response
import logging
from sklearn.cluster import DBSCAN
import numpy as np
import json
from typing import List
from pydantic import BaseModel

app = FastAPI()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

class FileEncodings(BaseModel):
    inputs: List[List[float]]
    # inputs: int

@app.get("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.post("/cluster")
async def clusterFiles(data: FileEncodings):
    if not data:
        return jsonify({"error": "No data provided"}), 400

    data = np.array(data.inputs)

    model = DBSCAN(eps=0.5, min_samples=1, metric="cosine")
    labels = model.fit_predict(data)

    logger.info("\n\n\n" + str(labels) + "\n\n\n") 
    logger.info("\n\n\n" + str(type(labels)) + "\n\n\n") 

    labelsList = labels.tolist()

    responseContent = json.dumps({"labels": labelsList})

    response = Response(
        content = responseContent
    )

    return response

