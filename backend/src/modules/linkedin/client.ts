/**
 * LinkedIn API Client
 * Uses native fetch API for LinkedIn REST API v2
 */

export type LinkedInPostResponse = {
  id: string;
};

export type LinkedInProfileResponse = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: { country: string; language: string };
  email: string;
  email_verified: boolean;
};

/**
 * Create a post on LinkedIn
 * @param accessToken - LinkedIn OAuth access token
 * @param personUrn - LinkedIn person URN (e.g., "urn:li:person:abc123")
 * @param content - Post content text
 * @returns LinkedIn post ID
 */
export async function createLinkedInPost(
  accessToken: string,
  personUrn: string,
  content: string,
): Promise<string> {
  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": "202405",
      "X-RestLi-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: personUrn,
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as LinkedInPostResponse;
  return data.id;
}

/**
 * Get the authenticated user's LinkedIn profile
 * @param accessToken - LinkedIn OAuth access token
 * @returns LinkedIn profile data
 */
export async function getLinkedInProfile(
  accessToken: string,
): Promise<LinkedInProfileResponse> {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn API error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as LinkedInProfileResponse;
}

/**
 * Convert LinkedIn sub (from userinfo) to person URN
 * The sub is in the format of a URN already
 */
export function getPersonUrnFromSub(sub: string): string {
  // The sub from LinkedIn's OpenID Connect is already in the format "urn:li:person:abc123"
  // or it might just be the ID. We need to ensure it's a proper URN.
  if (sub.startsWith("urn:li:person:")) {
    return sub;
  }
  return `urn:li:person:${sub}`;
}
