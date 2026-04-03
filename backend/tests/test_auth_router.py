import os
from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ["DEBUG"] = "true"

from routers import auth


def create_client() -> TestClient:
    app = FastAPI()
    app.include_router(auth.router)
    return TestClient(app)


def setup_function() -> None:
    auth.otp_store.clear()
    auth.settings.GMAIL_USER = ""
    auth.settings.GMAIL_APP_PASSWORD = ""
    auth.settings.DEBUG = True


def test_send_otp_does_not_return_dev_code() -> None:
    client = create_client()

    response = client.post("/api/auth/send-otp", json={"email": "user@example.com"})

    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "OTP sent"
    assert body["delivery"] == "console"
    assert "dev_otp" not in body
    assert "user@example.com" in auth.otp_store


def test_verify_otp_succeeds_with_generated_code() -> None:
    client = create_client()
    client.post("/api/auth/send-otp", json={"email": "user@example.com"})
    otp = auth.otp_store["user@example.com"]["otp"]

    response = client.post(
        "/api/auth/verify-otp",
        json={"email": "user@example.com", "otp": otp},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "user@example.com"
    assert body["name"] == "User"
    assert "user@example.com" not in auth.otp_store


def test_verify_otp_rejects_wrong_code() -> None:
    client = create_client()
    client.post("/api/auth/send-otp", json={"email": "user@example.com"})

    response = client.post(
        "/api/auth/verify-otp",
        json={"email": "user@example.com", "otp": "000000"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect OTP."
