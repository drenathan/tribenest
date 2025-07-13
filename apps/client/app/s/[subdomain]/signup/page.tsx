import InternalPageRenderer from "../_components/internal-page-renderer";
import { SignupContent } from "./_components/signup-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <SignupContent />
    </InternalPageRenderer>
  );
}
