import Resizer from "react-image-file-resizer";

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

const convertFilesToBuffers = async (files: (File | undefined)[]) => {
  try {
    const bufferPromises = files.map((file) =>
      file ? file.arrayBuffer() : undefined,
    );

    return Promise.all(bufferPromises);
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
      await convertFilesToBuffers([audioData, ...resizedImages]);

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
