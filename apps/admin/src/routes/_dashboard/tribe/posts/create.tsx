import { useAuth } from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPostResolver, type CreatePostInput } from "./-components/schema";
import { useForm } from "react-hook-form";
import { useCreatePost } from "@/hooks/mutations/usePost";
import {
  Button,
  FormError,
  FormInput,
  FormMultiSelect,
  FormSelect,
  Input,
  Label,
  Progress,
  type ApiError,
  type PostType,
} from "@tribe-nest/frontend-shared";
import PageHeader from "../../-components/layout/page-header";
import Spacer from "@/components/spacer";
import { useMembershipTiers } from "@/hooks/queries/useMembershipTiers";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import { FileAudioPlayer } from "../../-components/FileAudioPlayer";

export const Route = createFileRoute("/_dashboard/tribe/posts/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const { currentProfileAuthorization } = useAuth();
  const navigate = Route.useNavigate();
  const [file, setFile] = useState<File>();
  const { data: membershipTiers } = useMembershipTiers(currentProfileAuthorization?.profile.id);
  const { uploadFiles, isUploading, progress } = useUploadFiles();

  const methods = useForm<CreatePostInput>({
    resolver: createPostResolver,
    defaultValues: {
      type: "" as PostType,
      caption: "",
      mediaLink: "",
      membershipTiers: [],
    },
  });
  const type = methods.watch("type");

  useEffect(() => {
    if (type) {
      setFile(undefined);
    }
  }, [type]);

  const onSubmit = async (data: CreatePostInput) => {
    setErrorMessage("");
    if (!file) {
      setErrorMessage("Please upload a media file");
      return;
    }

    try {
      const [fileResult] = await uploadFiles([file]);
      await createPost({
        ...data,
        mediaLink: fileResult.url,
        mediaSize: fileResult.size,
        profileId: currentProfileAuthorization?.profileId,
      });
      navigate({ to: "/tribe/posts" });
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

  const mediaLabel = !type
    ? "Upload media"
    : type === "image"
      ? "Upload Image"
      : type === "video"
        ? "Upload Video"
        : "Upload Audio";

  return (
    <div className="pb-10">
      <PageHeader title="Create Post" />
      {isUploading && <Progress value={progress} className="w-full" />}
      <Spacer height={4} />

      {errorMessage && <FormError message={errorMessage} />}

      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-2xl flex flex-col gap-6 mt-2">
        <FormSelect<CreatePostInput>
          name="type"
          label="PostType"
          control={methods.control}
          choices={[
            { label: "Image", value: "image" },
            { label: "Video", value: "video" },
            { label: "Audio", value: "audio" },
          ]}
          placeholder="Select the type of post"
        />
        <FormInput<CreatePostInput>
          name="caption"
          label="Caption"
          control={methods.control}
          textArea={true}
          placeholder="Enter the caption of the post"
        />
        <FormMultiSelect<CreatePostInput>
          name="membershipTiers"
          label="Membership Access (Leave blank for public access)"
          control={methods.control}
          choices={membershipTiers?.map((tier) => ({ label: tier.name, value: tier.id })) ?? []}
          placeholder="Select membership tiers"
        />
        <div className="flex flex-col gap-2">
          <Label>{mediaLabel}</Label>
          <Input
            disabled={!type}
            placeholder="Upload media"
            type="file"
            accept={type === "image" ? ".jpg,.jpeg,.png" : type === "video" ? ".mp4,.mov" : ".mp3,.wav"}
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          {file && type === "image" && (
            <img className="w-20 h-20 object-contain" src={URL.createObjectURL(file)} alt="Uploaded image" />
          )}
          {file && type === "video" && (
            <video controls className="w-[200px] h-[300px] object-cover" src={URL.createObjectURL(file)} />
          )}
          {file && type === "audio" && <FileAudioPlayer file={file} />}
        </div>

        <Button className="w-fit self-end" type="submit" disabled={isPending || isUploading}>
          Create Post
        </Button>
      </form>
    </div>
  );
}
