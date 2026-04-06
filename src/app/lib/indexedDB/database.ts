import { FLASHCARD_QUIZ_ONE_TURN, LISTS_ONE_PAGE } from "../config/settings";
import {
  DefinitionsDataQuiz,
  IndexedDBData,
  IndexedDBEventTarget,
  IndexedDBType,
  UpdateStatusReviewDateDataQuiz,
} from "../config/types/others";
import {
  Collection,
  Collections,
  JournalDatabase,
  WordData,
} from "../config/types/others";
import { getError } from "../errorHandler";
import {
  getNextReviewDate,
  getNextStatus,
  getRandomNumber,
  isArrayEmpty,
} from "../helper";

const getDatabaseName = (type: IndexedDBType) =>
  type === "test" ? "test" : "einc";

export async function registerData(
  type: IndexedDBType | "test",
  dataArr:
    | Collections
    | WordData[]
    | JournalDatabase[]
    | { _id: string; name: string; password: string }[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readwrite");
      const objStore = transaction.objectStore(type);

      dataArr.forEach((data) => objStore.put(data));

      transaction.oncomplete = (e) => {
        resolve();
      };

      transaction.onerror = (e) => {
        const error = `IndexedDB error, adding data for ${type} failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export function removeData(
  type: "collections" | "words" | "test",
  dataIds: string[],
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readwrite");
      const objStore = transaction.objectStore(type);

      dataIds.forEach((id) => objStore.delete(id));

      transaction.oncomplete = (e) => {
        console.log(
          `Data for ${type} in indexedDB ${getDatabaseName(type)} removed successfully`,
        );
        resolve();
      };

      transaction.onerror = (e) => {
        const error = `IndexedDB Error, deleting data for ${type} failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.log(error);
        reject(error);
      };
    };

    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export function getAllData(type: IndexedDBType) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readonly");
      const objStore = transaction.objectStore(type);

      const getReq = objStore.getAll();

      getReq.onsuccess = (e) =>
        resolve((e.target as IndexedDBEventTarget).result);

      getReq.onerror = (e) => {
        const error = `IndexedDB Error, getting all data failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };
    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export async function getAllIndexedDBData(): Promise<IndexedDBData> {
  try {
    const collections = (await getAllData("collections")) as Collections;
    const words = (await getAllData("words")) as WordData[];
    const journals = (await getAllData("journals")) as JournalDatabase[];

    return { collections, words, journals };
  } catch (err) {
    throw err;
  }
}

export async function getCollectionDataCurPage(
  indexFrom: number,
  indexTo: number,
) {
  try {
    const collectionData = (await getAllData("collections")) as Collections;
    const words = (await getAllData("words")) as WordData[];

    const collectionsCurPage = collectionData.slice(indexFrom, indexTo);

    // add numberOfWords property
    const collectionsWithNumOfWords = collectionsCurPage.map((col) => {
      const numberOfWords = col.allWords
        ? words.length
        : words.filter((word) => word.collectionId === col._id).length;
      return { ...col, numberOfWords };
    });

    return {
      collections: collectionsWithNumOfWords,
      numberOfCollections: collectionData.length,
    };
  } catch (err) {
    throw err;
  }
}

function getCollection(collectionId: string) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName("collections"));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction(["collections"], "readonly");
      const objStore = transaction.objectStore("collections");
      const req = objStore.get(collectionId);

      req.onsuccess = (e) => resolve((e.target as IndexedDBEventTarget).result);

      req.onerror = (e) => {
        const error = `IndexedDB Error, getting collection data failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };

    req.onerror = (e) => {
      const error = getOpeningDatabaseErrorMsg(e, "collections");
      console.error(error);
      reject(error);
    };
  });
}

