# This lambda generates a pre-signed URL for uploading an MP3 recording to S3 with the filename as the patient ID.mp3.
# The patient ID is defined in the path param as patientId
import boto3
import json

def handler(event, context):
    print(event)
    patient_id = event["pathParameters"]["patientId"]
    s3_client = boto3.client("s3")
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": "dr-watson-patient-recordings",
            "Key": f"{patient_id}.mp3",
            "ContentType": "audio/mp3",
        },
        ExpiresIn=3600,
    )
    print(url)
    return {
        "statusCode": 200,
        "body": json.dumps({
            "url": url,
        })
    }
