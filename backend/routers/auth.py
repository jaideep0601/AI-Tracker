import random
import smtplib
import string
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
otp_store: dict = {}


def _utc_now() -> datetime:
    return datetime.now(UTC)

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


def _send_otp_email(email: str, otp: str) -> bool:
    """Send OTP over SMTP when credentials are configured."""
    if not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD:
        return False

    message = EmailMessage()
    message["Subject"] = "Your ThinkStream verification code"
    message["From"] = settings.GMAIL_USER
    message["To"] = email
    message.set_content(
        f"Your ThinkStream verification code is {otp}. It expires in 10 minutes."
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as smtp:
        smtp.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        smtp.send_message(message)

    return True

@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    otp = "".join(random.choices(string.digits, k=6))
    email = str(req.email)
    otp_store[email] = {"otp": otp, "expires": _utc_now() + timedelta(minutes=10)}

    try:
        email_sent = _send_otp_email(email, otp)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {exc}") from exc

    if not email_sent and settings.DEBUG:
        print(f"\n==== DEV OTP for {email}: {otp} ====\n", flush=True)

    return {
        "message": "OTP sent",
        "delivery": "email" if email_sent else "console",
    }

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
