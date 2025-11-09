import pytest
from pydantic import ValidationError

from app.auth.models import UserCreate


def test_valid_password():
    user_data = {"email": "test@example.com", "password": "MyP@ssw0rd"}
    user = UserCreate(**user_data)
    assert user.password == "MyP@ssw0rd"


def test_invalid_password_no_uppercase():
    with pytest.raises(ValidationError, match="password_validation_error"):
        UserCreate(email="test@example.com", password="mypassword1@")


def test_invalid_password_no_lowercase():
    with pytest.raises(ValidationError, match="password_validation_error"):
        UserCreate(email="test@example.com", password="MYPASSWORD1@")


def test_invalid_password_no_digit():
    with pytest.raises(ValidationError, match="password_validation_error"):
        UserCreate(email="test@example.com", password="MyPassword@")


def test_invalid_password_no_special_char():
    with pytest.raises(ValidationError, match="password_validation_error"):
        UserCreate(email="test@example.com", password="MyPassword1")


def test_invalid_password_too_short():
    with pytest.raises(
        ValidationError, match="String should have at least 8 characters"
    ):
        UserCreate(email="test@example.com", password="MyP@ss1")


def test_invalid_password_too_long():
    with pytest.raises(
        ValidationError, match="String should have at most 15 characters"
    ):
        UserCreate(email="test@example.com", password="MyP@ssw0rdTooLong")


def test_invalid_password_with_invalid_chars():
    with pytest.raises(ValidationError, match="password_validation_error"):
        UserCreate(email="test@example.com", password="MyP@ssw0rd Inv")
