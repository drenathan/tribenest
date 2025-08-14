"use client";
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
import { type UserComponent } from "@craftjs/core";
import { useGetProducts } from "../../hooks/queries/useProducts";
import { ProductCategory } from "../../../types";
import { MusicItem } from "./MusicItem";
import { Pagination } from "./Pagination";
import { Badge } from "../../../components/ui/badge";
import { debounce } from "lodash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tribe-nest/frontend-shared";
import { CreditCard, Music, Shirt } from "lucide-react";
import { ProductItem } from "./ProductItem";

export const MusicPageContent: UserComponent = () => {
  const { themeSettings, navigate } = useEditorContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  // Initialize state from URL params
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryFromURL, setCategoryFromURL] = useState(searchParams.get("category") || ProductCategory.Music);
  const [releaseTypeFromURL, setReleaseTypeFromURL] = useState(
    (searchParams.get("releaseType") as "album" | "single" | "all") || "all",
  );

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
        setCurrentPage(1); // Reset to first page when search changes
        updateURLParams({ search: value, page: 1 });
      }, 500),
    [updateURLParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURLParams({ page });
  };

  const handleReleaseTypeChange = (newReleaseType: "album" | "single" | "all") => {
    setCurrentPage(1);
    setReleaseTypeFromURL(newReleaseType);
    updateURLParams({ releaseType: newReleaseType, page: 1 });
  };

  const filterParams = useMemo(
    () => ({
      query: debouncedSearchQuery,
      category: categoryFromURL as ProductCategory,
      page: currentPage,
      releaseType: releaseTypeFromURL,
    }),
    [debouncedSearchQuery, currentPage, releaseTypeFromURL, categoryFromURL],
  );

  const { data: products } = useGetProducts(filterParams);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
    setReleaseTypeFromURL("all");
    updateURLParams({ search: "", releaseType: "all", page: 1, category: ProductCategory.Music });
  };

  const hasActiveFilters = searchQuery || releaseTypeFromURL !== "all";
  const badgeStyles = css({
    backgroundColor: addAlphaToHexCode(themeSettings.colors.primary, 0.1),
    color: themeSettings.colors.primary,
    fontSize: "14px",
    padding: "5px 10px",
    borderRadius: `${themeSettings.cornerRadius}px`,
  });

  return (
    <div className="w-full flex flex-col items-center  px-2 @md:px-8 min-h-screen pb-10">
      <div className="w-full @md:w-3/5 flex flex-col gap-4 mt-6 @md:mt-8">
        <EditorText text="My Store" fontSize="24" fontSizeMobile="18" fontWeight="bold" />
        <div>
          <Tabs
            value={categoryFromURL}
            onValueChange={(value) => {
              setCategoryFromURL(value);
              updateURLParams({ category: value });
            }}
            className="w-full"
          >
            <TabsList
              className="grid w-full grid-cols-2 @md:grid-cols-4 mb-2 gap-4 border rounded-lg p-2"
              style={{
                backgroundColor: `${themeSettings.colors.background}${alphaToHexCode(0.1)}`,
                border: "none",
              }}
            >
              <TabsTrigger
                value={ProductCategory.Music}
                className="flex items-center gap-2 @md:gap-3"
                style={{ color: themeSettings.colors.text }}
              >
                <Music className="w-4 h-4 @md:w-5 @md:h-5" />
                <span className="text-xs @md:text-sm">Music</span>
              </TabsTrigger>
              <TabsTrigger
                value={ProductCategory.Merch}
                className="flex items-center gap-2 @md:gap-3"
                style={{ color: themeSettings.colors.text }}
              >
                <Shirt className="w-4 h-4 @md:w-5 @md:h-5" />
                <span className="text-xs @md:text-sm">Merch</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="w-full flex gap-4 items-center">
          <EditorInput
            placeholder={`Search ${categoryFromURL}...`}
            width="90%"
            widthMobile="100%"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button
            disabled={categoryFromURL === ProductCategory.Merch}
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
              "&:disabled": {
                opacity: 0.5,
                cursor: "not-allowed",
              },
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
            {releaseTypeFromURL !== "all" && (
              <Badge className={badgeStyles}>{releaseTypeFromURL === "album" ? "Albums" : "Singles"}</Badge>
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
          title="Filter Music"
          content={
            <div className="space-y-6">
              {/* Release Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Type</label>
                <select
                  value={releaseTypeFromURL}
                  onChange={(e) => handleReleaseTypeChange(e.target.value as "album" | "single" | "all")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="album">Albums</option>
                  <option value="single">Singles</option>
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

        <div>
          {(!products?.data || products.data.length === 0) && (
            <div
              className={css({
                textAlign: "center",
                padding: "40px 20px",
                color: themeSettings.colors.text,
                fontSize: "16px",
              })}
            >
              {hasActiveFilters ? "No music found matching your filters" : "No music found"}
            </div>
          )}
        </div>
        <div className="w-full grid grid-cols-1 @md:grid-cols-2 gap-8">
          {products?.data?.map((product) => {
            if (product.category === ProductCategory.Music) {
              return <MusicItem key={product.id} product={product} />;
            }
            return <ProductItem key={product.id} product={product} />;
          })}
        </div>

        {/* Pagination */}
        {products && (
          <Pagination
            currentPage={products.page}
            totalItems={products.total}
            pageSize={products.pageSize}
            onPageChange={handlePageChange}
            themeSettings={themeSettings}
          />
        )}
      </div>
    </div>
  );
};

MusicPageContent.craft = {
  name: "MusicPageContent",
  custom: {
    preventDelete: true,
  },
};
