import { cn } from "@/lib/utils";

type Variant = "green" | "yellow" | "blue" | "red" | "gray" | "purple";

const variants: Record<Variant, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-800",
};

export function Badge({
  children,
  variant = "gray",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}

export function orderStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    PENDING: { label: "Pending", variant: "yellow" },
    CONFIRMED: { label: "Confirmed", variant: "blue" },
    SHIPPED: { label: "Shipped", variant: "purple" },
    DELIVERED: { label: "Delivered", variant: "green" },
    CANCELLED: { label: "Cancelled", variant: "red" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function quoteStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    DRAFT: { label: "Draft", variant: "gray" },
    SENT: { label: "Sent", variant: "blue" },
    ACCEPTED: { label: "Accepted", variant: "green" },
    DECLINED: { label: "Declined", variant: "red" },
    EXPIRED: { label: "Expired", variant: "yellow" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function ticketStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    OPEN: { label: "Open", variant: "blue" },
    IN_PROGRESS: { label: "In Progress", variant: "yellow" },
    RESOLVED: { label: "Resolved", variant: "green" },
    CLOSED: { label: "Closed", variant: "gray" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function priorityBadge(priority: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    LOW: { label: "Low", variant: "gray" },
    MEDIUM: { label: "Medium", variant: "blue" },
    HIGH: { label: "High", variant: "yellow" },
    URGENT: { label: "Urgent", variant: "red" },
  };
  const { label, variant } = map[priority] ?? { label: priority, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}
