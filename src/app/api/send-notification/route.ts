"use server";
import webpush from "web-push";
import Subscription from "@/app/lib/models/Subscription";
import { NextResponse } from "next/server";

webpush.setVapidDetails(
  "mailto: leichan-official@lei-chan.website",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NOTIFICATION_SECRET}`)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const notification = await req.json();
    const subscriptions = await Subscription.find();

    const pushResults = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          JSON.stringify(notification),
        ),
      ),
    );

    const rejectedIds = pushResults
      .map((result, i) =>
        result.status === "rejected" ? subscriptions[i]._id : null,
      )
      .filter((id) => id);
    console.log(rejectedIds);

    const deletedSubscriptions = await Promise.all(
      rejectedIds.map((id) => Subscription.findByIdAndDelete(id)),
    );
    console.log(deletedSubscriptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
