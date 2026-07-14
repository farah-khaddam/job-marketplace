import smtplib
import socket
from django.core.mail.backends.smtp import EmailBackend as DjangoSMTPBackend


class EmailBackend(DjangoSMTPBackend):
    def open(self):
        if self.connection:
            return False
        try:
            self.connection = smtplib.SMTP(timeout=self.timeout)
            # نجبر الاتصال يستخدم IPv4 فقط
            addr_info = socket.getaddrinfo(
                self.host, self.port, socket.AF_INET, socket.SOCK_STREAM
            )
            self.connection._host = self.host
            sock = socket.create_connection(addr_info[0][4], timeout=self.timeout)
            self.connection.sock = sock
            self.connection.file = sock.makefile("rb")
            (code, msg) = self.connection.getreply()
            if code != 220:
                self.connection.close()
                raise smtplib.SMTPConnectError(code, msg)
            self.connection.ehlo()
            if self.use_tls:
                self.connection.starttls()
                self.connection.ehlo()
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except OSError:
            if not self.fail_silently:
                raise
            return False