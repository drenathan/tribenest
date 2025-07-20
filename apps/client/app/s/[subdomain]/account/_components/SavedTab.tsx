"use client";

import { useQuery } from "@tanstack/react-query";
import {
  usePublicAuth,
  useEditorContext,
  alphaToHexCode,
  PaginatedData,
  IPublicPost,
  websiteThemes,
} from "@tribe-nest/frontend-shared";
import { Bookmark } from "lucide-react";

export function SavedTab() {
  const { user } = usePublicAuth();
  const { themeSettings, profile, httpClient } = useEditorContext();
  const theme = websiteThemes.find((theme) => theme.slug === "tribe-nest-default");
  const PostItem = theme?.editorResolver["PostItem"];

  const { data, isLoading: savedPostsLoading } = useQuery<PaginatedData<IPublicPost>>({
    queryKey: ["saved-posts", user?.id, profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/posts/saved", {
        params: { accountId: user?.id, profileId: profile?.id },
      });
      return res.data;
    },
    enabled: !!user?.id && !!profile?.id && !!httpClient,
  });
  const savedPosts = data?.data;

  if (!PostItem) {
    return null;
  }

  return (
    <div
      className="border rounded-lg p-6"
      style={{
        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        backgroundColor: themeSettings.colors.background,
      }}
    >
      <div className="mb-4">
        <h3
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: themeSettings.colors.textPrimary }}
        >
          <Bookmark className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
          Saved Posts
        </h3>
      </div>
      <div>
        {savedPostsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded animate-pulse"
                style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.2)}` }}
              />
            ))}
          </div>
        ) : savedPosts && savedPosts.length > 0 ? (
          <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
            {savedPosts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bookmark className="w-12 h-12 mx-auto mb-4" style={{ color: themeSettings.colors.text }} />
            <h3 className="font-semibold mb-2" style={{ color: themeSettings.colors.textPrimary }}>
              No Saved Posts
            </h3>
            <p style={{ color: themeSettings.colors.text }}>
              You haven&apos;t saved any posts yet. Click the bookmark icon on posts from the member&apos;s page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
