import type { MembershipTier } from "@/types/membership";
import { Card, CardContent, Separator } from "@tribe-nest/frontend-shared";
import { Check, Plus, SquarePen, GripVertical } from "lucide-react";

type Props = {
  membershipTier: MembershipTier;
  onAddBenefitClick: VoidFunction;
};

function MembershipTierItem({ membershipTier, onAddBenefitClick }: Props) {
  return (
    <Card key={membershipTier.id} className="relative">
      <CardContent className="text-center flex flex-col gap-1">
        <SquarePen className="w-4 h-4 text-muted-foreground cursor-pointer absolute top-2 right-2" onClick={() => {}} />
        <GripVertical
          className="w-4 h-4 text-muted-foreground cursor-pointer absolute top-2 left-2"
          onClick={() => {}}
        />
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
