"use server";
import webpush from "web-push";
import dbConnect from "../lib/database";
import Subsctiption from "../lib/models/Subscription";
import { unknown } from "zod";

type SerializedPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

webpush.setVapidDetails(
  "mailto: <leichan-official@lei-chan.website>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  try {
    subscription = sub;
    // In a production environment, you would want to store the subscription in a database
    // For example: await db.subscriptions.create({ data: sub })

    //   await dbConnect();
    //   const subscribed = await Subsctiption.create({data: sub});
    //   console.log(subscribed);
    console.log(subscription);

    return { success: true };
  } catch (err: unknown) {
    console.error("Error", err);
  }
}

export async function unsubscribeUser(sub: PushSubscription) {
  try {
    subscription = null;
    // In a production environment, you would want to remove the subscription from the database
    // For example: await db.subscriptions.delete({ where: { ... } })

    //   const unsubscribed = await Subsctiption.findOneAndDelete({data: sub});
    //   console.log(unsubscribed);

    return { success: true };
  } catch (err) {
    console.error("Error", err);
  }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  const serializedSubscription =
    subscription as unknown as SerializedPushSubscription;

  try {
    await webpush.sendNotification(
      {
        endpoint: serializedSubscription.endpoint,
        keys: {
          p256dh: serializedSubscription.keys.p256dh,
          auth: serializedSubscription.keys.auth,
        },
      },
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/einc-logo.PNG",
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
