import { useAuth } from "@/hooks/useAuth";
import type { IProduct } from "@/types/product";
import { Badge, Card, CardContent, CardHeader, useAudioPlayer } from "@tribe-nest/frontend-shared";
import { Play, Pause, Music, Star } from "lucide-react";

type Props = {
  product: IProduct;
};

export function MusicItem({ product }: Props) {
  const { currentProfileAuthorization } = useAuth();
  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const isSingle = defaultVariant?.tracks?.length === 1;
  const { pause, loadAndPlay, currentTrack, play, isPlaying } = useAudioPlayer();
  const coverImage =
    product.media.find((m) => m.type === "image")?.url || defaultVariant?.media.find((m) => m.type === "image")?.url;

  const handleTrackPlay = (trackId: string, title: string, url: string) => {
    loadAndPlay(
      { id: trackId, title, url, coverImage, artist: currentProfileAuthorization?.profile.name },
      !isSingle
        ? defaultVariant.tracks.map((track) => ({
            id: track.id,
            title: track.title,
            url: track.media[0].url,
            coverImage,
            artist: track.artist || currentProfileAuthorization?.profile.name,
          }))
        : undefined,
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Album Cover */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-lg">
              {coverImage ? (
                <img src={coverImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Music className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
            </div>
          </div>

          {/* Album Info */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="">
              <h2 className="text-3xl font-bold text-foreground ">{product.title}</h2>
            </div>

            <div className="">
              <p className="text-sm leading-relaxed">{product.artist || currentProfileAuthorization?.profile.name}</p>
            </div>
            <div className="mb-4 whitespace-pre-line">
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {isSingle ? (
                  <Badge variant="outline">Single</Badge>
                ) : (
                  <Badge variant="outline">Album: {defaultVariant?.tracks?.length || 0} tracks</Badge>
                )}
              </div>

              {defaultVariant?.payWhatYouWant && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Pay What You Want</Badge>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {defaultVariant?.price === 0 ? "Free" : `$${defaultVariant?.price?.toFixed(2) || "0.00"}`}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Release Date: {product.publishedAt ? new Date(product.publishedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tracks List */}
        <div className="space-y-2">
          {defaultVariant?.tracks?.map((track) => {
            const audioUrl = track.media.find((m) => m.type === "audio")?.url;

            return (
              <div key={track.id} className="border rounded-lg overflow-hidden">
                <div className="p-4 flex gap-4">
                  {audioUrl && (
                    <TrackAudioPlayer
                      artist={track.artist || currentProfileAuthorization?.profile.name || ""}
                      title={track.title || product.title}
                      isPlaying={isPlaying && currentTrack?.id === track.id}
                      onPlayPause={() => {
                        if (isPlaying && currentTrack?.id === track.id) {
                          return pause();
                        }
                        if (currentTrack?.id === track.id) {
                          return play();
                        }
                        handleTrackPlay(track.id, track.title || product.title, audioUrl);
                      }}
                    />
                  )}

                  <div className="flex items-center gap-2">
                    {track.hasExplicitContent && (
                      <span className="text-xs bg-muted px-1 py-0.5 rounded text-muted-foreground border">E</span>
                    )}
                    {track.isFeatured && <Star className="w-4 h-4" />}
                  </div>
                  {track.description && (
                    <p className="text-sm text-muted-foreground truncate mt-1 whitespace-pre-line">
                      {track.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(!defaultVariant?.tracks || defaultVariant.tracks.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tracks available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple Track Play Button Component
const TrackAudioPlayer = ({
  title,
  isPlaying,
  onPlayPause,
  artist,
}: {
  title: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  artist: string;
}) => {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPlayPause}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{artist}</p>
      </div>
    </div>
  );
};
