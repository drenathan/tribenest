import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Spacer from "@/components/spacer";
import { useForm } from "react-hook-form";
import { createMembershipTierResolver, type CreateMembershipTierInput } from "./-components/schema";
import {
  Button,
  FormError,
  FormInput,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useMembershipTier } from "@/hooks/mutations/useMembershipTier";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_dashboard/tribe/membership-tiers/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutateAsync: createMembershipTier, isPending } = useMembershipTier();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { currentProfileAuthorization } = useAuth();

  const navigate = Route.useNavigate();
  const methods = useForm<CreateMembershipTierInput>({
    resolver: createMembershipTierResolver,
    defaultValues: {
      name: "",
      description: "",
      payWhatYouWant: false,
      payWhatYouWantMinimum: "",
      payWhatYouWantMaximum: "",
      priceMonthly: "",
      priceYearly: "",
    },
  });

  console.log(methods.formState.errors);

  const onSubmit = async (data: CreateMembershipTierInput) => {
    try {
      await createMembershipTier({ ...data, profileId: currentProfileAuthorization?.profileId });
      navigate({ to: "/tribe/membership-tiers" });
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      }
    }
  };

  return (
    <div>
      <PageHeader title="Create a new Membership Tier" />
      <Spacer height={16} />

      {errorMessage && <FormError message={errorMessage} />}

      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-2xl flex flex-col gap-6 mt-2">
        <FormInput<CreateMembershipTierInput>
          name="name"
          label="Tier Name"
          control={methods.control}
          placeholder="Enter the name of the membership tier"
        />

        <FormInput<CreateMembershipTierInput>
          name="description"
          label="Description"
          control={methods.control}
          textArea={true}
          placeholder="Enter the description of the membership tier"
        />

        <Tabs
          defaultValue="no"
          className="w-full"
          onValueChange={(value) => {
            methods.setValue("payWhatYouWant", value === "yes");
          }}
        >
          <TabsList className="grid w-full grid-cols-2 my-6">
            <TabsTrigger value="no">Custom Pricing</TabsTrigger>
            <TabsTrigger value="yes">Pay what you want</TabsTrigger>
          </TabsList>
          <TabsContent value="no" className="flex flex-col gap-6">
            <FormInput<CreateMembershipTierInput>
              name="priceMonthly"
              label="Price Monthly (USD)"
              control={methods.control}
              placeholder="Price per month"
              type="number"
            />

            <FormInput<CreateMembershipTierInput>
              name="priceYearly"
              label="Price Yearly (USD)"
              control={methods.control}
              placeholder="Price per year (optional)"
              type="number"
            />
          </TabsContent>
          <TabsContent value="yes">
            <FormInput<CreateMembershipTierInput>
              name="payWhatYouWantMinimum"
              label="Minimum (USD)"
              control={methods.control}
              placeholder="Minimum"
              type="number"
            />
          </TabsContent>
        </Tabs>

        <Spacer height={8} />
        <Button className="w-fit" type="submit" disabled={isPending}>
          Create Membership Tier
        </Button>
      </form>
    </div>
  );
}
