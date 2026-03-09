// method
import { isArray } from "chart.js/helpers";
// settings
import {
  MIN_LENGTH_PASSWORD,
  MIN_NUMBER_EACH_PASSWORD,
  PASSWORD_REGEX,
} from "./config/settings";
// types
import {
  Language,
  MediaDatabase,
  MongoBuffer,
  WordData,
  WordBeforeSent,
  WordToDisplay,
  Message,
} from "./config/types/others";
// library
import Resizer from "react-image-file-resizer";

export const getGenericErrorMessage = (language: Language) =>
  language === "en"
    ? "Unexpected error occured. Please try again this later 🙇‍♂️"
    : "予期せぬエラーが発生しました。後ほどもう一度お試し下さい🙇‍♂️";

export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const wait = (seconds: number = 3) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const getNumberOfPages = (
  numContentsPage: number,
  numUserContents: number,
) => Math.ceil(numUserContents / numContentsPage);

export const joinWithCommas = (array: unknown[]) => array.join(", ");

export const joinWithLineBreaks = (array: string[]) =>
  array.map((str, i) => (
    <span key={i}>
      {str}
      {str !== array.at(-1) && <br />}
    </span>
  ));

// compare letter and uppercase letter, if letter is uppercase letter => add space and convert it to lowercase, other wise return original letter
export const getWordFromCammelCase = (word: string) =>
  word
    .split("")
    .map((letter) =>
      letter === letter.toUpperCase() ? " " + letter.toLowerCase() : letter,
    )
    .join("");

export const getLanguageFromPathname = (pathname: string): Language =>
  doesPathnameContainLanguage(pathname)
    ? (pathname.slice(1, 3) as Language)
    : "en";

export const doesPathnameContainLanguage = (pathname: string) =>
  pathname.startsWith("/en") || pathname.startsWith("/ja");

export const convertBufferToFile = (data: MediaDatabase | File) => {
  if (!data || data instanceof File) return data;

  const blob = new Blob([new Uint8Array((data.buffer as MongoBuffer).data)]);
  const file = new File([blob], data.name);

  return file;
};

export const resizeImages = (
  imageFiles: (File | null)[],
): Promise<(File | null)[]> => {
  const resizePromises = imageFiles.map(
    (file) =>
      new Promise((resolve) => {
        if (!file?.size) {
          resolve(null);
          return;
        }

        Resizer.imageFileResizer(
          file,
          500,
          400,
          "WEBP",
          100,
          0,
          (uri) => resolve(uri),
          "file",
        );
      }),
  );

  return Promise.all(resizePromises) as Promise<(File | null)[]>;
};

const convertFilesToBuffersWithNames = async (files: (File | null)[]) => {
  try {
    const bufferPromises = files.map((file) =>
      file?.size ? file.arrayBuffer() : null,
    );

    const arrayBuffers = await Promise.all(bufferPromises);
    // Add file names to buffers
    const buffersWithNames = arrayBuffers.map((arrBuffer, i) => {
      return arrBuffer
        ? { name: files[i]?.name || "", buffer: Buffer.from(arrBuffer) }
        : null;
    });

    return buffersWithNames;
  } catch (err) {
    throw err;
  }
};

export const convertWordDataToSendServer = async (
  wordData: WordBeforeSent,
): Promise<WordData> => {
  try {
    // convert files into buffer
    const [audioBuffer, imageNameBuffer, imageDefinitionsBuffer] =
      await convertFilesToBuffersWithNames([
        wordData.audio,
        wordData.imageName,
        wordData.imageDefinitions,
      ]);

    return {
      ...(wordData._id ? { _id: wordData._id } : {}),
      ...(wordData.userId ? { userId: wordData.userId } : {}),
      collectionId: wordData.collectionId,
      name: wordData.name.trim(),
      audio: audioBuffer,
      definitions: wordData.definitions.split("\n").filter((def) => def),
      examples: wordData.examples.split("\n").filter((exam) => exam),
      imageName: imageNameBuffer,
      imageDefinitions: imageDefinitionsBuffer,
      status: wordData.status,
      nextReviewAt: wordData.nextReviewAt,
    };
  } catch (err) {
    throw err;
  }
};

