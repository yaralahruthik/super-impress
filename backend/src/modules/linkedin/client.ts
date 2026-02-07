import { LINKEDIN_CONFIG } from "../../constants";

export async function createLinkedInPost(
  accessToken: string,
  personUrn: string,
  content: string
): Promise<string> {
  const response = await fetch(LINKEDIN_CONFIG.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": LINKEDIN_CONFIG.apiVersion,
      "X-RestLi-Protocol-Version": LINKEDIN_CONFIG.restliProtocolVersion,
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn API error (${response.status}): ${errorText}`);
  }

  const postId = response.headers.get("X-RestLi-Id");
  if (!postId) {
    throw new Error("LinkedIn API did not return a post ID");
  }

  return postId;
}

export function getPersonUrnFromAccountId(accountId: string): string {
  // LinkedIn account IDs are often already in the format "urn:li:person:abc123".
  // If not, normalize to a person URN.
  if (accountId.startsWith("urn:li:person:")) {
    return accountId;
  }
  return `urn:li:person:${accountId}`;
}
