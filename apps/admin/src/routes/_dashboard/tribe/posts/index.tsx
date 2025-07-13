import { useGetPosts } from "@/hooks/queries/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import PageHeader from "../../-components/layout/page-header";
import { Button } from "@tribe-nest/frontend-shared";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { PostItem } from "./-components/post-item";
import { z } from "zod";

const routeParams = z.object({
  page: z.number().default(1),
  isArchived: z.boolean().default(false),
});

export const Route = createFileRoute("/_dashboard/tribe/posts/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const [page] = useState(1);
  const { data: posts, isLoading } = useGetPosts(currentProfileAuthorization?.profileId, page);

  const isEmpty = !isLoading && !posts?.data?.length;

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Manage your posts and access "
        action={
          !isEmpty && (
            <Button>
              <Link to="/tribe/posts/create">Create New</Link>
            </Button>
          )
        }
      />

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No posts found"
          description="Create your first post to get started"
          action={
            <Button>
              <Link to="/tribe/posts/create">Create New</Link>
            </Button>
          }
        />
      )}

      <div className="flex flex-col items-center mt-8 gap-8">
        {posts?.data?.map((post) => <PostItem key={post.id} post={post} />)}
      </div>
    </div>
  );
}
