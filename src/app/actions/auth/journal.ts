"use server";
// database
import dbConnect from "@/app/lib/database";
import Journal from "@/app/lib/models/Journal";
// dal
import { verifySession } from "@/app/lib/dal";
// methods
import { getError } from "@/app/lib/errorHandler";
import { isArrayEmpty } from "@/app/lib/helper";
// types
import { TYPE_JOURNAL_DATA_DATABASE } from "@/app/lib/config/type";
import { FormStateWordJournal, JournalSchema } from "@/app/lib/definitions";

export async function addUpdateJournal(
  formState: FormStateWordJournal,
  journalData: TYPE_JOURNAL_DATA_DATABASE,
) {
  const { isAuth, userId } = await verifySession();
  try {
    const { _id, ...others } = journalData;

    // if the journal hasn't been created yet and content is empty => do nothing
    if (!_id && isArrayEmpty(journalData.journal.content)) return;

    const journalDataForDatabase = { userId: String(userId), ...others };

    // validate journal data
    const result = JournalSchema.safeParse(journalDataForDatabase);
    if (!result.success)
      return getError("zodError", undefined, undefined, undefined, result);

    await dbConnect();
    // if _id isn't set (means the journal hasn't been created yet) => create the data, otherwise => update
    if (!_id) await Journal.create(journalDataForDatabase);
    if (_id) await Journal.findByIdAndUpdate(_id, journalDataForDatabase);

    return {
      message: {
        en: `Journal ${!_id ? "created" : "updated"} successfully`,
        ja: `ジャーナルが${!_id ? "作成" : "更新"}されました`,
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}