export const getWordDataToDisplay = (wordData: WordData): WordToDisplay => {
  const mediaBuffers = [
    wordData.audio,
    wordData.imageName,
    wordData.imageDefinitions,
  ];

  // convert buffers to blobs, and blobs to urls
  const [audio, imageName, imageDefinitions] = mediaBuffers
    .map(
      (media) =>
        media?.buffer && {
          name: media.name,
          data: new Blob([new Uint8Array((media.buffer as MongoBuffer).data)]),
        },
    )
    .map(
      (blobWithName) =>
        blobWithName && {
          name: blobWithName.name,
          data: window.URL.createObjectURL(blobWithName.data),
        },
    );

  // replace mediaBuffers with links
  const newWordData = { ...wordData } as WordToDisplay;
  newWordData.audio = audio || null;
  newWordData.imageName = imageName || null;
  newWordData.imageDefinitions = imageDefinitions || null;

  return newWordData;
};

export const formatDate = (
  date: Date | string,
  locale: string = "en-US",
  withDay: boolean,
) => {
  const selectedDate = new Date(date);
  const formattedDate = Intl.DateTimeFormat(locale).format(selectedDate);
  if (!withDay) return formattedDate;

  return `${formattedDate} (${Intl.DateTimeFormat(locale, { weekday: "short" }).format(selectedDate)})`;
};

export const validatePassword = (value: string) => {
  const passwordRegex = PASSWORD_REGEX;
  return passwordRegex.test(value);
};

export const getInputErrorMessage = (
  value: string,
  type: "email" | "password",
  currenData?: string,
) => {
  if (!value) return "※ This field is required";

  if (currenData && value === currenData)
    return "※ Please enter new information that you are not currently using";

  if (type === "password" && !validatePassword(value))
    return `※ Please enter password at least ${MIN_LENGTH_PASSWORD} characters long, with more than ${MIN_NUMBER_EACH_PASSWORD} lowercase, ${MIN_NUMBER_EACH_PASSWORD} uppercase, and ${MIN_NUMBER_EACH_PASSWORD} digit`;

  return "";
};

export const isArrayEmpty = (array: unknown[]) =>
  isArray(array) && !array.length;

export const isObjectEmpty = (object: object) =>
  typeof object === "object" && !Object.keys(object).length;

export const getNextReviewDate = (status: number) => {
  const datePlus = [0, 1, 3, 7, 14, 30];
  const datePlusMilliseconds = datePlus.map(
    (date) => date * 24 * 60 * 60 * 1000,
  );
  return new Date(Date.now() + datePlusMilliseconds[status]).toISOString();
};

export const convertWordsToQuizData = (wordDataToDisplay: WordToDisplay[]) => {
  const quizData = wordDataToDisplay.flatMap((word) => {
    const nameData = {
      name: word.name,
      audio: word.audio,
      image: word.imageName,
    };
    const definitionsData = {
      definitions: word.definitions,
      image: word.imageDefinitions,
    };
    const commonData = {
      // display just 2 examples
      afterSentence: word.examples.slice(0, 2).join("\n"),
      id: word._id || "",
      status: word.status,
    };

    const wordAnswerMeaning = {
      question: {
        sentence: {
          en: "Please answer the meaning of this word",
          ja: "この単語の意味を答えてください",
        },
        ...nameData,
      },
      answer: definitionsData,
      ...commonData,
    };
    const wordAnsweringWord = {
      question: {
        sentence: {
          en: "Please answer the word of this meaning",
          ja: "この意味の単語を答えてください",
        },
        ...definitionsData,
      },
      answer: nameData,
      ...commonData,
    };

    return [wordAnswerMeaning, wordAnsweringWord];
  });

  return quizData;
};

export const areDatesSame = (date1: Date | string, date2: Date | string) => {
  const dateOne = new Date(date1);
  const dateTwo = new Date(date2);

  const isSameYear = dateOne.getFullYear() === dateTwo.getFullYear();
  const isSameMonth = dateOne.getMonth() === dateTwo.getMonth();
  const isSameDate = dateOne.getDate() === dateTwo.getDate();

  return isSameYear && isSameMonth && isSameDate ? true : false;
};

export const getMessagesFromFieldError = (
  language: Language,
  fieldErrors: { [key: string]: Message },
) => {
  const messages = Object.values(fieldErrors);
  const messagesForLanguage = messages.map((msg) => msg[language]);

  return messagesForLanguage.join("\n");
};
