import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { updatePostResolver, type UpdatePostInput } from "./-components/schema";
import { useForm } from "react-hook-form";

import { useUpdatePost } from "@/hooks/mutations/usePost";
import { Button, FormError, FormInput, FormMultiSelect, type ApiError } from "@tribe-nest/frontend-shared";
import PageHeader from "../../-components/layout/page-header";
import Spacer from "@/components/spacer";
import { useMembershipTiers } from "@/hooks/queries/useMembershipTiers";
import { useGetPost } from "@/hooks/queries/usePosts";
import Loading from "@/components/loading";

export const Route = createFileRoute("/_dashboard/tribe/posts/$postId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: updatePost, isPending } = useUpdatePost();
  const { postId } = Route.useParams();
  const router = useRouter();
  const { currentProfileAuthorization } = useAuth();
  const { data: post, isLoading: isPostLoading } = useGetPost(postId, currentProfileAuthorization?.profileId);
  const { data: membershipTiers } = useMembershipTiers(currentProfileAuthorization?.profile.id);

  const methods = useForm<UpdatePostInput>({
    resolver: updatePostResolver,
    defaultValues: {
      caption: "",
      membershipTiers: [],
    },
  });

  useEffect(() => {
    if (post) {
      methods.setValue("caption", post.caption);
      methods.setValue("membershipTiers", post.membershipTiers);
    }
  }, [post, methods]);

  const onSubmit = async (data: UpdatePostInput) => {
    setErrorMessage("");

    try {
      await updatePost({ ...data, postId, profileId: currentProfileAuthorization?.profileId });
      router.history.back();
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to create post");
      }
      console.error(e);
    }
  };

  if (isPostLoading || !post || !membershipTiers || !currentProfileAuthorization) {
    return <Loading />;
  }

  return (
    <div>
      <PageHeader title="Edit Post" />
      <Spacer height={4} />

      {errorMessage && <FormError message={errorMessage} />}

      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-2xl flex flex-col gap-6 mt-2">
        <FormInput<UpdatePostInput>
          name="caption"
          label="Caption"
          control={methods.control}
          textArea={true}
          placeholder="Enter the caption of the post"
        />

        {!!membershipTiers.length && (
          <FormMultiSelect<UpdatePostInput>
            name="membershipTiers"
            label="Membership Access (Leave blank for public access)"
            control={methods.control}
            defaultValue={post.membershipTiers}
            choices={membershipTiers?.map((tier) => ({ label: tier.name, value: tier.id })) ?? []}
            placeholder="Select membership tiers"
          />
        )}

        <Button className="w-fit self-end" type="submit" disabled={isPending}>
          Update Post
        </Button>
      </form>
    </div>
  );
}
