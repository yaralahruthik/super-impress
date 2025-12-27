"""LinkedIn API client for interacting with LinkedIn."""

import httpx
from fastapi import HTTPException, status

from app.linkedin.config import linkedin_settings


async def get_user_info(access_token: str) -> dict:
    """Fetch LinkedIn user profile information using OpenID Connect."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{linkedin_settings.api_base_url}/v2/userinfo",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch LinkedIn user info",
            )

        return response.json()


async def create_post(access_token: str, person_urn: str, content: str) -> str:
    """
    Create a LinkedIn post using the Posts API.

    Returns: LinkedIn post URN
    """

    # Posts API requires specific version header
    current_version = "202511"

    post_data = {
        "author": person_urn,
        "commentary": content,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{linkedin_settings.api_base_url}/rest/posts",
            json=post_data,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0",
                "LinkedIn-Version": current_version,
            },
        )

        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create LinkedIn post: {response.text}",
            )

        # Extract post ID from response headers (x-restli-id)
        linkedin_post_id = response.headers.get("x-restli-id", "")
        return linkedin_post_id
