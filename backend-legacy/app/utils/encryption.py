"""Token encryption utilities for secure storage."""

from cryptography.fernet import Fernet

from app.config import settings


def get_cipher() -> Fernet:
    """Get Fernet cipher for token encryption."""
    key = settings.token_encryption_key.encode()
    return Fernet(key)


def encrypt_token(token: str) -> str:
    """Encrypt a token for storage."""
    cipher = get_cipher()
    return cipher.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a stored token."""
    cipher = get_cipher()
    return cipher.decrypt(encrypted_token.encode()).decode()
