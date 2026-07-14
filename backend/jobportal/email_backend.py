import resend
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

resend.api_key = settings.RESEND_API_KEY


class EmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        count = 0
        for message in email_messages:
            html = None
            for content, mimetype in getattr(message, "alternatives", []):
                if mimetype == "text/html":
                    html = content
            try:
                resend.Emails.send({
                    "from": message.from_email,
                    "to": message.to,
                    "subject": message.subject,
                    "text": message.body,
                    "html": html or message.body,
                })
                count += 1
            except Exception as e:
                if not self.fail_silently:
                    raise
        return count