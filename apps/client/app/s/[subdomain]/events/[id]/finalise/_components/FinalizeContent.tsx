"use client";

import InternalPageRenderer from "@/app/s/[subdomain]/_components/internal-page-renderer";
import { IPublicOrder, ITicketOrder, useEditorContext } from "@tribe-nest/frontend-shared";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

export function FinalizeContent() {
  const { themeSettings, httpClient, profile } = useEditorContext();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const orderId = searchParams.get("orderId") as string;

  const { data, isLoading } = useQuery<ITicketOrder>({
    queryKey: ["eventTicketOrderStatus", profile?.id, orderId],
    queryFn: async () => {
      const res = await httpClient!.post(`/public/events/${id}/finalize`, {
        profileId: profile?.id,
        orderId,
      });
      return res.data;
    },
    enabled: !!profile?.id,
  });

  console.log(data, "data");

  return (
    <InternalPageRenderer>
      <div>FinalizeContent</div>
    </InternalPageRenderer>
  );
}