export async function getDataForCollection(
  type: "words" | "journals",
  collectionId: string,
) {
  let collection;
  try {
    collection = (await getCollection(collectionId)) as Collection;
  } catch (err) {
    throw err;
  }

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = async (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readonly");
      const objStore = transaction.objectStore(type);

      const getReq = objStore.getAll();

      getReq.onsuccess = (e) => {
        const allData = (e.target as IndexedDBEventTarget).result as unknown as
          | WordData[]
          | JournalDatabase[];
        const dataForCollection = allData.filter((data) =>
          collection?.allWords ? data : data.collectionId === collectionId,
        );
        resolve(dataForCollection);
      };

      getReq.onerror = (e) => {
        const error = `IndexedDB Error, getting ${type} data failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };
    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export async function getUserWordsStatuses(collectionId: string) {
  const wordsForCollection = (await getDataForCollection(
    "words",
    collectionId,
  )) as WordData[];
  // if no words, return []
  if (isArrayEmpty(wordsForCollection)) return [];
  if (!wordsForCollection) return null;

  const statuses = new Array(6).fill(0);
  wordsForCollection.forEach((word: WordData) => (statuses[word.status] += 1));

  return statuses;
}

// function getWord(wordId: string) {
//   return new Promise((resolve, reject) => {
//     const req = indexedDB.open(getDatabaseName("words"));

//     req.onsuccess = async (e) => {
//       const db = (e.target as IndexedDBEventTarget).result;
//       const transaction = db.transaction(["words"], "readonly");
//       const objStore = transaction.objectStore("words");
//       const req = objStore.get(wordId);

//       req.onsuccess = (e) => resolve((e.target as IndexedDBEventTarget).result);

//       req.onerror = (e) => {
//         const error = `IndexedDB Error, getting word failed: ${(e.target as IndexedDBEventTarget).error.message}`;
//         console.error(error);
//         reject(error);
//       };
//     };

//     req.onerror = (e) => {
//       const error = getOpeningDatabaseErrorMsg(e, "words");
//       console.error(error);
//       reject(error);
//     };
//   });
// }

export function updateData(
  type: IndexedDBType,
  newData:
    | JournalDatabase[]
    | Collections
    | WordData[]
    | { _id: string; name: string; password: string }[],
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const req = indexedDB.open(getDatabaseName(type));

    req.onsuccess = (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction([type], "readwrite");
      const objStore = transaction.objectStore(type);

      newData.forEach((newD) => {
        if (!newD._id) return;

        const req = objStore.put(newD);

        req.onsuccess = (e) => resolve();

        req.onerror = (e) => {
          const error = `IndexedDB Error, updating data for ${type} in indexedDB ${getDatabaseName(type)}:  ${(e.target as IndexedDBEventTarget).error.message}`;
          console.log(error);
          reject(error);
        };
      });
    };
    req.onerror = (e) => {
      handleOpeningDatabaseError(e, type);
      reject(getOpeningDatabaseErrorMsg(e, type));
    };
  });
}

export async function getMatchedWordsCurPage(
  collectionId: string,
  value: string,
  curPage: number,
) {
  try {
    const indexFrom = (curPage - 1) * LISTS_ONE_PAGE;
    const indexTo = indexFrom + LISTS_ONE_PAGE;

    const wordsForCollection = (await getDataForCollection(
      "words",
      collectionId,
    )) as WordData[];
    if (!wordsForCollection) return null;

    const matchedWords = value
      ? wordsForCollection.filter((word: WordData) => word.name.includes(value))
      : wordsForCollection;

    // get only words that are needed to curPage
    const matchedWordsCurPage = matchedWords.slice(indexFrom, indexTo);

    return {
      numberOfMatchedWords: matchedWords.length,
      matchedWordsCurPage: matchedWordsCurPage,
    };
  } catch (err) {
    return null;
  }
}

// flashcard
export async function getRandomWordsFlashcard(collectionId: string) {
  try {
    const wordsForCollection = (await getDataForCollection(
      "words",
      collectionId,
    )) as WordData[];
    if (!wordsForCollection) return null;
    // if no words, return []
    if (isArrayEmpty(wordsForCollection)) return [];

    const numberOfWords = wordsForCollection.length;

    //   If totalNumberOfWords is less than maxWordsOneTurn, set all words
    if (FLASHCARD_QUIZ_ONE_TURN > numberOfWords) return wordsForCollection;

    const randomNumbersSet: Set<number> = new Set([]);

    //   until set gets 20 random numbers
    while (randomNumbersSet.size < FLASHCARD_QUIZ_ONE_TURN) {
      // minus 1 because it's gonna be used as an index and indexes are 0 base
      randomNumbersSet.add(getRandomNumber(0, numberOfWords - 1));
    }

    const randomNumbersArray = Array.from(randomNumbersSet);

    //   get random words using random numbers as indexes
    const randomWords = randomNumbersArray.map(
      (num) => wordsForCollection[num],
    );

    return randomWords;
  } catch (err) {
    return null;
  }
}

// quiz
export async function getRandomWordsOneTurnQuiz(collectionId: string) {
  try {
    const wordsForCollection = (await getDataForCollection(
      "words",
      collectionId,
    )) as WordData[];
    if (!wordsForCollection) return null;
    // if no words, return []
    if (isArrayEmpty(wordsForCollection)) return [];

    //   get words nextReviewAt time is now or before now
    const wordsToReview = (wordsForCollection as WordData[]).filter(
      (word) => Date.now() - new Date(word.nextReviewAt).getTime() >= 0,
    );

    // get only words that are needed for one turn
    const wordsToReviewCurTurn = wordsToReview.slice(
      0,
      FLASHCARD_QUIZ_ONE_TURN,
    );

    return wordsToReviewCurTurn;
  } catch (err) {
    return null;
  }
}

export async function updateStatusNextReviewDate(
  data: UpdateStatusReviewDateDataQuiz,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName("words"));

    req.onsuccess = async (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction(["words"], "readwrite");
      const objStore = transaction.objectStore("words");
      const getReq = objStore.get(data.wordId);

      getReq.onsuccess = (e) => {
        const word = (e.target as IndexedDBEventTarget)
          .result as unknown as WordData;
        if (!word)
          reject(
            getError("notFound", {
              en: "Word not found",
              ja: "単語が見つかりません",
            }),
          );

        const nextStatus = getNextStatus(word.status, data.isCorrect);
        word.status = nextStatus;
        word.nextReviewAt = getNextReviewDate(nextStatus);

        const updateReq = objStore.put(word);

        updateReq.onsuccess = (e) => resolve();

        updateReq.onerror = (e) => {
          const error = `IndexedDB Error, updating word status failed: ${(e.target as IndexedDBEventTarget).error.message}`;
          console.error(error);
          reject(error);
        };
      };

      getReq.onerror = (e) => {
        const error = `IndexedDB Error, getting word failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };

    req.onerror = (e) => {
      const error = getOpeningDatabaseErrorMsg(e, "words");
      console.error(error);
      reject(error);
    };
  });
}

