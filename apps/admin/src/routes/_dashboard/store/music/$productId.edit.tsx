import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useAuth } from "@/hooks/useAuth";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { editProductResolver, type EditProductInput } from "../-components/schema";
import { format } from "date-fns";
import {
  AccordionContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  Button,
  FormCheckbox,
  FormError,
  FormInput,
  Progress,
  type ApiError,
  Input,
  Label,
  Checkbox,
  Badge,
} from "@tribe-nest/frontend-shared";
import { useState, useEffect } from "react";
import { useUpdateProduct } from "@/hooks/mutations/useProduct";
import { useGetProduct } from "@/hooks/queries/useProduct";
import { useUploadFiles } from "@/hooks/useUploadFiles";

export const Route = createFileRoute("/_dashboard/store/music/$productId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const { currentProfileAuthorization } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();
  const { data: product, isLoading: isLoadingProduct } = useGetProduct(
    productId,
    currentProfileAuthorization?.profileId,
  );
  const { uploadFiles, isUploading, progress, totalFiles, filesUploaded } = useUploadFiles();
  const navigate = useNavigate();
  const router = useRouter();

  const defaultVariant = product?.variants.find((v) => v.isDefault) || product?.variants[0];
  const isAlbum = (defaultVariant?.tracks?.length || 0) > 1;

  const methods = useForm<EditProductInput>({
    resolver: editProductResolver,
  });

  // Populate form with existing product data

  const [tags, setTags] = useState<string[]>([]);
  const handleAddTag = () => {
    const newTag = methods.getValues("tagInput");
    if (newTag && !tags?.includes(newTag)) {
      setTags([...tags, newTag]);
      methods.setValue("tagInput", "");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  useEffect(() => {
    if (product) {
      setTags(product.tags || []);
      methods.reset({
        title: product.title,
        description: product.description,
        tags: product.tags,
        artist: product.artist ?? "",
        payWhatYouWant: defaultVariant?.payWhatYouWant || false,
        credits: product?.credits || "",
        upcCode: defaultVariant?.upcCode || "",
        price: defaultVariant?.price,
        publishedAt: product.publishedAt ? format(new Date(product.publishedAt), "yyyy-MM-dd") : "",
        profileId: product.profileId,
        isFeatured: product.isFeatured,
        coverImage: {
          file:
            product.media.find((m) => m.type === "image")?.url ||
            defaultVariant?.media.find((m) => m.type === "image")?.url,
        },
        tracks:
          defaultVariant?.tracks?.map((track) => ({
            title: track.title || "",
            description: track.description || "",
            isFeatured: track.isFeatured || false,
            hasExplicitContent: track.hasExplicitContent || false,
            id: track.id,
            artist: track.artist || "",
            credits: track.credits || "",
            isrcCode: track.isrcCode || "",
          })) || [],
      });
    }
  }, [product, methods, defaultVariant]);

  const { fields } = useFieldArray({
    control: methods.control,
    name: "tracks",
  });

  const tracks = methods.watch("tracks");
  const coverImage = methods.watch("coverImage");

  // Handle featured track logic - ensure only one track is featured
  useEffect(() => {
    if (!tracks) return;
    if (isAlbum && tracks.length > 0) {
      const featuredTracks = tracks.filter((track) => track.isFeatured);
      if (featuredTracks.length > 1) {
        // If multiple tracks are featured, keep only the first one
        const firstFeaturedIndex = tracks.findIndex((track) => track.isFeatured);
        tracks.forEach((_, index) => {
          if (index !== firstFeaturedIndex) {
            methods.setValue(`tracks.${index}.isFeatured`, false);
          }
        });
      }
    }
  }, [tracks, methods, isAlbum]);

  const handleFeaturedChange = (trackIndex: number, isFeatured: boolean) => {
    if (!tracks) return;
    if (isFeatured) {
      // If this track is being set as featured, unfeature all other tracks
      tracks.forEach((_, index) => {
        if (index !== trackIndex) {
          methods.setValue(`tracks.${index}.isFeatured`, false);
        }
      });
    }
    methods.setValue(`tracks.${trackIndex}.isFeatured`, isFeatured);
  };

  const onSubmit = async (data: EditProductInput) => {
    setErrorMessage("");
    try {
      // Handle file uploads for new files only
      const newCoverImageFile = data.coverImage?.file instanceof File ? data.coverImage.file : null;

      let coverImageResult = null;

      if (newCoverImageFile) {
        const filesToUpload = [newCoverImageFile].filter(Boolean);
        const uploadResults = await uploadFiles(filesToUpload as File[]);

        if (newCoverImageFile) {
          coverImageResult = uploadResults[0];
        }
      }

      // Prepare update data
      const updateData = {
        ...data,
        tags,
        coverImage: coverImageResult
          ? {
              file: coverImageResult.url,
              fileSize: coverImageResult.size,
              fileName: coverImageResult.name,
            }
          : undefined,
        tracks: data.tracks?.map((track) => {
          return {
            ...track,
          };
        }),
      };

      await updateProduct({ productId, data: updateData });
      if (router.history.canGoBack()) {
        router.history.back();
      } else {
        navigate({ to: "/store/music" });
      }
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to update product");
      }
      console.error(e);
    }
  };

  // Scroll to top when form submission starts
  useEffect(() => {
    if (isPending || isUploading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPending, isUploading]);

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Product not found</h2>
          <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate({ to: "/store/music" })} className="mt-4">
            Back to Music
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[200px]">
      <PageHeader title={`Edit ${isAlbum ? "Album" : "Single"}`} />

      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-2xl flex flex-col gap-6 mt-2">
        {errorMessage && <FormError message={errorMessage} />}
        {(isUploading || isPending) && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Uploading {filesUploaded} of {totalFiles} files
            </p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <FormInput<EditProductInput>
          name="title"
          label={isAlbum ? "Album Title" : "Single Title"}
          control={methods.control}
          placeholder={isAlbum ? "Enter the album title" : "Enter the single title"}
        />

        <FormInput<EditProductInput>
          name="artist"
          label={`Artist (Default to ${currentProfileAuthorization?.profile.name} if not provided)`}
          control={methods.control}
          placeholder={`Enter the artist name`}
        />

        <FormInput<EditProductInput>
          name="description"
          label={isAlbum ? "Album description" : "Single description"}
          control={methods.control}
          textArea={true}
          placeholder="Enter the description of the product"
        />
        <FormInput<EditProductInput>
          name="tagInput"
          label={"Tag"}
          control={methods.control}
          textArea={true}
          placeholder="Soul RnB"
        />

        <Button type="button" variant={"outline"} onClick={handleAddTag}>
          Enter
        </Button>
        <div className="flex flex-wrap gap-2 ">
          {tags?.map((tag) => (
            <Badge key={tag} variant={"outline"} className="flex items-center gap-2 px-4 py-2">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className=" bg-amber-700 rounded-full text-white px-2 py-1">
                X
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Cover Image</Label>
          <Input
            placeholder="Upload file"
            type="file"
            accept={".jpg,.jpeg,.png"}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                methods.setValue("coverImage.file", e.target.files[0]);
                methods.trigger("coverImage.file");
              }
            }}
          />
          {methods.formState.errors.coverImage?.file && (
            <FormError message={methods.formState.errors.coverImage.file.message ?? ""} />
          )}

          {coverImage?.file && (
            <img
              src={coverImage?.file instanceof File ? URL.createObjectURL(coverImage?.file) : coverImage?.file}
              alt="Cover Image"
              className="w-30 h-30 object-cover"
            />
          )}
        </div>

        <FormInput<EditProductInput>
          name="price"
          label="Price USD (Default to 0 for free music)"
          control={methods.control}
          type="number"
          min={0}
        />

        <FormInput<EditProductInput>
          name="publishedAt"
          label="Release Date (Default to today if not provided)"
          control={methods.control}
          type="date"
          className="max-w-fit"
        />

        {isAlbum && (
          <FormInput<EditProductInput> name="upcCode" label="UPC Code (Optional)" control={methods.control} />
        )}

        <FormInput<EditProductInput>
          name="credits"
          label="Credits (Optional)"
          control={methods.control}
          textArea={true}
          placeholder="Produced by: [Producer Name]"
        />

        <FormCheckbox<EditProductInput>
          name="payWhatYouWant"
          label="Allow users to pay what they want (Minimum is the price set)"
          control={methods.control}
        />

        <FormCheckbox<EditProductInput>
          name="isFeatured"
          label="Feature this product (will be included on the featured music section on your website)"
          control={methods.control}
        />

        {/* Tracks Section */}
        <div className="flex flex-col gap-4">
          <Label className="text-lg font-semibold">{isAlbum ? "Tracks" : "Track"}</Label>

          <Accordion type="multiple" className="space-y-2" defaultValue={fields.length > 0 ? [fields[0].id] : []}>
            {fields.map((track, index) => (
              <TrackItem
                key={track.id}
                track={track}
                index={index}
                tracks={tracks}
                methods={methods}
                handleFeaturedChange={handleFeaturedChange}
                isAlbum={!!isAlbum}
                profileName={product?.artist || ""}
              />
            ))}
          </Accordion>
        </div>

        <Button className="w-fit self-end" type="submit" disabled={isUploading || isPending}>
          Update {isAlbum ? "Album" : "Single"}
        </Button>
      </form>
    </div>
  );
}

// Track Item Component
function TrackItem({
  track,
  index,
  tracks,
  methods,
  handleFeaturedChange,
  isAlbum,
  profileName,
}: {
  track: { id: string };
  index: number;
  tracks: EditProductInput["tracks"];
  methods: UseFormReturn<EditProductInput>;
  handleFeaturedChange: (index: number, isFeatured: boolean) => void;
  isAlbum: boolean;
  profileName: string;
}) {
  return (
    <AccordionItem value={track.id} className="border-b border-border">
      <div className="flex items-center gap-2 p-4">
        {isAlbum && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
          </div>
        )}

        <AccordionTrigger className="flex-1 text-left">
          <div className="flex items-center gap-2">
            {isAlbum ? (
              <span className="font-medium">{tracks?.[index]?.title || `Track ${index + 1}`}</span>
            ) : (
              <span className="font-medium">Track</span>
            )}
            {tracks?.[index]?.isFeatured && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Featured</span>
            )}
          </div>
        </AccordionTrigger>
      </div>

      <AccordionContent className="px-4 pb-4">
        <div className="flex flex-col gap-6">
          {/* Track Title */}
          {isAlbum && (
            <>
              <FormInput<EditProductInput>
                name={`tracks.${index}.title`}
                label="Track Title"
                control={methods.control}
                placeholder={`Enter track ${index + 1} title`}
              />
              <FormInput<EditProductInput>
                name={`tracks.${index}.artist`}
                label={`Artist (Default to ${profileName} if not provided)`}
                control={methods.control}
                placeholder={`Enter track ${index + 1} artist`}
              />
              <FormInput<EditProductInput>
                name={`tracks.${index}.credits`}
                label="Credits (Optional)"
                control={methods.control}
                textArea={true}
                placeholder="Enter the credits"
              />
            </>
          )}

          {/* Featured Track Checkbox (only for albums) */}
          {isAlbum && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`featured-${index}`}
                  checked={tracks?.[index]?.isFeatured || false}
                  onCheckedChange={(e) => handleFeaturedChange(index, e as boolean)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor={`featured-${index}`} className="cursor-pointer">
                  Featured Track
                </Label>
              </div>
            </>
          )}

          <FormInput<EditProductInput>
            name={`tracks.${index}.isrcCode`}
            label="ISRC Code (Optional)"
            control={methods.control}
          />

          {/* Explicit Content Checkbox */}
          <FormCheckbox<EditProductInput>
            name={`tracks.${index}.hasExplicitContent`}
            label="Explicit Content"
            control={methods.control}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
