import InternalPageRenderer from "../_components/internal-page-renderer";
import { ResetPasswordContent } from "./_components/reset-password-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <ResetPasswordContent />
    </InternalPageRenderer>
  );
}
