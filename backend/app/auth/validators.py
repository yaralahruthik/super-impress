import re

from pydantic_core import PydanticCustomError


def password_validator(password: str) -> str:
    """Validate password strength."""
    pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;:,.<>?/])[A-Za-z\d!@#$%^&*()\-_=+\[\]{}|;:,.<>?/]+$"
    if not re.match(pattern, password):
        raise PydanticCustomError(
            "password_validation_error",
            "Password must contain at least one uppercase letter, lowercase letter, digit, and special character",
        )
    return password
