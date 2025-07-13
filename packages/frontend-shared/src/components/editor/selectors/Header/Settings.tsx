import { useEditorContext } from "../../context";
import { useState } from "react";
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

interface HeaderLink {
  href: string;
  label: string;
}

const SortableLinkItem = ({
  link,
  index,
  onEdit,
  onRemove,
}: {
  link: HeaderLink;
  index: number;
  onEdit: (link: HeaderLink, index: number) => void;
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
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{link.label}</div>
          <div className="text-xs text-muted-foreground truncate">{link.href}</div>
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

export const PageHeaderSettings = () => {
  const { themeSettings, setThemeSettings, pages } = useEditorContext();
  const [newLink, setNewLink] = useState<HeaderLink>({ href: "", label: "" });
  const [showForm, setShowForm] = useState(false);
  const [linkType, setLinkType] = useState<"internal" | "external">("internal");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const internalPages = pages;

  const handleAddLink = () => {
    if (!newLink.label.trim() || !newLink.href.trim()) return;

    const updatedLinks = [...themeSettings.headerLinks, { ...newLink }];
    setThemeSettings({
      ...themeSettings,
      headerLinks: updatedLinks,
    });

    setNewLink({ href: "", label: "" });
    setShowForm(false);
    setLinkType("internal");
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = themeSettings.headerLinks.filter((_, i) => i !== index);
    setThemeSettings({
      ...themeSettings,
      headerLinks: updatedLinks,
    });
  };

  const handleEditLink = (link: HeaderLink, index: number) => {
    setEditingLabel(link.label);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleUpdateLabel = () => {
    if (!editingLabel) return;
    if (!editingLabel.trim() || editingIndex === null) return;

    const updatedLinks = [...themeSettings.headerLinks];
    if (!updatedLinks[editingIndex]) return;

    updatedLinks[editingIndex] = { ...updatedLinks[editingIndex], label: editingLabel.trim() };
    setThemeSettings({
      ...themeSettings,
      headerLinks: updatedLinks,
    });

    setEditingLabel("");
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingLabel("");
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over?.id as string);

      const updatedLinks = arrayMove(themeSettings.headerLinks, oldIndex, newIndex);
      setThemeSettings({
        ...themeSettings,
        headerLinks: updatedLinks,
      });
    }
  };

  const handleInternalPageSelect = (href: string) => {
    const page = internalPages.find((p) => p.pathname === href);
    if (page) {
      setNewLink({ href: page.pathname, label: page.title });
    }
  };

  const handleLinkTypeChange = (type: "internal" | "external") => {
    setLinkType(type);
    setNewLink({ href: "", label: "" });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground px-2">This settings applies to all pages.</div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Header Links</CardTitle>
          {!showForm && (
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
                <Label className="text-sm font-medium">
                  {editingIndex !== null ? "Edit Link Name" : "Add New Link"}
                </Label>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {editingIndex !== null ? (
                // Edit form - only label
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name</Label>
                  <Input
                    placeholder="Enter link name"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateLabel} disabled={!editingLabel.trim()} size="sm">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // Add form - full form
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Type</Label>
                    <Select value={linkType} onValueChange={handleLinkTypeChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {linkType === "internal" ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Page</Label>
                      <Select onValueChange={handleInternalPageSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a page" />
                        </SelectTrigger>
                        <SelectContent>
                          {internalPages
                            .filter(
                              (page) =>
                                page.pathname !== "/" ||
                                !themeSettings.headerLinks.some((link) => link.href === page.pathname),
                            )
                            .map((page) => (
                              <SelectItem key={page.pathname} value={page.pathname}>
                                {page.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">URL</Label>
                      <Input
                        placeholder="https://example.com"
                        value={newLink.href}
                        onChange={(e) => setNewLink({ ...newLink, href: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Label</Label>
                    <Input
                      placeholder="Enter link label"
                      value={newLink.label}
                      onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleAddLink} disabled={!newLink.label.trim() || !newLink.href.trim()} size="sm">
                    Add Link
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Existing Links List */}
          <div className="space-y-2">
            {themeSettings.headerLinks.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                No header links added yet
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={themeSettings.headerLinks.map((_, index) => index.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {themeSettings.headerLinks.map((link, index) => (
                      <SortableLinkItem
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
