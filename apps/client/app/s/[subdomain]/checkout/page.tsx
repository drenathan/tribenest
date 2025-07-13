import InternalPageRenderer from "../_components/internal-page-renderer";
import { CheckoutPageContent } from "./_components/checkout-page-content";

export default async function Page() {
  return (
    <InternalPageRenderer>
      <CheckoutPageContent />
    </InternalPageRenderer>
  );
}
