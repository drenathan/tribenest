import InternalPageRenderer from "../_components/internal-page-renderer";
import { ProtectedRoute } from "../_components/protected-route";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <InternalPageRenderer>
        <div>Account</div>
      </InternalPageRenderer>
    </ProtectedRoute>
  );
}
