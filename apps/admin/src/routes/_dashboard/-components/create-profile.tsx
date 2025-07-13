import { useEffect, useState } from "react";
import { createProfileResolver, type CreateProfileInput } from "./schema";
import { useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormError,
  FormInput,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { useCreateProfile, useValidateSubdomain } from "@/hooks/mutations/useProfile";
import { SimpleLogo } from "@/components/simple-logo";
import { useAppConfig } from "@/contexts/AppConfigContext";

function CreateProfile() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync, isPending } = useCreateProfile();
  const { mutate: validateSubdomain, isPending: isValidateProfileNamePending } = useValidateSubdomain();
  const { appConfig } = useAppConfig();

  const [isSubdomainInvalid, setIsSubdomainInvalid] = useState(true);

  const methods = useForm<CreateProfileInput>({
    resolver: createProfileResolver,
    mode: "onChange",
    defaultValues: {
      name: "",
      subdomain: "",
    },
  });

  const subdomain = methods.watch("subdomain");
  const isValidForm = methods.formState.isValid;

  useEffect(() => {
    if (!appConfig) return;

    if (!appConfig.isMultiTenant) {
      methods.setValue("subdomain", "default-site");
      return;
    }
    if (isValidForm) {
      validateSubdomain(subdomain, {
        onSuccess: (isValid) => setIsSubdomainInvalid(isValid),
      });
    }
  }, [isValidForm, subdomain, validateSubdomain, appConfig, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      }
    }
  });

  if (!appConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <SimpleLogo className="absolute top-10 left-10" />
      <form onSubmit={onSubmit}>
        <Card className="md:w-[500px]">
          <CardHeader>
            <CardTitle className="text-xl">Create your artist profile</CardTitle>
            <CardDescription>
              Your profile is your personal space on TribeNest. This is where your interactions with your fans takes
              place.
            </CardDescription>
            {errorMessage && <FormError message={errorMessage} />}
          </CardHeader>
          <CardContent>
            <FormInput<CreateProfileInput>
              name="name"
              type="text"
              control={methods.control}
              label="Artist/Band Name"
              className="mb-4"
            />

            {appConfig.isMultiTenant && (
              <>
                <FormInput<CreateProfileInput>
                  name="subdomain"
                  type="text"
                  control={methods.control}
                  label="Subdomain"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  Your website will be live at https://{subdomain}.tribenest.co
                </div>

                <FormError message={isSubdomainInvalid ? "" : "Subdomain is invalid"} />
              </>
            )}

            <Button
              disabled={!isValidForm || isPending || isValidateProfileNamePending || !isSubdomainInvalid}
              type="submit"
              className="mt-4"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default CreateProfile;
