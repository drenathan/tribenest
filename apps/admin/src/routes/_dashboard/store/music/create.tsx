import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import PageHeader from "../../-components/layout/page-header";
import { useAuth } from "@/hooks/useAuth";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { createProductResolver, type CreateProductInput } from "./-components/schema";
import { ProductCategory, ProductDeliveryType } from "@/types/product";
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
} from "@tribe-nest/frontend-shared";
import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { FileAudioPlayer } from "../../-components/FileAudioPlayer";
import { useCreateProduct } from "@/hooks/mutations/useProduct";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const schema = z.object({
  type: z.enum(["album", "single"]).default("single"),
});

export const Route = createFileRoute("/_dashboard/store/music/create")({
  component: RouteComponent,
  validateSearch: schema,
});

// Sortable Track Item Component
function SortableTrackItem({
  track,
  index,
  type,
  fields,
  tracks,
  methods,
  removeTrack,
  handleFeaturedChange,
  isAlbum,
}: {
  track: { id: string };
  index: number;
  type: string;
  fields: { id: string }[];
  tracks: CreateProductInput["tracks"];
  methods: UseFormReturn<CreateProductInput>;
  removeTrack: (index: number) => void;
  handleFeaturedChange: (index: number, isFeatured: boolean) => void;
  isAlbum: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={track.id} className="border-b border-border">
        <div className="flex items-center gap-2 p-4">
          {type === "album" && (
            <div {...attributes} {...listeners} className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
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

          {type === "album" && fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTrack(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <AccordionContent className="px-4 pb-4">
          <div className="flex flex-col gap-6">
            {/* Track Title */}
            {isAlbum && (
              <FormInput<CreateProductInput>
                name={`tracks.${index}.title`}
                label="Track Title"
                control={methods.control}
                placeholder={`Enter track ${index + 1} title`}
              />
            )}

            {/* Audio File Upload */}
            <div className="flex flex-col gap-2">
              <Label>Audio File</Label>
              <Input
                placeholder="Upload file"
                type="file"
                accept={".flac,.wav,.aiff"}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    methods.setValue(`tracks.${index}.file`, e.target.files[0]);
                    methods.trigger(`tracks.${index}.file`);
                  }
                }}
              />
              {methods.formState?.errors?.tracks?.[index]?.file && (
                <FormError message={methods.formState.errors.tracks[index]?.file?.message ?? ""} />
              )}

              {tracks && tracks[index]?.file && <FileAudioPlayer file={tracks[index].file as File} />}
            </div>

            {/* Featured Track Checkbox (only for albums) */}
            {type === "album" && (
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
            )}

            {/* Explicit Content Checkbox */}
            <FormCheckbox<CreateProductInput>
              name={`tracks.${index}.hasExplicitContent`}
              label="Explicit Content"
              control={methods.control}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

function RouteComponent() {
  const { type } = Route.useSearch();
  const { currentProfileAuthorization } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { uploadFiles, isUploading, progress, totalFiles, filesUploaded } = useUploadFiles();
  const navigate = useNavigate();
  const isAlbum = type === "album";

  const methods = useForm<CreateProductInput>({
    resolver: createProductResolver,
    defaultValues: {
      title: "",
      description: "",
      deliveryType: ProductDeliveryType.Digital,
      price: 0,
      category: ProductCategory.Music,
      coverImage: undefined,
      coverImageSize: 0,
      tracks: [
        {
          file: "" as string | File,
          fileSize: 0,
          title: "",
          description: "",
          isFeatured: false,
          hasExplicitContent: false,
          id: uuid(),
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: methods.control,
    name: "tracks",
  });

  const tracks = methods.watch("tracks");
  const coverImage = methods.watch("coverImage");

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle featured track logic - ensure only one track is featured
  useEffect(() => {
    if (!tracks) return;
    if (type === "album" && tracks.length > 0) {
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
  }, [tracks, type, methods]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over?.id);

      move(oldIndex, newIndex);
    }
  };

  const addTrack = () => {
    append({
      file: "" as string | File,
      fileSize: 0,
      title: "",
      description: "",
      isFeatured: false,
      hasExplicitContent: false,
      id: uuid(),
    });
  };

  const removeTrack = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: CreateProductInput) => {
    setErrorMessage("");

    try {
      const coverImageFile = data.coverImage as File;
      const audioFiles = data.tracks?.map((track) => track.file as File).filter(Boolean) || [];
      const [coverImageResult, ...audioResults] = await uploadFiles([coverImageFile, ...audioFiles]);

      // Create product with uploaded files
      await createProduct({
        ...data,
        coverImage: coverImageResult.url,
        coverImageSize: coverImageResult.size,
        profileId: currentProfileAuthorization?.profileId,
        tracks: data.tracks?.map((track, index) => ({
          ...track,
          file: audioResults[index]?.url || "",
          fileSize: audioResults[index]?.size || 0,
        })),
      });
      navigate({ to: "/store/music" });
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(isAlbum ? "Failed to create album" : "Failed to create single");
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

  return (
    <div className="pb-[200px]">
      <PageHeader title={type === "album" ? "Create Album" : "Create Single"} />

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

        <FormInput<CreateProductInput>
          name="title"
          label={type === "album" ? "Album Title" : "Single Title"}
          control={methods.control}
          placeholder={type === "album" ? "Enter the album title" : "Enter the single title"}
        />
        <FormInput<CreateProductInput>
          name="description"
          label={type === "album" ? "Album description" : "Single description"}
          control={methods.control}
          textArea={true}
          placeholder="Enter the description of the product"
        />
        <div className="flex flex-col gap-2">
          <Label>Cover Image</Label>
          <Input
            disabled={!type}
            placeholder="Upload file"
            type="file"
            accept={".jpg,.jpeg,.png"}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                methods.setValue("coverImage", e.target.files[0]);
                methods.trigger("coverImage");
              }
            }}
          />
          {methods.formState.errors.coverImage && (
            <FormError message={methods.formState.errors.coverImage.message ?? ""} />
          )}

          {coverImage && (
            <img src={URL.createObjectURL(coverImage as File)} alt="Cover Image" className="w-30 h-30 object-cover" />
          )}
        </div>
        <FormInput<CreateProductInput>
          name="price"
          label="Price (USD) greater than 0"
          control={methods.control}
          type="number"
        />

        {/* Tracks Section */}
        <div className="flex flex-col gap-4">
          {isAlbum && (
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">{isAlbum ? "Tracks" : "Track"}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTrack} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Track
              </Button>
            </div>
          )}

          {isAlbum ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                <Accordion type="multiple" className="space-y-2" defaultValue={fields.length > 0 ? [fields[0].id] : []}>
                  {fields.map((track, index) => (
                    <SortableTrackItem
                      key={track.id}
                      track={track}
                      index={index}
                      type={type}
                      fields={fields}
                      tracks={tracks}
                      methods={methods}
                      removeTrack={removeTrack}
                      handleFeaturedChange={handleFeaturedChange}
                      isAlbum={isAlbum}
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>
          ) : (
            <Accordion type="multiple" className="space-y-2" defaultValue={fields.length > 0 ? [fields[0].id] : []}>
              {fields.map((track, index) => (
                <SortableTrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  type={type}
                  fields={fields}
                  tracks={tracks}
                  methods={methods}
                  removeTrack={removeTrack}
                  handleFeaturedChange={handleFeaturedChange}
                  isAlbum={isAlbum}
                />
              ))}
            </Accordion>
          )}
        </div>

        <Button className="w-fit self-end" type="submit" disabled={isUploading || isPending}>
          Create {type === "album" ? "Album" : "Single"}
        </Button>
      </form>
    </div>
  );
}
