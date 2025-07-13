"use client";
import { useGetProduct } from "../../hooks/queries/useProducts";
import { useEditorContext } from "../../../components/editor/context";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { Play, Pause, Music, Star } from "lucide-react";
import { alphaToHexCode } from "../../../lib/utils";
import type { EditorTheme, IPublicProductTrack, IPublicProductVariant } from "../../../types";
import { Badge } from "../../../components/ui/badge";
import { css } from "@emotion/css";
import { useState } from "react";
import { EditorModal } from "../../../components/editor/selectors";
import { useCart } from "../../../contexts/CartContext";
import { useForm, Controller } from "react-hook-form";
import { EditorInputWithoutEditor, EditorButtonWithoutEditor } from "../../../components/editor/selectors";

export function MusicDetailsContent() {
  const { currentProductId, themeSettings, profile } = useEditorContext();
  const { data: product, isLoading } = useGetProduct(currentProductId);
  const { pause, loadAndPlay, currentTrack, play, isPlaying } = useAudioPlayer();
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [isSendAsGiftModalOpen, setIsSendAsGiftModalOpen] = useState(false);
  const { addToCart } = useCart();

  if (isLoading || !product) {
    return (
      <div
        className="w-full flex flex-col items-center px-2 @md:px-8 min-h-screen pb-14"
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        <div className="flex items-center justify-center h-64">
          <Music className="w-12 h-12 animate-spin" style={{ color: themeSettings.colors.primary }} />
        </div>
      </div>
    );
  }

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const isSingle = defaultVariant?.tracks?.length === 1;
  const currentTractBelongsToProduct = currentTrack?.productId === product.id;
  const coverImage =
    product.media.find((m) => m.type === "image")?.url || defaultVariant?.media.find((m) => m.type === "image")?.url;

  // Play the first track by default
  const firstTrack = defaultVariant?.tracks?.[0];

  const handlePlayPause = (track: IPublicProductTrack) => {
    if (isPlaying && currentTrack?.id === track.id) {
      return pause();
    }
    if (currentTrack?.id === track.id) {
      return play();
    }
    const audioUrl = track.media.find((m) => m.type === "audio")?.url;
    if (!audioUrl) return;
    loadAndPlay(
      {
        id: track.id,
        title: track.title,
        url: audioUrl,
        coverImage,
        artist: track.artist || profile?.name || "Unknown Artist",
        productId: product.id,
      },
      isSingle
        ? []
        : defaultVariant.tracks.map((t) => ({
            id: t.id,
            title: t.title,
            url: t.media[0]?.url ?? "",
            coverImage,
            artist: t.artist || profile?.name || "Unknown Artist",
            productId: product.id,
          })),
    );
  };

  if (!defaultVariant || !firstTrack) return null;

  return (
    <div
      className="w-full flex flex-col items-center px-2 @md:px-8 min-h-screen pb-10"
      style={{
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
        fontFamily: themeSettings.fontFamily,
      }}
    >
      <div
        className="w-full max-w-4xl mx-auto mt-8"
        style={{
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
          border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        }}
      >
        {/* Header Section */}
        <div className="p-6 border-b" style={{ borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}>
          <div className="flex flex-col @md:flex-row gap-6">
            {/* Album Cover with Play Overlay */}
            <div className="relative">
              <div
                className="w-full aspect-square @md:w-64 @md:h-64 rounded-lg overflow-hidden shadow-lg"
                style={{ borderRadius: `${themeSettings.cornerRadius}px` }}
              >
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={product.title}
                    className="w-full h-full object-cover aspect-square"
                    style={{ borderRadius: themeSettings.cornerRadius }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: themeSettings.colors.primary }}
                  >
                    <Music className="w-16 h-16" style={{ color: themeSettings.colors.textPrimary }} />
                  </div>
                )}
                {/* Play Button Overlay */}
                <button
                  aria-label={isPlaying && currentTractBelongsToProduct ? "Pause" : "Play"}
                  onClick={() => {
                    if (!currentTrack || !currentTractBelongsToProduct || currentTrack?.id === firstTrack.id) {
                      return handlePlayPause(firstTrack as IPublicProductTrack);
                    }
                    return isPlaying ? pause() : play();
                  }}
                  className="absolute left-4 bottom-4 bg-white/80 hover:bg-white/90 text-primary rounded-full p-3  transition-colors cursor-pointer"
                  style={{
                    background: themeSettings.colors.primary,
                    color: themeSettings.colors.textPrimary,
                  }}
                >
                  {isLoading ? (
                    <div
                      className={css({
                        width: "16px",
                        height: "16px",
                        border: `2px solid currentColor`,
                        borderTop: "transparent",
                        borderRadius: "50%",
                        animation: "rotate 1s linear infinite",
                      })}
                    />
                  ) : isPlaying && currentTractBelongsToProduct ? (
                    <Pause size={32} />
                  ) : (
                    <Play size={32} />
                  )}
                </button>
              </div>
            </div>

            {/* Album Info */}
            <div className="flex-1 flex flex-col gap-2">
              <div>
                <h2 className="text-3xl font-bold" style={{ color: themeSettings.colors.text }}>
                  {product.title}
                </h2>
                <h2 className="text-sm font-semibold mt-2" style={{ color: themeSettings.colors.text }}>
                  {profile?.name || "Unknown Artist"}
                </h2>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {isSingle ? (
                  <Badge
                    style={{
                      color: themeSettings.colors.text,
                      borderColor: `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                      backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.1)}`,
                    }}
                    variant="outline"
                  >
                    Single
                  </Badge>
                ) : (
                  <Badge
                    style={{
                      color: themeSettings.colors.text,
                      borderColor: `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                      backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.1)}`,
                    }}
                    variant="outline"
                  >
                    Album: {defaultVariant?.tracks?.length || 0} tracks
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold" style={{ color: themeSettings.colors.text }}>
                  ${defaultVariant?.price.toFixed(2)}
                </span>
                <span
                  onClick={() => {
                    if (defaultVariant.payWhatYouWant) {
                      setIsBuyNowModalOpen(true);
                    } else {
                      addToCart({
                        productId: product.id,
                        productVariantId: defaultVariant.id,
                        title: product.title,
                        price: defaultVariant.price,
                        coverImage,
                        isGift: false,
                        quantity: 1,
                        canIncreaseQuantity: false,
                      });
                    }
                  }}
                  className="cursor-pointer hover:underline"
                  style={{ color: themeSettings.colors.primary }}
                >
                  Buy Now
                </span>
                <span
                  onClick={() => setIsSendAsGiftModalOpen(true)}
                  className="cursor-pointer hover:underline"
                  style={{ color: themeSettings.colors.primary }}
                >
                  Send as gift
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}>
            {product.description}
          </p>
        </div>

        {/* Tracks Section */}
        {!isSingle && (
          <div className="p-6">
            <div className="space-y-2">
              {defaultVariant?.tracks?.map((track) => {
                const audioUrl = track.media.find((m) => m.type === "audio")?.url;

                return (
                  <div
                    key={track.id}
                    className="rounded-lg overflow-hidden border"
                    style={{
                      borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                      borderRadius: `${themeSettings.cornerRadius}px`,
                    }}
                  >
                    <div className="p-4 flex gap-4">
                      {audioUrl && (
                        <TrackAudioPlayer
                          artist={track.artist || profile?.name || "Unknown Artist"}
                          title={track.title || product.title}
                          isPlaying={isPlaying && currentTrack?.id === track.id}
                          onPlayPause={() => handlePlayPause(track)}
                          themeSettings={themeSettings}
                        />
                      )}

                      <div className="flex items-center gap-2">
                        {track.hasExplicitContent && (
                          <span
                            className="text-xs px-1 py-0.5 rounded border"
                            style={{
                              color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}`,
                              borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.3)}`,
                              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
                            }}
                          >
                            E
                          </span>
                        )}
                        {track.isFeatured && (
                          <Star className="w-4 h-4" style={{ color: themeSettings.colors.primary }} />
                        )}
                      </div>
                      {track.description && (
                        <p
                          className="text-sm truncate mt-1"
                          style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}
                        >
                          {track.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {(!defaultVariant?.tracks || defaultVariant.tracks.length === 0) && (
              <div className="text-center py-8" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}>
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: themeSettings.colors.primary }} />
                <p>No tracks available</p>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <p className="text-sm font-bold" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}>
            Credits
          </p>
          <p className="text-sm" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}>
            Very long credits
          </p>
        </div>
      </div>
      <EditorModal
        isOpen={isBuyNowModalOpen}
        onClose={() => setIsBuyNowModalOpen(false)}
        title="Buy Now"
        content={
          <BuyNowModalContent
            variant={defaultVariant}
            coverImage={coverImage || ""}
            onAddToCart={(price) => {
              addToCart({
                productId: product.id,
                productVariantId: defaultVariant.id,
                title: product.title,
                price,
                coverImage,
                isGift: false,
                quantity: 1,
                canIncreaseQuantity: false,
              });
            }}
            onClose={() => setIsBuyNowModalOpen(false)}
          />
        }
      />
      <EditorModal
        isOpen={isSendAsGiftModalOpen}
        onClose={() => setIsSendAsGiftModalOpen(false)}
        title="Send as gift"
        content={
          <GiftModalContent
            variant={defaultVariant}
            coverImage={coverImage || ""}
            onAddToCart={({ price, recipientName, recipientEmail, message }) => {
              addToCart({
                productId: product.id,
                productVariantId: defaultVariant.id,
                title: product.title,
                price,
                coverImage,
                isGift: true,
                recipientName,
                recipientEmail,
                quantity: 1,
                canIncreaseQuantity: false,
                message,
              });
            }}
            onClose={() => setIsSendAsGiftModalOpen(false)}
          />
        }
      />
    </div>
  );
}

function BuyNowModalContent({
  variant,
  onAddToCart,
  onClose,
}: {
  variant: IPublicProductVariant;
  coverImage: string;
  onAddToCart: (price: number) => void;
  onClose: () => void;
}) {
  const methods = useForm<{ price: number }>({
    defaultValues: { price: variant.price },
  });
  const minPrice = variant.price;
  const onSubmit = (data: { price: number }) => {
    onAddToCart(data.price);
    onClose();
  };
  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-2">
      {variant.payWhatYouWant && (
        <div className="flex flex-col gap-2">
          <label className="text-sm">Pay What You Want (min ${minPrice})</label>
          <Controller
            control={methods.control}
            name="price"
            rules={{ required: true, min: minPrice }}
            render={({ field }) => (
              <EditorInputWithoutEditor
                type="number"
                value={field.value !== undefined ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                width="100%"
              />
            )}
          />
          {methods.formState.errors.price && <p className="text-sm text-red-500">Price must be at least ${minPrice}</p>}
        </div>
      )}
      <EditorButtonWithoutEditor text="Add to Cart" type="submit" fullWidth />
    </form>
  );
}

function GiftModalContent({
  variant,
  onAddToCart,
  onClose,
}: {
  variant: IPublicProductVariant;
  coverImage: string;
  onAddToCart: (data: { price: number; recipientName: string; recipientEmail: string; message?: string }) => void;
  onClose: () => void;
}) {
  const methods = useForm<{ price: number; recipientName: string; recipientEmail: string; message?: string }>({
    defaultValues: { price: variant.price, recipientName: "", recipientEmail: "", message: "" },
  });
  const minPrice = variant.price;
  const onSubmit = (data: { price: number; recipientName: string; recipientEmail: string; message?: string }) => {
    onAddToCart(data);
    onClose();
  };
  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-2">
      {variant.payWhatYouWant && (
        <div className="flex flex-col gap-2">
          <label className="text-sm">Pay What You Want (min ${minPrice})</label>
          <Controller
            control={methods.control}
            name="price"
            rules={{ required: true, min: minPrice }}
            render={({ field }) => (
              <EditorInputWithoutEditor
                type="number"
                value={field.value !== undefined ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                width="100%"
              />
            )}
          />
          {methods.formState.errors.price && <p className="text-sm text-red-500">Price must be at least ${minPrice}</p>}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-sm">Recipient Name</label>
        <Controller
          control={methods.control}
          name="recipientName"
          rules={{ required: "Recipient name is required" }}
          render={({ field }) => (
            <EditorInputWithoutEditor
              placeholder="Recipient Name"
              value={(field.value ?? "") as string}
              onChange={field.onChange}
              width="100%"
            />
          )}
        />
        {methods.formState.errors.recipientName && (
          <p className="text-sm text-red-500">{methods.formState.errors.recipientName.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm">Recipient Email</label>
        <Controller
          control={methods.control}
          name="recipientEmail"
          rules={{ required: "Recipient email is required", pattern: { value: /.+@.+\..+/, message: "Invalid email" } }}
          render={({ field }) => (
            <EditorInputWithoutEditor
              placeholder="Recipient Email"
              value={(field.value ?? "") as string}
              onChange={field.onChange}
              width="100%"
              type="email"
            />
          )}
        />
        {methods.formState.errors.recipientEmail && (
          <p className="text-sm text-red-500">{methods.formState.errors.recipientEmail.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm">Message (optional)</label>
        <Controller
          control={methods.control}
          name="message"
          render={({ field }) => (
            <EditorInputWithoutEditor
              placeholder="Message (optional)"
              value={(field.value ?? "") as string}
              onChange={field.onChange}
              width="100%"
            />
          )}
        />
      </div>
      <EditorButtonWithoutEditor text="Add to Cart" type="submit" fullWidth />
    </form>
  );
}

// Track Audio Player Component
const TrackAudioPlayer = ({
  title,
  isPlaying,
  onPlayPause,
  artist,
  themeSettings,
}: {
  title: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  artist: string;
  themeSettings: EditorTheme;
}) => {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPlayPause}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        style={{
          backgroundColor: themeSettings.colors.primary,
          color: themeSettings.colors.textPrimary,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${themeSettings.colors.primary}${alphaToHexCode(0.9)}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = themeSettings.colors.primary;
        }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: themeSettings.colors.text }}>
          {title}
        </p>
        <p className="text-xs mt-1" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}>
          {artist}
        </p>
      </div>
    </div>
  );
};

MusicDetailsContent.craft = {
  name: "MusicDetailsContent",
  custom: {
    preventDelete: true,
  },
};
