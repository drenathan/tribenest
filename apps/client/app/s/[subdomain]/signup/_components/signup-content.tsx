"use client";

import {
  alphaToHexCode,
  ApiError,
  CreateAccountInput,
  createAccountResolver,
  EditorButtonWithoutEditor,
  EditorInputWithoutEditor,
  PublicCreateAccountInput,
  useEditorContext,
  usePublicAuth,
} from "@tribe-nest/frontend-shared";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

export function SignupContent() {
  const { themeSettings, navigate, profile } = useEditorContext();
  const { register, isLoading } = usePublicAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const methods = useForm<PublicCreateAccountInput>({
    resolver: createAccountResolver,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: PublicCreateAccountInput) => {
    setErrorMessage("");
    try {
      await register({ ...data, profileId: profile!.id });
      navigate(redirect || "/");
    } catch (e: unknown) {
      const error = e as ApiError;
      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      }
    }
  };
  return (
    <div className="w-full h-full flex justify-center items-start px-4 md:px-8 ">
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full max-w-md mt-20 p-4 h-auto"
        style={{
          border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.45)}`,
        }}
      >
        <h1 className="text-2xl font-bold mb-8">Create account</h1>

        <div className="w-full flex flex-col gap-6">
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm">Email</p>
            <Controller
              control={methods.control}
              name="email"
              render={({ field }) => (
                <EditorInputWithoutEditor
                  placeholder="Email"
                  width="100%"
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            {methods.formState.errors.email && (
              <p className="text-sm text-red-500">{methods.formState.errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm">First Name</p>
              <Controller
                control={methods.control}
                name="firstName"
                render={({ field }) => (
                  <EditorInputWithoutEditor
                    placeholder="First Name"
                    width="100%"
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
              {methods.formState.errors.firstName && (
                <p className="text-sm text-red-500">{methods.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm">Last Name</p>
              <Controller
                control={methods.control}
                name="lastName"
                render={({ field }) => (
                  <EditorInputWithoutEditor
                    placeholder="First Name"
                    width="100%"
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
              {methods.formState.errors.lastName && (
                <p className="text-sm text-red-500">{methods.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <p className="text-sm">Password</p>
            <Controller
              control={methods.control}
              name="password"
              render={({ field }) => (
                <EditorInputWithoutEditor
                  placeholder="Password"
                  width="100%"
                  type="password"
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            {methods.formState.errors.password && (
              <p className="text-sm text-red-500">{methods.formState.errors.password.message}</p>
            )}
          </div>
          <EditorButtonWithoutEditor text="Create account" type="submit" disabled={isLoading} />
          <div className="w-full flex justify-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>Login</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
