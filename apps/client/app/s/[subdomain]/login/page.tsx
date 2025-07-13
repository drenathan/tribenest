import InternalPageRenderer from "../_components/internal-page-renderer";
import { LoginContent } from "./_components/login-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <LoginContent />
    </InternalPageRenderer>
  );
}
