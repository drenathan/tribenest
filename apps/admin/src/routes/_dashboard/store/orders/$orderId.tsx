import { useGetOrder } from "@/hooks/queries/useOrder";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Badge,
} from "@tribe-nest/frontend-shared";
import { OrderStatus, ProductDeliveryType } from "@tribe-nest/frontend-shared";
import {
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  AlertCircle,
  MoreHorizontal,
  Send,
  PackageCheck,
  User,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react";
import Loading from "@/components/loading";

export const Route = createFileRoute("/_dashboard/store/orders/$orderId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { currentProfileAuthorization } = useAuth();
  const { data: order, isLoading } = useGetOrder(orderId, currentProfileAuthorization?.profileId);

  // Helper functions
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Paid:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case OrderStatus.PaymentFailed:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case OrderStatus.Processing:
        return <Clock className="w-5 h-5 text-blue-600" />;
      case OrderStatus.Shipped:
        return <Truck className="w-5 h-5 text-blue-600" />;
      case OrderStatus.Delivered:
        return <Package className="w-5 h-5 text-green-600" />;
      case OrderStatus.Cancelled:
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case OrderStatus.InitiatedPayment:
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusText = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    switch (status) {
      case OrderStatus.Paid:
      case OrderStatus.Delivered:
        return <Badge variant="default">{statusText}</Badge>;
      case OrderStatus.PaymentFailed:
      case OrderStatus.Cancelled:
        return <Badge variant="destructive">{statusText}</Badge>;
      case OrderStatus.Processing:
      case OrderStatus.Shipped:
      case OrderStatus.InitiatedPayment:
        return <Badge variant="secondary">{statusText}</Badge>;
      default:
        return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResendDigital = async (deliveryGroupId: string) => {
    // TODO: Implement resend digital delivery logic
    console.log("Resending digital delivery for group:", deliveryGroupId);
  };

  const handleFulfilPhysical = async (deliveryGroupId: string) => {
    // TODO: Implement fulfil physical delivery logic
    console.log("Fulfilling physical delivery for group:", deliveryGroupId);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <div>
        <PageHeader title="Order Not Found" description={`Order ID: ${orderId}`} />
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <p>The requested order could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = order.deliveryGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Order Details" description={`Order ID: ${order.id}`} />

      {/* Order Summary Card */}
      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="w-4 h-4" />
                Customer
              </div>
              <div>
                <div className="font-semibold">{order.customerName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {order.customerEmail}
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Order Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Order Date
              </div>
              <div className="text-sm">{formatDate(order.createdAt)}</div>
            </div>

            {/* Order Total */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">${order.totalAmount}</div>
              <div className="text-xs text-muted-foreground">
                {totalItems} items • {order.deliveryGroups.length} deliveries
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-4">Delivery Type</TableHead>
                <TableHead className="p-4">Recipient</TableHead>
                <TableHead className="p-4">Items</TableHead>
                <TableHead className="p-4">Status</TableHead>
                <TableHead className="p-4">Total</TableHead>
                <TableHead className="p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.deliveryGroups.map((deliveryGroup) => {
                return (
                  <TableRow key={deliveryGroup.id}>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-2">
                        {deliveryGroup.deliveryType === ProductDeliveryType.Physical ? (
                          <>
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Physical</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Digital</span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="p-4">
                      <div>
                        <div className="font-medium">{deliveryGroup.recipientName}</div>
                        <div className="text-sm text-muted-foreground">{deliveryGroup.recipientEmail}</div>
                        {deliveryGroup.recipientMessage && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            "{deliveryGroup.recipientMessage}"
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="p-4">
                      <div className="space-y-2">
                        {deliveryGroup.items.map((item, index) => (
                          <div
                            key={`${item.productId}-${item.productVariantId}-${index}`}
                            className="flex gap-3 items-start"
                          >
                            {item.coverImage && (
                              <img src={item.coverImage} alt={item.title} className="w-8 h-8 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Qty: {item.quantity} • ${item.price.toFixed(2)}
                                {item.color && item.size && (
                                  <span className="ml-2">
                                    • <span style={{ color: item.color }}>●</span> {item.size}
                                  </span>
                                )}
                              </div>
                              {item.isGift && <div className="text-xs text-primary">🎁 Gift</div>}
                              {item.recipientMessage && (
                                <div className="text-xs text-muted-foreground italic">
                                  Message: "{item.recipientMessage}"
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deliveryGroup.status)}
                        {getStatusBadge(deliveryGroup.status)}
                      </div>
                    </TableCell>

                    <TableCell className="p-4">
                      <div className="font-semibold">${deliveryGroup.subTotal?.toFixed(2)}</div>
                    </TableCell>

                    <TableCell className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {deliveryGroup.deliveryType === ProductDeliveryType.Digital ? (
                            <DropdownMenuItem onClick={() => handleResendDigital(deliveryGroup.id)}>
                              <Send className="w-4 h-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleFulfilPhysical(deliveryGroup.id)}>
                              <PackageCheck className="w-4 h-4 mr-2" />
                              Fulfil Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
