import { useEditorContext } from "../../context";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Edit, Trash2, Plus, X, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Instagram, Facebook, Twitter, Youtube, Globe } from "lucide-react";

interface SocialLink {
  href: string;
  icon: string;
}

const socialIcons = {
  instagram: { icon: Instagram, label: "Instagram" },
  facebook: { icon: Facebook, label: "Facebook" },
  twitter: { icon: Twitter, label: "Twitter" },
  youtube: { icon: Youtube, label: "YouTube" },
  website: { icon: Globe, label: "Website" },
};

const SortableSocialItem = ({
  link,
  index,
  onEdit,
  onRemove,
}: {
  link: SocialLink;
  index: number;
  onEdit: (link: SocialLink, index: number) => void;
  onRemove: (index: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: index.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = socialIcons[link.icon as keyof typeof socialIcons]?.icon || Globe;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-lg bg-background"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="flex gap-1 ml-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(link, index)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const SocialIconsSettings = () => {
  const { themeSettings, setThemeSettings } = useEditorContext();
  const [newLink, setNewLink] = useState<SocialLink>({ href: "", icon: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingHref, setEditingHref] = useState("");
  const [currentLink, setCurrentLink] = useState<SocialLink>();
  const [currentLinkHref, setCurrentLinkHref] = useState("");

  // useEffect(() => {
  //   if (currentLink) {
  //     setCurrentLinkHref(currentLink.href);
  //   }
  // }, [currentLink]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddLink = () => {
    if (!newLink.href.trim()) return;

    const updatedLinks = [...themeSettings.socialLinks, { ...newLink }];
    setThemeSettings({
      ...themeSettings,
      socialLinks: updatedLinks,
    });

    setNewLink({ href: "", icon: "instagram" });
    setShowForm(false);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = themeSettings.socialLinks.filter((_, i) => i !== index);
    setThemeSettings({
      ...themeSettings,
      socialLinks: updatedLinks,
    });
  };

  const handleEditLink = (link: SocialLink, index: number) => {
    setCurrentLink(link);
    setCurrentLinkHref(link.href);
    setShowForm(true);
  };

  const handleUpdateHref = () => {
    if (!currentLinkHref.trim() || !currentLink) return;

    setThemeSettings({
      ...themeSettings,
      socialLinks: themeSettings.socialLinks.map((link) =>
        link.icon === currentLink.icon ? { ...link, href: currentLinkHref.trim() } : link,
      ),
    });

    setCurrentLink(null);
    setCurrentLinkHref("");
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setCurrentLink(null);
    setCurrentLinkHref("");
    setShowForm(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over?.id as string);

      const updatedLinks = arrayMove(themeSettings.socialLinks, oldIndex, newIndex);
      setThemeSettings({
        ...themeSettings,
        socialLinks: updatedLinks,
      });
    }
  };
  const IconComponent = socialIcons[currentLink?.icon as keyof typeof socialIcons]?.icon || Globe;

  const remainingLinks = useMemo(() => {
    return Object.entries(socialIcons).filter(([key]) => !themeSettings.socialLinks.some((l) => l.icon === key));
  }, [themeSettings.socialLinks]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground px-2">Add social media links to your website.</div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Social Links</CardTitle>
          {!showForm && remainingLinks.length > 0 && (
            <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add/Edit Link Form */}
          {showForm && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{editingIndex !== null ? "Edit" : "Add New Social Link"}</Label>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {currentLink ? (
                // Edit form - only URL
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <Label className="text-sm font-medium">URL</Label>
                  </div>
                  <Input
                    placeholder="https://example.com"
                    value={currentLinkHref}
                    onChange={(e) => setCurrentLinkHref(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateHref} disabled={!currentLinkHref?.trim()} size="sm">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // Add form - full form
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Platform</Label>
                    <Select value={newLink.icon} onValueChange={(value) => setNewLink({ ...newLink, icon: value })}>
                      <SelectTrigger className="min-w-30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {remainingLinks.map(([key, { icon: IconComponent, label }]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={newLink.href}
                      onChange={(e) => setNewLink({ ...newLink, href: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleAddLink} disabled={!newLink.href.trim()} size="sm">
                    Add Link
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Existing Links List */}
          <div className="space-y-2">
            {themeSettings.socialLinks.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                No social links added yet
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={themeSettings.socialLinks.map((_, index) => index.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {themeSettings.socialLinks.map((link, index) => (
                      <SortableSocialItem
                        key={index}
                        link={link}
                        index={index}
                        onEdit={handleEditLink}
                        onRemove={handleRemoveLink}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
