import random
import smtplib
import string
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

otp_store: dict = {}        # email -> {"otp": str, "expires": datetime}
otp_cooldown: dict = {}     # email -> last_request_time (rate-limit: 1 per 60s)


def _utc_now() -> datetime:
    return datetime.now(UTC)


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


def _send_otp_email(email: str, otp: str) -> bool:
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        return False
    message = EmailMessage()
    message["Subject"] = "Your ThinkStream verification code"
    message["From"] = settings.GMAIL_USER
    message["To"] = email
    message.set_content(f"Your ThinkStream verification code is {otp}. It expires in 10 minutes.")
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as smtp:
        smtp.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        smtp.send_message(message)
    return True


@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    email = str(req.email)
    now = _utc_now()

    # Rate limiting: 1 OTP per 60 seconds per email address
    last = otp_cooldown.get(email)
    if last and (now - last).total_seconds() < 60:
        remaining = int(60 - (now - last).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Please wait {remaining}s before requesting another code.",
        )

    otp = "".join(random.choices(string.digits, k=6))
    otp_store[email] = {"otp": otp, "expires": now + timedelta(minutes=10)}
    otp_cooldown[email] = now

    email_sent = False
    try:
        email_sent = _send_otp_email(email, otp)
    except Exception as exc:
        # SMTP failure: log it but don't 500 — OTP is stored, fall through to dev_otp
        print(f"[auth] SMTP error for {email}: {exc}", flush=True)

    response: dict = {
        "message": "OTP sent",
        "delivery": "email" if email_sent else "console",
    }

    if not email_sent and settings.DEBUG:
        print(f"\n==== DEV OTP for {email}: {otp} ====\n", flush=True)
        response["dev_otp"] = otp  # Exposed only in DEBUG mode for local development

    if not email_sent and not settings.DEBUG:
        raise HTTPException(status_code=503, detail="Email delivery unavailable. Configure GMAIL_USER and GMAIL_APP_PASSWORD.")

    return response


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    email = str(req.email)
    record = otp_store.get(email)
    if not record:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")
    if _utc_now() > record["expires"]:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="OTP expired.")
    if record["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP.")
    del otp_store[email]
    name = email.split("@")[0].replace(".", " ").title()
    return {"message": "Verified", "email": email, "name": name}
