import json
import os
import uuid
from datetime import datetime, timezone

import boto3

s3 = boto3.client("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]

ROUTES = {
    "/api/petitions": {"type": "petition", "required": ["fullName", "email"]},
    "/api/updates": {"type": "update", "required": ["name", "email"]},
    "/api/shop-orders": {"type": "shop-order", "required": ["fullName", "email", "items"]},
}


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "content-type",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        "body": json.dumps(body),
    }


def handler(event, _context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    path = event.get("rawPath")

    if method == "OPTIONS":
        return response(200, {"ok": True})

    if method != "POST":
        return response(405, {"error": "Method not allowed."})

    config = ROUTES.get(path)
    if not config:
        return response(404, {"error": "Route not found."})

    try:
        payload = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return response(400, {"error": "Invalid JSON payload."})

    for field in config["required"]:
      value = payload.get(field)
      if not value or (isinstance(value, list) and len(value) == 0):
        return response(400, {"error": f"Missing required field: {field}."})

    now = datetime.now(timezone.utc)
    key = f"{config['type']}/{now.strftime('%Y-%m-%d')}/{int(now.timestamp() * 1000)}-{uuid.uuid4()}.json"

    record = {
        "type": config["type"],
        "receivedAt": now.isoformat(),
        "sourceIp": event.get("requestContext", {}).get("http", {}).get("sourceIp"),
        "userAgent": event.get("headers", {}).get("user-agent"),
        "payload": payload,
    }

    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=json.dumps(record, indent=2).encode("utf-8"),
        ContentType="application/json",
    )

    return response(200, {"ok": True, "key": key})
