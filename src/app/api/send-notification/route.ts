"use server";
import webpush from "web-push";
import Subscription from "@/app/lib/models/Subscription";
import { NextResponse } from "next/server";
import { API_ALLOWED_ORIGIN } from "@/app/lib/config/settings";
import dbConnect from "@/app/lib/database";

const corsHeaders = {
  "Access-Control-Allow-Origin": API_ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

webpush.setVapidDetails(
  "mailto: leichan-official@lei-chan.website",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NOTIFICATION_SECRET}`)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const notification = await req.json();

    await dbConnect();
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

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: unknown) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      {
        error: `Failed to send notification. ${error instanceof Error ? error.message : ""}`,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
