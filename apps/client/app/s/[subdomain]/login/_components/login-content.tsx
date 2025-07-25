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
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import type { MembershipTier } from "@tribe-nest/frontend-shared";
import InternalPageRenderer from "../../_components/internal-page-renderer";

export function LoginContent() {
  return (
    <InternalPageRenderer>
      <Content />
    </InternalPageRenderer>
  );
}
export function Content() {
  const { themeSettings, navigate, profile, httpClient } = useEditorContext();
  const { login, isLoading } = usePublicAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [membershipTier, setMembershipTier] = useState<MembershipTier | null>(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const methods = useForm<LoginInput>({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Fetch membership tier details if membershipTierId is provided
  useEffect(() => {
    if (!redirect || !httpClient || !profile) return;
    const searchFromRedirect = new URLSearchParams(redirect.split("?")[1]);
    const membershipTierId = searchFromRedirect.get("membershipTierId");
    if (!membershipTierId) return;
    httpClient
      .get(`/public/membership-tiers`, {
        params: { profileId: profile.id },
      })
      .then((res) => {
        const tier = res.data.find((t: MembershipTier) => t.id === membershipTierId);
        if (tier) {
          setMembershipTier(tier);
        }
      })
      .catch(() => {
        // Silently fail - membership info is not critical for signup
      });
  }, [httpClient, profile, redirect]);

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
    <div
      style={{
        color: themeSettings.colors.text,
      }}
      className="w-full h-full flex justify-center items-start px-4 md:px-8 "
    >
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full max-w-md mt-20 p-4 h-auto"
        style={{
          border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.45)}`,
        }}
      >
        <h1 className="text-2xl font-bold mb-8">Login</h1>

        {/* Membership Info Banner */}
        {membershipTier && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}` }}
          >
            <h3 className="text-lg font-semibold mb-2">Join {membershipTier.name}</h3>
            <div className="text-sm mb-3">
              {membershipTier.payWhatYouWant ? (
                <p>Pay What You Want from ${membershipTier.payWhatYouWantMinimum}/Mo</p>
              ) : (
                <p>
                  {membershipTier.priceMonthly ? `$${membershipTier.priceMonthly}/Mo` : "Free"}
                  {membershipTier.priceYearly ? ` or $${membershipTier.priceYearly}/Yr` : ""}
                </p>
              )}
            </div>
            {membershipTier.benefits && membershipTier.benefits.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Benefits:</p>
                <ul className="space-y-1">
                  {membershipTier.benefits.slice(0, 3).map((benefit) => (
                    <li key={benefit.id} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {benefit.title}
                    </li>
                  ))}
                  {membershipTier.benefits.length > 3 && (
                    <li className="text-xs opacity-75">+{membershipTier.benefits.length - 3} more benefits</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

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
