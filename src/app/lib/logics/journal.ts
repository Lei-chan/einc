import journals from "@/app/ModelsDev/UserJournal";

export const checkIsDateToday = (date: Date | string) => {
  const newDateToCompare = new Date(date);
  const today = new Date();
  const isSameYear = newDateToCompare.getFullYear() === today.getFullYear();
  const isSameMonth = newDateToCompare.getMonth() === today.getMonth();
  const isSameDate = newDateToCompare.getDate() === today.getDate();

  return isSameYear && isSameMonth && isSameDate ? true : false;
};

// for dev
export const getJournalDataMonth = (
  collectionId: string,
  date: Date | string,
) => {
  const selectedDate = new Date(date);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const journalsForCollection = journals.find(
    (journal) => journal.collectionId === collectionId,
  );
  if (!journalsForCollection) return [];

  const journalsMonth = journalsForCollection.journals.filter((journal) => {
    const journalDate = new Date(journal.date);
    return (
      journalDate.getFullYear() === year && journalDate.getMonth() === month
    );
  });

  return journalsMonth;
};

export const getJournalDataDate = (
  collectionId: string,
  date: Date | string,
) => {
  const journalDataMonth = getJournalDataMonth(collectionId, date);
  return journalDataMonth.find(
    (data) => new Date(data.date).getDate() === new Date(date).getDate(),
  );
};
