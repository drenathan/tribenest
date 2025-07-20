"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usePublicAuth,
  useEditorContext,
  alphaToHexCode,
  Label,
  EditorInputWithoutEditor,
  EditorButtonWithoutEditor,
  ApiError,
  FormError,
} from "@tribe-nest/frontend-shared";
import { User as UserIcon, Lock, Mail, XCircle } from "lucide-react";
import { toast } from "sonner";

// Form schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export function AccountTab() {
  const { user, refetchUser, logout } = usePublicAuth();
  const { themeSettings, httpClient } = useEditorContext();
  const [updatePasswordError, setUpdatePasswordError] = useState("");

  // Form hooks
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const passwordForm = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user, profileForm]);

  // Form handlers
  const onProfileSubmit = async (data: UpdateProfileInput) => {
    try {
      await httpClient!.put("/public/accounts/me", {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      refetchUser();
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || "Failed to update profile";
      toast.error(message);
      console.error(error);
    }
  };

  const onPasswordSubmit = async (data: UpdatePasswordInput) => {
    setUpdatePasswordError("");
    try {
      await httpClient!.put("/public/accounts/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully");
      passwordForm.reset();
      logout();
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || "Failed to update password";
      toast.error(message);
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div
        className="border rounded-lg p-6"
        style={{
          borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
          backgroundColor: themeSettings.colors.background,
        }}
      >
        <div className="mb-4">
          <h3
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: themeSettings.colors.textPrimary }}
          >
            <UserIcon className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
            Profile Information
          </h3>
        </div>
        <div>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: themeSettings.colors.textPrimary }}>First Name</Label>
                <EditorInputWithoutEditor
                  placeholder="First Name"
                  value={profileForm.watch("firstName")}
                  onChange={(value) => profileForm.setValue("firstName", value)}
                  width="100%"
                />
                {profileForm.formState.errors.firstName?.message && (
                  <FormError message={profileForm.formState.errors.firstName.message} />
                )}
              </div>

              <div className="space-y-2">
                <Label style={{ color: themeSettings.colors.textPrimary }}>Last Name</Label>
                <EditorInputWithoutEditor
                  placeholder="Last Name"
                  value={profileForm.watch("lastName")}
                  onChange={(value) => profileForm.setValue("lastName", value)}
                  width="100%"
                />
                {profileForm.formState.errors.lastName?.message && (
                  <FormError message={profileForm.formState.errors.lastName.message} />
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.1)}`,
                border: `1px solid ${themeSettings.colors.text}${alphaToHexCode(0.2)}`,
              }}
            >
              <Mail className="w-4 h-4" style={{ color: themeSettings.colors.text }} />
              <span style={{ color: themeSettings.colors.text }}>Email: {user?.email} (cannot be changed)</span>
            </div>

            <EditorButtonWithoutEditor text="Update Profile" onClick={profileForm.handleSubmit(onProfileSubmit)} />
          </form>
        </div>
      </div>

      {/* Change Password */}
      <div
        className="border rounded-lg p-6"
        style={{
          borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
          backgroundColor: themeSettings.colors.background,
        }}
      >
        <div className="mb-4">
          <h3
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: themeSettings.colors.textPrimary }}
          >
            <Lock className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
            Change Password
          </h3>
        </div>
        <div>
          {updatePasswordError && (
            <div
              className="mb-4 p-4 border rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.1)}`,
                borderColor: `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
              }}
            >
              <XCircle className="w-4 h-4" style={{ color: themeSettings.colors.text }} />
              <div>
                <h4 className="font-semibold" style={{ color: themeSettings.colors.text }}>
                  Error
                </h4>
                <p style={{ color: themeSettings.colors.text }}>{updatePasswordError}</p>
              </div>
            </div>
          )}

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: themeSettings.colors.textPrimary }}>Current Password</Label>
              <EditorInputWithoutEditor
                placeholder="Current Password"
                value={passwordForm.watch("currentPassword")}
                onChange={(value) => passwordForm.setValue("currentPassword", value)}
                width="100%"
                type="password"
              />
              {passwordForm.formState.errors.currentPassword?.message && (
                <FormError message={passwordForm.formState.errors.currentPassword.message} />
              )}
            </div>

            <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: themeSettings.colors.textPrimary }}>New Password</Label>
                <EditorInputWithoutEditor
                  placeholder="New Password"
                  value={passwordForm.watch("newPassword")}
                  onChange={(value) => passwordForm.setValue("newPassword", value)}
                  width="100%"
                  type="password"
                />
                {passwordForm.formState.errors.newPassword?.message && (
                  <FormError message={passwordForm.formState.errors.newPassword.message} />
                )}
              </div>

              <div className="space-y-2">
                <Label style={{ color: themeSettings.colors.textPrimary }}>Confirm New Password</Label>
                <EditorInputWithoutEditor
                  placeholder="Confirm New Password"
                  value={passwordForm.watch("confirmPassword")}
                  onChange={(value) => passwordForm.setValue("confirmPassword", value)}
                  width="100%"
                  type="password"
                />
                {passwordForm.formState.errors.confirmPassword?.message && (
                  <FormError message={passwordForm.formState.errors.confirmPassword.message} />
                )}
              </div>
            </div>

            <EditorButtonWithoutEditor text="Update Password" onClick={passwordForm.handleSubmit(onPasswordSubmit)} />
          </form>
        </div>
      </div>
    </div>
  );
}
