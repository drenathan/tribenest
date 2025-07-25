"use client";
import {
  EditorIcon,
  EditorSocialIcons,
  EditorText,
  Container,
  PageHeader,
  MembershipSection,
} from "../../components/editor/selectors";
import type { Profile } from "../../types";
import { Element } from "@craftjs/core";

export default function IndexPage({ profile }: { profile: Profile }) {
  return (
    <>
      <Element
        canvas
        is={Container}
        height="100%"
        id="page-hero"
        width="100%"
        paddingHorizontal="10"
        paddingVertical="0"
        backgroundImage="https://cdn.coumo.com/geo-chierchia-o-9-fSSiCT0-unsplash.jpg"
        backgroundVideo="https://assets-dev.coumo.com/9fe946e3-75f9-4a6b-a916-e993b0f7ab64/1753452800271-3326187-hd_1920_1080_24fps (1).mp4"
        custom={{ displayName: "Hero Section", preventDelete: true }}
      >
        <PageHeader showCart={false} />
        <div className="flex flex-col items-center justify-center h-full w-full @md:px-8 px-4">
          <div>
            <div>
              <EditorText text={profile?.name} fontSize="70" fontSizeMobile="40" />
            </div>
            <div className="max-w-[300px]">
              <EditorText
                text="I am a musical artist, producer, and engineer. I make music for the soul."
                fontSize="18"
                fontSizeMobile="16"
              />
            </div>
            <EditorSocialIcons containerClassName="mt-4" />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "0px",
            }}
            className="left-1/2 transform -translate-x-1/2 animate-bounce"
          >
            <div className="flex flex-col items-center gap-2 text-white/80">
              <EditorText text="Scroll" fontSize="14" />
              <EditorIcon icon="chevron-down" iconClassName="h-6 w-6 animate-pulse" />
            </div>
          </div>
        </div>
      </Element>
      <Element canvas is={Container} height="auto" id="page-membership" width="100%">
        <MembershipSection title="Join the tribe" />
      </Element>
    </>
  );
}
