import { describe, expect, it } from "bun:test";
import { constructSocialLink } from "@/utils/construct-social-links";

describe("constructSocialLink", () => {
  it("returns explicit url when provided", () => {
    const result = constructSocialLink({
      platform: "linkedin",
      platformPostId: "7425814161340801024",
      url: "https://example.com/custom",
    });

    expect(result).toBe("https://example.com/custom");
  });

  it("constructs linkedin url from urn", () => {
    const result = constructSocialLink({
      platform: "linkedin",
      platformPostId: "urn:li:share:7425814161340801024",
    });

    expect(result).toBe(
      "https://www.linkedin.com/feed/update/urn:li:share:7425814161340801024"
    );
  });

  it("constructs linkedin url from numeric id", () => {
    const result = constructSocialLink({
      platform: "linkedin",
      platformPostId: "7425814161340801024",
    });

    expect(result).toBe(
      "https://www.linkedin.com/feed/update/urn:li:share:7425814161340801024"
    );
  });

  it("returns null when platform is unsupported and no url", () => {
    const result = constructSocialLink({
      platform: "twitter",
      platformPostId: "123",
    });

    expect(result).toBeNull();
  });

  it("returns null when platformPostId is missing", () => {
    const result = constructSocialLink({
      platform: "linkedin",
    });

    expect(result).toBeNull();
  });
});
