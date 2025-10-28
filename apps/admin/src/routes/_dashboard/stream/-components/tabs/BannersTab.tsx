import type { IBanner, ITicker } from "@/types/event";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  cn,
} from "@tribe-nest/frontend-shared";
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useParticipantStore } from "../store";

function BannersTab() {
  const { localTemplate, setLocalTemplate } = useParticipantStore();

  // Dialog states
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [tickerDialogOpen, setTickerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<IBanner | null>(null);
  const [editingTicker, setEditingTicker] = useState<ITicker | null>(null);

  // Form states
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [tickerTitle, setTickerTitle] = useState("");

  if (!localTemplate) return null;
  const selectedSceneId = localTemplate.config.selectedSceneId || localTemplate.scenes[0].id;
  const selectedScene = localTemplate.scenes.find((scene) => scene.id === selectedSceneId);

  const handleCreateBanner = () => {
    setEditingBanner(null);
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerDialogOpen(true);
  };

  const handleEditBanner = (banner: IBanner) => {
    setEditingBanner(banner);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle);
    setBannerDialogOpen(true);
  };

  const handleSaveBanner = () => {
    if (!bannerTitle.trim()) return;

    if (editingBanner) {
      setLocalTemplate({
        ...localTemplate,
        config: {
          ...localTemplate.config,
          banners: localTemplate.config.banners.map((banner) =>
            banner.id === editingBanner.id ? { ...banner, title: bannerTitle, subtitle: bannerSubtitle } : banner,
          ),
        },
      });
    } else {
      const newBanner: IBanner = {
        id: Date.now().toString(),
        title: bannerTitle,
        subtitle: bannerSubtitle,
      };
      setLocalTemplate({
        ...localTemplate,
        config: {
          ...localTemplate.config,
          banners: [...localTemplate.config.banners, newBanner],
        },
      });
    }

    setBannerDialogOpen(false);
    setEditingBanner(null);
    setBannerTitle("");
    setBannerSubtitle("");
  };

  const handleDeleteBanner = (bannerId: string) => {
    setLocalTemplate({
      ...localTemplate,
      config: {
        ...localTemplate.config,
        banners: localTemplate.config.banners.filter((banner) => banner.id !== bannerId),
      },
    });
  };

  const handleCreateTicker = () => {
    setEditingTicker(null);
    setTickerTitle("");
    setTickerDialogOpen(true);
  };

  const handleEditTicker = (ticker: ITicker) => {
    setEditingTicker(ticker);
    setTickerTitle(ticker.title);
    setTickerDialogOpen(true);
  };

  const handleSaveTicker = () => {
    if (!tickerTitle.trim()) return;

    if (editingTicker) {
      setLocalTemplate({
        ...localTemplate,
        config: {
          ...localTemplate.config,
          tickers: localTemplate.config.tickers.map((ticker) =>
            ticker.id === editingTicker.id ? { ...ticker, title: tickerTitle } : ticker,
          ),
        },
      });
    } else {
      const newTicker: ITicker = {
        id: Date.now().toString(),
        title: tickerTitle,
      };
      setLocalTemplate({
        ...localTemplate,
        config: {
          ...localTemplate.config,
          tickers: [...localTemplate.config.tickers, newTicker],
        },
      });
    }

    setTickerDialogOpen(false);
    setEditingTicker(null);
    setTickerTitle("");
  };

  const handleDeleteTicker = (tickerId: string) => {
    setLocalTemplate({
      ...localTemplate,
      config: {
        ...localTemplate.config,
        tickers: localTemplate.config.tickers.filter((ticker) => ticker.id !== tickerId),
      },
    });
  };

  const handleChangeBanner = (banner: IBanner) => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, currentBannerId: banner.id } : scene,
        ),
      });
    }
  };

  const handleRemoveBanner = () => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, currentBannerId: undefined } : scene,
        ),
      });
    }
  };

  const handleChangeTicker = (ticker: ITicker) => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, currentTickerId: ticker.id } : scene,
        ),
      });
    }
  };

  const handleRemoveTicker = () => {
    if (selectedScene) {
      setLocalTemplate({
        ...localTemplate,
        scenes: localTemplate.scenes.map((scene) =>
          scene.id === selectedSceneId ? { ...scene, currentTickerId: undefined } : scene,
        ),
      });
    }
  };

  return (
    <div className="space-y-10">
      {/* Banners Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="font-medium">Banners</p>
          <Button variant="outline" onClick={handleCreateBanner}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {localTemplate.config.banners.length > 0 ? (
          <div className="space-y-2">
            {localTemplate.config.banners.map((banner) => {
              const isSelected = selectedScene?.currentBannerId === banner.id;
              return (
                <div
                  key={banner.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg cursor-pointer",
                    isSelected && "border-primary",
                  )}
                  onClick={() => (isSelected ? handleRemoveBanner() : handleChangeBanner(banner))}
                >
                  <div>
                    <p className="font-medium">{banner.title}</p>
                    <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditBanner(banner)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBanner(banner.id)}
                      disabled={isSelected}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No banners created yet</p>
        )}
      </div>

      {/* Tickers Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="font-medium">Tickers</p>
          <Button variant="outline" onClick={handleCreateTicker}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {localTemplate.config.tickers.length > 0 ? (
          <div className="space-y-2">
            {localTemplate.config.tickers.map((ticker) => {
              const isSelected = selectedScene?.currentTickerId === ticker.id;
              return (
                <div
                  key={ticker.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg cursor-pointer",
                    isSelected && "border-primary",
                  )}
                  onClick={() => (isSelected ? handleRemoveTicker() : handleChangeTicker(ticker))}
                >
                  <div>
                    <p className="font-medium">{ticker.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditTicker(ticker)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTicker(ticker.id)}
                      disabled={isSelected}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No tickers created yet</p>
        )}
      </div>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Create Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Title</Label>
              <Input
                id="banner-title"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Enter banner title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-subtitle">Subtitle</Label>
              <Textarea
                id="banner-subtitle"
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                placeholder="Enter banner subtitle"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBannerDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBanner} disabled={!bannerTitle.trim()}>
                {editingBanner ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticker Dialog */}
      <Dialog open={tickerDialogOpen} onOpenChange={setTickerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTicker ? "Edit Ticker" : "Create Ticker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker-title">Title</Label>
              <Input
                id="ticker-title"
                value={tickerTitle}
                onChange={(e) => setTickerTitle(e.target.value)}
                placeholder="Enter ticker title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTickerDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTicker} disabled={!tickerTitle.trim()}>
                {editingTicker ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BannersTab;
