import InternalPageRenderer from "../../_components/internal-page-renderer";
import { MembershipSuccessContent } from "./_components/membership-success-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <MembershipSuccessContent />
    </InternalPageRenderer>
  );
}
