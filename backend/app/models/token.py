from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class TokenPayload(BaseModel):
    sub: EmailStr
    exp: datetime
    type: Literal["access", "refresh"]
