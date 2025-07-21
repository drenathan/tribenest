"use client";
import { useNode, type UserComponent } from "@craftjs/core";
import { useState } from "react";
import { EmailListSettings } from "./Settings";
import { EditorButton } from "../Button";
import { useEditorContext } from "../../context";
import { EditorInput } from "../";
import { z } from "zod";

export type EmailListProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonId?: string;
  emailListId?: string;
  successMessage?: string;
};

export const EmailList: UserComponent<EmailListProps> = ({
  title,
  description,
  buttonText,

  emailListId,
  successMessage,
}: EmailListProps) => {
  const { httpClient, profile, themeSettings } = useEditorContext();
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    connectors: { connect },
  } = useNode();

  if (!profile || !httpClient) {
    return null;
  }

  const handleJoinClick = () => {
    setError("");
    if (!email) {
      setError("Please enter your email");
      return;
    }

    const emailSchema = z.string().email().toLowerCase();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    httpClient
      .post(`/public/email-lists/join`, {
        email: result.data,
        emailListId,
        profileId: profile.id,
      })
      .then(() => {
        setIsJoinSuccess(true);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "An error occurred";
        setError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:p-8 p-4"
    >
      <h1 className="text-2xl font-bold text-center @md:text-left mb-4">{title}</h1>
      <p className="text-center @md:text-left mb-4">{description}</p>
      <div className="flex gap-4 flex-col max-w-[400px] w-full items-start">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {isJoinSuccess && (
          <p style={{ color: themeSettings.colors.primary }}>{successMessage || "Thank you! Will be in touch soon!"}</p>
        )}

        {!isJoinSuccess && (
          <>
            <div className="w-full flex-1">
              <EditorInput
                width="100%"
                placeholder="Enter your email"
                value={email}
                onChange={(value) => setEmail(value)}
              />
            </div>

            <EditorButton
              disabled={isLoading}
              fullWidth={false}
              text={buttonText}
              marginVertical="10"
              onClick={handleJoinClick}
            />
          </>
        )}
      </div>
    </div>
  );
};

EmailList.craft = {
  displayName: "Email List",
  props: {
    title: "Join my email list",
    description: "Never miss an update about my new music, sound packs, and more!",
    buttonText: "Join",
    buttonId: "join-email-list",
  },
  related: {
    toolbar: EmailListSettings,
  },
};
