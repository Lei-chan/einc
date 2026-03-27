"use server";
import dbConnect from "../lib/database";
import Subscription from "../lib/models/Subscription";
import { FormStateSubscription } from "../lib/config/types/formState";
import { getError } from "../lib/errorHandler";

export async function subscribeUser(
  formState: FormStateSubscription,
  sub: PushSubscription,
) {
  try {
    await dbConnect();
    const subscribed = await Subscription.create(sub);
    // console.log(subscribed);

    return { success: true };
  } catch (err: unknown) {
    console.error("Error", err);
    return getError(
      "other",
      {
        en: "Subscribe failed. Please try again this later 🙇‍♂️",
        ja: "サブスクリプション登録ができませんでした。後ほどもう一度お試し下さい🙇‍♂️",
      },
      err,
    ) as FormStateSubscription;
  }
}

export async function unsubscribeUser(
  formState: FormStateSubscription,
  sub: PushSubscription,
) {
  try {
    await dbConnect();
    const unsubscribed = await Subscription.findOneAndDelete(sub);
    // console.log(unsubscribed);

    return { success: true };
  } catch (err) {
    console.error("Error", err);
    return getError(
      "other",
      {
        en: "Unsubscribe failed. Please try again this later 🙇‍♂️",
        ja: "サブスクリプション登録解除ができませんでした。後ほどもう一度お試し下さい🙇‍♂️",
      },
      err,
    ) as FormStateSubscription;
  }
}
