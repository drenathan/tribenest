import InternalPageRenderer from "../../_components/internal-page-renderer";
import { MembershipCheckoutContent } from "./_components/membership-checkout-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <MembershipCheckoutContent />
    </InternalPageRenderer>
  );
}
