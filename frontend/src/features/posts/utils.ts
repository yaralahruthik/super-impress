import {
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconLabel,
} from "@tabler/icons-react";
import type {
  ManualPublicationRequestPlatform,
  PostListResponsePostsItemPublicationsItemPlatform,
} from "@/api/superimpress.schemas";

type Platform =
  | ManualPublicationRequestPlatform
  | PostListResponsePostsItemPublicationsItemPlatform;

export const getPlatformLabel = (platform: Platform): string => {
  const labels: Record<Platform, string> = {
    linkedin: "LinkedIn",
    twitter: "Twitter/X",
    threads: "Threads",
    peerlist: "Peerlist",
  };
  return labels[platform] || platform;
};

export const getPlatformIcon = (platform: Platform): React.ElementType => {
  const icons: Record<Platform, React.ElementType> = {
    linkedin: IconBrandLinkedin,
    twitter: IconBrandX,
    threads: IconBrandThreads,
    peerlist: IconLabel,
  };
  return icons[platform] || IconLabel;
};
