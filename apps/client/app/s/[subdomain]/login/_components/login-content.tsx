"use client";

import {
  alphaToHexCode,
  ApiError,
  EditorButtonWithoutEditor,
  EditorInputWithoutEditor,
  LoginInput,
  loginResolver,
  useEditorContext,
  usePublicAuth,
} from "@tribe-nest/frontend-shared";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

export function LoginContent() {
  const { themeSettings, navigate } = useEditorContext();
  const { login, isLoading } = usePublicAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const methods = useForm<LoginInput>({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage("");
    try {
      await login(data);
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
        <h1 className="text-2xl font-bold mb-8">Login</h1>

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
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm">Password</p>
            <Controller
              control={methods.control}
              name="password"
              render={({ field }) => (
                <EditorInputWithoutEditor
                  placeholder="Password"
                  width="100%"
                  onChange={field.onChange}
                  type="password"
                  value={field.value}
                />
              )}
            />
            {methods.formState.errors.password && (
              <p className="text-sm text-red-500">{methods.formState.errors.password.message}</p>
            )}

            <Link className="text-sm" href="/forgot-password">
              Forgot Password?
            </Link>
          </div>
          <EditorButtonWithoutEditor text="Login" type="submit" disabled={isLoading} />
          <div className="w-full flex justify-center">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>Sign up</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
