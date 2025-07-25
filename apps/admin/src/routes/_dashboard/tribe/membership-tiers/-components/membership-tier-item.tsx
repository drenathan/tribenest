import type { MembershipTier } from "@/types/membership";
import {
  Card,
  CardContent,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tribe-nest/frontend-shared";
import { Check, Plus, MoreVertical, GripVertical, Edit, Archive, RotateCcw } from "lucide-react";

type Props = {
  membershipTier: MembershipTier;
  onAddBenefitClick: VoidFunction;
  onEditClick: VoidFunction;
  onArchiveClick: VoidFunction;
  onUnarchiveClick: VoidFunction;
  onDragStart: (e: React.DragEvent, membershipTier: MembershipTier) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
};

function MembershipTierItem({
  membershipTier,
  onAddBenefitClick,
  onEditClick,
  onArchiveClick,
  onUnarchiveClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: Props) {
  const isArchived = !!membershipTier.archivedAt;

  return (
    <Card
      key={membershipTier.id}
      className={`relative transition-all duration-200 ${isDragging ? "opacity-50 scale-95" : ""} ${isArchived ? "opacity-60" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, membershipTier)}
      onDragEnd={onDragEnd}
    >
      <CardContent className="text-center flex flex-col gap-1">
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditClick}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem onClick={onUnarchiveClick}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onArchiveClick}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="absolute top-2 left-2 cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {isArchived && (
          <div className="absolute top-8 left-2">
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              Archived
            </span>
          </div>
        )}

        <h3 className="text-lg font-bold">{membershipTier.name}</h3>
        {membershipTier.payWhatYouWant ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">Pay What You Want from ${membershipTier.payWhatYouWantMinimum}/Mo</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {membershipTier.priceMonthly ? (
              <span className="text-sm ">${membershipTier.priceMonthly}/Mo</span>
            ) : (
              <span className="text-sm">Free</span>
            )}
            {!!membershipTier.priceYearly && <span className="text-sm">${membershipTier.priceYearly}/Yr</span>}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{membershipTier.description}</p>
        <Separator className="my-4" />

        <div>
          <h1 className="text-left mb-2 flex items-center gap-2">
            Benefits <Plus className="w-4 h-4 text-primary cursor-pointer" onClick={onAddBenefitClick} />
          </h1>
          <ul>
            {membershipTier?.benefits?.map((benefit) => (
              <li key={benefit.id} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {benefit.title}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default MembershipTierItem;