export function addDefinitions(data: DefinitionsDataQuiz): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(getDatabaseName("words"));

    req.onsuccess = async (e) => {
      const db = (e.target as IndexedDBEventTarget).result;
      const transaction = db.transaction(["words"], "readwrite");
      const objStore = transaction.objectStore("words");
      const getReq = objStore.get(data.wordId);

      getReq.onsuccess = (e) => {
        const word = (e.target as IndexedDBEventTarget)
          .result as unknown as WordData;

        if (!word)
          reject(
            getError("notFound", {
              en: "Word not found",
              ja: "単語が見つかりません",
            }),
          );

        word.definitions = [...word.definitions, ...data.newDefinitions];

        const putReq = objStore.put(word);

        putReq.onsuccess = (e) => resolve();

        putReq.onerror = (e) => {
          const error = `IndexedDB Error, adding word definitions failed: ${(e.target as IndexedDBEventTarget).error.message}`;
          console.error(error);
          reject(error);
        };
      };

      getReq.onerror = (e) => {
        const error = `IndexedDB Error, getting word failed: ${(e.target as IndexedDBEventTarget).error.message}`;
        console.error(error);
        reject(error);
      };
    };

    req.onerror = (e) => {
      const error = getOpeningDatabaseErrorMsg(e, "words");
      console.error(error);
      reject(error);
    };
  });
}

export const getOpeningDatabaseErrorMsg = (e: Event, type: IndexedDBType) =>
  `IndexedDB Error, Opening database ${type === "test" ? "test" : "einc"} failed: ${(e.target as IndexedDBEventTarget).error.message}`;

export const handleOpeningDatabaseError = (e: Event, type: IndexedDBType) => {
  console.error(getOpeningDatabaseErrorMsg(e, type));
};
