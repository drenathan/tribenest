"use client";
import { useNode, type UserComponent } from "@craftjs/core";
import { SocialIconsSettings } from "./Settings";
import { useEditorContext } from "../../context";
import { Instagram, Facebook, Twitter, Youtube, Globe } from "lucide-react";
import { cn } from "../../../../lib/utils";

type SocialIconsProps = {
  background?: string;
  containerClassName?: string;
};

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

export const EditorSocialIcons: UserComponent<SocialIconsProps> = ({ containerClassName }) => {
  const {
    themeSettings: { socialLinks },
  } = useEditorContext();
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className={cn("flex items-center gap-4", containerClassName)}
    >
      {socialLinks.map((link, index) => {
        const IconComponent = socialIcons[link.icon as keyof typeof socialIcons] || Globe;
        return (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <IconComponent className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
};

EditorSocialIcons.craft = {
  displayName: "Social Icons",
  related: {
    toolbar: SocialIconsSettings,
  },
};
