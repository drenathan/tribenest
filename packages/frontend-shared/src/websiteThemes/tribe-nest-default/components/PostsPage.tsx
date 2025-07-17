"use client";
import { type UserComponent } from "@craftjs/core";
import {
  EditorText,
  EditorInput,
  EditorIcon,
  EditorModal,
  EditorButtonWithoutEditor,
} from "../../../components/editor/selectors";
import { addAlphaToHexCode, alphaToHexCode } from "../../../lib/utils";
import { useState, useMemo, useCallback } from "react";
import { useEditorContext } from "../../../components/editor/context";
import { css } from "@emotion/css";
import { useGetPosts } from "../../hooks/queries/usePosts";
import { PostItem } from "./PostItem";
import { useGetMembershipTiers } from "../../hooks/queries/useMembership";
import { debounce } from "lodash";
import { Badge } from "../../../components/ui/badge";
import { Pagination } from "./Pagination";
import type { PostType } from "../../../types";

export const PostsPage: UserComponent = () => {
  const { themeSettings, navigate } = useEditorContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current URL search params
  const searchParams = useMemo(
    () => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""),
    [],
  );

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedPostType, setSelectedPostType] = useState<PostType | "">((searchParams.get("type") as PostType) || "");
  const [selectedMembershipTierId, setSelectedMembershipTierId] = useState<string>(searchParams.get("tier") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));

  const { data: membershipTiers } = useGetMembershipTiers();

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Record<string, string | number>) => {
      const newSearchParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === 0) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
      navigate(newURL);
    },
    [searchParams, navigate],
  );

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchQuery(value);
        updateURLParams({ search: value, page: 1 }); // Reset to first page when search changes
      }, 500),
    [updateURLParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handlePostTypeChange = (type: PostType | "") => {
    setSelectedPostType(type);
    updateURLParams({ type, page: 1 }); // Reset to first page when filter changes
  };

  const handleMembershipTierChange = (tierId: string) => {
    setSelectedMembershipTierId(tierId);
    updateURLParams({ tier: tierId, page: 1 }); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURLParams({ page });
  };

  const filterParams = useMemo(
    () => ({
      query: debouncedSearchQuery,
      type: selectedPostType ? selectedPostType : "all",
      membershipTierId: selectedMembershipTierId,
      page: currentPage,
    }),
    [debouncedSearchQuery, selectedPostType, selectedMembershipTierId, currentPage],
  );

  const { data: posts } = useGetPosts(filterParams);

  const postTypes = [
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "poll", label: "Poll" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedPostType("");
    setSelectedMembershipTierId("");
    setCurrentPage(1);
    updateURLParams({ search: "", type: "", tier: "", page: 1 });
  };

  const hasActiveFilters = searchQuery || selectedPostType || selectedMembershipTierId;
  const badgeStyles = css({
    backgroundColor: addAlphaToHexCode(themeSettings.colors.primary, 0.1),
    color: themeSettings.colors.primary,
    fontSize: "14px",
    padding: "5px 10px",
    borderRadius: `${themeSettings.cornerRadius}px`,
  });

  return (
    <div className="w-full flex flex-col items-center  px-2 @md:px-8 min-h-screen pb-10">
      <div className="max-w-[1100px] w-full">
        <div className="w-full @md:w-3/5 flex flex-col gap-4 mt-6 @md:mt-8">
          <EditorText text="Posts" fontSize="24" fontSizeMobile="18" fontWeight="bold" />
          <div className="w-full flex gap-4 items-center">
            <EditorInput
              placeholder="Search posts..."
              width="90%"
              widthMobile="100%"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              className={css({
                border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.65)}`,
                borderRadius: `${themeSettings.cornerRadius}px`,
                padding: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                  borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
                },
                ...(hasActiveFilters && {
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                  borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
                }),
              })}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <EditorIcon icon="list-filter-plus" />
            </button>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={css({
                  color: addAlphaToHexCode(themeSettings.colors.text, 0.45),
                  fontSize: "14px",
                })}
              >
                Active filters:
              </span>
              {searchQuery && <Badge className={badgeStyles}>Search: "{searchQuery}"</Badge>}
              {selectedPostType && (
                <Badge className={badgeStyles}>
                  Type: {postTypes.find((t) => t.value === selectedPostType)?.label}
                </Badge>
              )}
              {selectedMembershipTierId && (
                <Badge className={badgeStyles}>
                  Tier: {membershipTiers?.find((t) => t.id === selectedMembershipTierId)?.name}
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className={css({
                  color: themeSettings.colors.primary,
                  fontSize: "14px",
                  textDecoration: "underline",
                  cursor: "pointer",
                })}
              >
                Clear all
              </button>
            </div>
          )}

          <EditorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Filter Posts"
            content={
              <div className="space-y-6">
                {/* Post Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="postType"
                        value=""
                        checked={selectedPostType === ""}
                        onChange={(e) => handlePostTypeChange(e.target.value as PostType)}
                        className="mr-2"
                        style={{
                          accentColor: themeSettings.colors.primary,
                        }}
                      />
                      All Types
                    </label>
                    {postTypes.map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="postType"
                          value={type.value}
                          checked={selectedPostType === type.value}
                          onChange={(e) => handlePostTypeChange(e.target.value as PostType)}
                          className="mr-2"
                          style={{
                            accentColor: themeSettings.colors.primary,
                          }}
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Membership Tier Filter */}
                <div>
                  <label
                    className={css({
                      color: addAlphaToHexCode(themeSettings.colors.text, 0.45),
                      marginBottom: "10px",
                    })}
                  >
                    Membership Tier
                  </label>
                  <select
                    value={selectedMembershipTierId}
                    onChange={(e) => handleMembershipTierChange(e.target.value)}
                    className={css({
                      border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.65)}`,
                      borderRadius: `${themeSettings.cornerRadius}px`,
                      padding: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      width: "100%",
                      "&:hover": {
                        backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
                      },

                      "&:focus": {
                        outline: "none",
                        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
                      },
                    })}
                  >
                    <option value="">All Tiers</option>
                    {membershipTiers?.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <EditorButtonWithoutEditor text="Clear Filters" onClick={clearFilters} variant="secondary" />
                  <EditorButtonWithoutEditor text="Apply Filters" onClick={() => setIsModalOpen(false)} />
                </div>
              </div>
            }
          />
        </div>

        <div
          className="w-full @md:w-3/5 flex flex-col gap-4 mt-6"
          style={{
            backgroundColor: themeSettings.colors.background,
          }}
        >
          {posts?.data?.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
          {(!posts?.data || posts.data.length === 0) && (
            <div
              className={css({
                textAlign: "center",
                padding: "40px 20px",
                color: themeSettings.colors.text,
                fontSize: "16px",
              })}
            >
              {hasActiveFilters ? "No posts found matching your filters" : "No posts found"}
            </div>
          )}

          {/* Pagination */}
          {posts && (
            <Pagination
              currentPage={posts.page}
              totalItems={posts.total}
              pageSize={posts.pageSize}
              onPageChange={handlePageChange}
              themeSettings={themeSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
};

PostsPage.craft = {
  name: "Posts",
  custom: {
    preventDelete: true,
  },
};
