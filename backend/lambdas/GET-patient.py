import uuid
import json


def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "patient_id": str(uuid.uuid4()),
        })
    }
