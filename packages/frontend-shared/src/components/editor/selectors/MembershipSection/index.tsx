"use client";
import { useNode, type UserComponent } from "@craftjs/core";
import { useEffect, useState } from "react";
import { MembershipSectionSettings } from "./Settings";
import { EditorButton } from "../Button";
import { useEditorContext } from "../../context";
import type { MembershipTier } from "../../../../types";
import { EditorIcon } from "../Icon";
import { usePublicAuth } from "../../../../contexts/PublicAuthContext";

type MembershipSectionProps = {
  title: string;
  alignItems?: "flex-start" | "center" | "flex-end";
};

export const MembershipSection: UserComponent<MembershipSectionProps> = ({
  title,
  alignItems = "center",
}: MembershipSectionProps) => {
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const { httpClient, profile, themeSettings, navigate } = useEditorContext();
  const { isAuthenticated, user } = usePublicAuth();

  const {
    connectors: { connect },
  } = useNode();

  useEffect(() => {
    httpClient
      ?.get(`/public/membership-tiers`, {
        params: {
          profileId: profile?.id,
        },
      })
      .then((res) => {
        setMembershipTiers(res.data);
      });
  }, [httpClient, profile?.id]);

  const handleJoinClick = (tier: MembershipTier) => {
    if (!isAuthenticated) {
      // Redirect to signup with membership tier ID
      navigate(`/signup?redirect=/membership/checkout?membershipTierId=${tier.id}`);
    } else {
      // User is authenticated, proceed to payment
      navigate(`/membership/checkout?membershipTierId=${tier.id}`);
    }
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref);
        }
      }}
      className="w-full @md:p-8 p-4 flex flex-col"
      style={{ alignItems }}
    >
      <div className="flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold text-center @md:text-left mb-10">{title}</h1>

        <div className="flex gap-4 flex-col @md:flex-row w-full flex-wrap @md:justify-center">
          {membershipTiers.map((tier) => {
            return (
              <div
                style={{
                  border: `1px solid ${themeSettings.colors.primary}`,
                  borderRadius: themeSettings.cornerRadius + "px",
                }}
                className="w-full @md:w-[350px] p-4 flex flex-col"
                key={tier.id}
              >
                <h2 className="text-2xl font-bold text-center">{tier.name}</h2>
                <div className="text-center mt-2 mb-4">
                  {tier.payWhatYouWant ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Pay What You Want from ${tier.payWhatYouWantMinimum}/Mo</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {tier.priceMonthly ? <span>${tier.priceMonthly}/Mo</span> : <span>Free</span>}
                      {!!tier.priceYearly && <span>${tier.priceYearly}/Yr</span>}
                    </div>
                  )}
                </div>
                <ul className="flex flex-col gap-2 mb-4 flex-grow">
                  {tier?.benefits?.map((benefit) => (
                    <li key={benefit.id} className="flex items-center gap-2 text-sm">
                      <EditorIcon icon="check" iconClassName="w-4 h-4" shouldConnect={false} />
                      {benefit.title}
                    </li>
                  ))}
                </ul>

                {user?.membership?.membershipTierId === tier.id ? (
                  <div
                    className="text-sm text-center py-4"
                    style={{
                      color: themeSettings.colors.primary,
                    }}
                  >
                    <span>You are currently on this tier</span>
                  </div>
                ) : (
                  <EditorButton
                    disabled={user?.membership?.membershipTierId === tier.id}
                    shouldConnect={false}
                    text={"Join"}
                    fullWidth
                    onClick={() => handleJoinClick(tier)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

MembershipSection.craft = {
  displayName: "Membership Section",
  props: {
    title: "Become a member",
    alignItems: "center",
  },
  related: {
    toolbar: MembershipSectionSettings,
  },
};
