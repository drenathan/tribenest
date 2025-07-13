"use client";
import { type UserComponent } from "@craftjs/core";
import { EditorText, EditorInput, EditorIcon, EditorModal } from "../../../components/editor/selectors";
import { alphaToHexCode } from "../../../lib/utils";
import { useState } from "react";
import { useEditorContext } from "../../../components/editor/context";
import { css } from "@emotion/css";
import { useGetPosts } from "../../hooks/queries/usePosts";
import { PostItem } from "./PostItem";

export const PostsPage: UserComponent = () => {
  const { themeSettings } = useEditorContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: posts } = useGetPosts();

  return (
    <div className="w-full flex flex-col items-center  px-2 @md:px-8 min-h-screen pb-10">
      <div className="max-w-[1100px] w-full">
        <div className="w-full @md:w-3/5 flex flex-col gap-4 mt-6 @md:mt-8">
          <EditorText text="Posts" fontSize="24" fontSizeMobile="18" fontWeight="bold" />
          <div className="w-full flex gap-4 items-center">
            <EditorInput placeholder="Search posts..." width="90%" widthMobile="100%" />
            <button
              className={css({
                border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.65)}`,
                borderRadius: "10px",
                padding: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                  borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
                },
              })}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <EditorIcon icon="list-filter" />
            </button>
          </div>
          <EditorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Filter Posts"
            content={<div>Modal</div>}
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
              No posts found
            </div>
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
