# This lambda downloads the mp3 file in s3 defined as patientId.mp3 and saves it to the temp folder. the patientId comes as a path parameter.

import boto3

def handler(event, context):

    s3_client = boto3.client("s3")
    url = s3_client.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": "dr-watson-patient-recordings",
            "Key": f"{event['pathParameters']['patientId']}.mp3",
        },
        ExpiresIn=3600,
    )
    return {
        "statusCode": 200,
        "body": json.dumps({
            "url": url,
        })
    }

