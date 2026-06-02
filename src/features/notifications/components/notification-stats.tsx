"use client";

import { Bell, CircleAlert, CircleCheckBig, Mail, MessageSquareMore, Send } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatNumber } from "@/lib/formatters";
import type { NotificationDashboardData } from "@/types/notification";

export function NotificationStats({ data }: { data: NotificationDashboardData }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard label="Unread Notifications" value={formatNumber(data.unreadCount)} change="Needs attention" icon={Bell} tone="warning" />
      <MetricCard label="Read Notifications" value={formatNumber(data.readCount)} change="Reviewed updates" icon={CircleCheckBig} tone="neutral" />
      <MetricCard label="Failed Notifications" value={formatNumber(data.failedNotifications)} change="Delivery exceptions" icon={CircleAlert} tone="warning" />
      <MetricCard label="Templates Active" value={formatNumber(data.activeTemplates)} change="Template catalog" icon={Mail} tone="neutral" />
      <MetricCard label="Messages Sent Today" value={formatNumber(data.messagesSentToday)} change="Outbound activity" icon={Send} />
      <MetricCard label="Delivery Success Rate" value={`${data.deliverySuccessRate}%`} change="Delivery quality" icon={MessageSquareMore} />
    </section>
  );
}
