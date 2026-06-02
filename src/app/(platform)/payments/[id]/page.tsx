import { PaymentDetailsModule } from "@/features/payments/components/payment-details-module";

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PaymentDetailsModule id={id} />;
}
