"use server";
import { TYPE_JOURNAL_DATA_DATABASE } from "@/app/lib/config/type";
import { verifySession } from "@/app/lib/dal";
import dbConnect from "@/app/lib/database";
import { FormStateWordJournal, JournalSchema } from "@/app/lib/definitions";
import { getError } from "@/app/lib/errorHandler";
import { isArrayEmpty } from "@/app/lib/helper";
import Journal from "@/app/lib/models/Journal";

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
    const validateFields = JournalSchema.safeParse(journalDataForDatabase);
    if (!validateFields.success)
      return getError("prettyZodError", "", undefined, validateFields);

    await dbConnect();
    // if _id isn't set (means the journal hasn't been created yet) => create the data, otherwise => update
    if (!_id) await Journal.create(journalDataForDatabase);
    if (_id) await Journal.findByIdAndUpdate(_id, journalDataForDatabase);

    return { message: `Journal ${!_id ? "created" : "updated"} successfully` };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
