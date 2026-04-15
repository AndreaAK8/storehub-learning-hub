#!/usr/bin/env python3
"""
Upload Day 1 & Day 2 PPTX slides to Google Drive and get shareable links.
Re-authenticates with drive.file scope (write permission).
"""

import os
import json
import sys
import warnings
warnings.filterwarnings("ignore")

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
CLIENT_SECRETS = os.path.expanduser("~/.config/gdrive-mcp/gcp-oauth.keys.json")
TOKEN_FILE = os.path.expanduser("~/.config/gdrive-mcp/upload_token.json")

FILES = [
    {
        "path": "/Users/ak/Downloads/[Day 1] What & Why (1).pptx",
        "name": "[Day 1] What & Why - MOM Training.pptx",
        "mime": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    {
        "path": "/Users/ak/Downloads/[Day 2] The 'How' (2).pptx",
        "name": "[Day 2] The How - MOM Training.pptx",
        "mime": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
]

def get_creds():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, SCOPES)
            creds = flow.run_local_server(port=0, open_browser=True)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    return creds

def upload_file(service, file_info):
    print(f"\nUploading: {file_info['name']} ...")
    meta = {"name": file_info["name"]}
    media = MediaFileUpload(file_info["path"], mimetype=file_info["mime"], resumable=True)
    result = service.files().create(body=meta, media_body=media, fields="id,name").execute()
    file_id = result["id"]

    # Make shareable (anyone with link can view)
    service.permissions().create(
        fileId=file_id,
        body={"role": "reader", "type": "anyone"},
    ).execute()

    link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    print(f"  Done! ID: {file_id}")
    print(f"  Link: {link}")
    return file_id, link

def main():
    print("Authenticating with Google Drive (write scope)...")
    creds = get_creds()
    service = build("drive", "v3", credentials=creds)
    print("Authenticated.")

    results = []
    for f in FILES:
        if not os.path.exists(f["path"]):
            print(f"ERROR: File not found: {f['path']}")
            sys.exit(1)
        file_id, link = upload_file(service, f)
        results.append({"name": f["name"], "id": file_id, "link": link})

    print("\n" + "="*60)
    print("UPLOAD COMPLETE — copy these into training_modules:")
    print("="*60)
    for r in results:
        print(f"\n{r['name']}")
        print(f"  resource_url: {r['link']}")

    # Save to a JSON file for easy reference
    out = "/Users/ak/Desktop/Training - LMS (In Works)/slide_links.json"
    with open(out, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved to: {out}")

if __name__ == "__main__":
    main()
