import type {
    ManualPublicationRequestPlatform,
    PostListResponsePostsItemPublicationsItemPlatform,
} from "@/api/superimpress.schemas";
import type { LucideIcon } from "lucide-react";
import { Hash, Linkedin, Twitter, Users } from "lucide-react";

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

export const getPlatformIcon = (platform: Platform): LucideIcon => {
  const icons: Record<Platform, LucideIcon> = {
    linkedin: Linkedin,
    twitter: Twitter,
    threads: Hash,
    peerlist: Users,
  };
  return icons[platform] || Hash;
};
