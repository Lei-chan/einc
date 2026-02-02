import Resizer from "react-image-file-resizer";
import { TYPE_WORD, TYPE_WORD_TO_DISPLAY } from "./config/type";

export const getNumberOfPages = (
  numContentsPage: number,
  numUserContents: number,
) => Math.ceil(numUserContents / numContentsPage);

export const joinWithLineBreaks = (array: string[]) =>
  array.map((str, i) => (
    <span key={i}>
      {str}
      {str !== array.at(-1) && <br />}
    </span>
  ));

export const resizeImages = (imageFiles: File[]) => {
  const resizePromises = imageFiles.map(
    (file) =>
      new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(undefined);
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

  return Promise.all(resizePromises);
};

const convertFilesToBuffersWithNames = async (files: (File | undefined)[]) => {
  try {
    const bufferPromises = files.map((file) =>
      file ? file.arrayBuffer() : undefined,
    );

    const buffers = await Promise.all(bufferPromises);
    // Add file names to buffers
    const buffersWithNames = buffers.map((buffer, i) => {
      return buffer ? { name: files[i]?.name, buffer } : undefined;
    });

    return buffersWithNames;
  } catch (err) {
    throw err;
  }
};

export const getSubmittedWordData = async (
  formElement: HTMLFormElement | null,
) => {
  try {
    if (!formElement) return;

    const formData = new FormData(formElement);
    const audioData = formData.get("audio") as File;
    const imageNameData = formData.get("imageName") as File;
    const imageDefinitionsData = formData.get("imageDefinitions") as File;

    // make image size smaller
    const resizedImages = (await resizeImages([
      imageNameData,
      imageDefinitionsData,
    ])) as (File | undefined)[];

    // convert files into buffer
    const [audioBuffer, imageNameBuffer, imageDefinitionsBuffer] =
      await convertFilesToBuffersWithNames([audioData, ...resizedImages]);

    return {
      name: formData.get("name"),
      audio: audioBuffer,
      definitions: String(formData.get("definitions")).split("\n"),
      examples: String(formData.get("examples")).split("\n"),
      imageName: imageNameBuffer,
      imageDefinitions: imageDefinitionsBuffer,
      // it's going to be a folder id
      folder: formData.get("folder"),
    };
  } catch (err) {
    throw err;
  }
};

export const getWordDataToDisplay = (
  wordData: TYPE_WORD,
): TYPE_WORD_TO_DISPLAY => {
  const mediaBuffers = [
    wordData.audio,
    wordData.imageName,
    wordData.imageDefinitions,
  ];

  // convert buffers to blobs, and blobs to urls
  const [audio, imageName, imageDefinitions] = mediaBuffers
    .map(
      (media) =>
        media?.buffer && { name: media.name, data: new Blob([media.buffer]) },
    )
    .map(
      (blobWithName) =>
        blobWithName && {
          name: blobWithName.name,
          data: window.URL.createObjectURL(blobWithName.data),
        },
    );

  // replace mediaBuffers with links
  const newWordData = { ...wordData } as TYPE_WORD_TO_DISPLAY;
  newWordData.audio = audio;
  newWordData.imageName = imageName;
  newWordData.imageDefinitions = imageDefinitions;

  return newWordData;
};
