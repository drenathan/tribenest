import InternalPageRenderer from "../_components/internal-page-renderer";
import { ForgotPasswordContent } from "./_components/forgot-password-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <ForgotPasswordContent />
    </InternalPageRenderer>
  );
}
