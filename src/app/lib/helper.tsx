import { RefObject } from "react";
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

export const resizeImage = (imageFile: File) =>
  new Promise((resolve) => {
    if (!imageFile || !imageFile.name) {
      resolve(undefined);
      return;
    }

    Resizer.imageFileResizer(
      imageFile,
      500,
      400,
      "WEBP",
      100,
      0,
      (uri) => resolve(uri),
      "base64",
    );
  });

export const getSubmittedWordData = async (
  formElement: HTMLFormElement | null,
) => {
  try {
    if (!formElement) return;

    const formData = new FormData(formElement);
    const imgWordNameData = formData.get("imageWordName") as File;
    const imgDefinitionsData = formData.get("imageDefinitions") as File;
    const imgWordName = await resizeImage(imgWordNameData);
    const imgDefinitions = await resizeImage(imgDefinitionsData);

    return {
      name: formData.get("name"),
      audio: formData.get("audio"),
      definitions: String(formData.get("definitions")).split("\n"),
      examples: String(formData.get("examples")).split("\n"),
      imageWordName: imgWordName
        ? { name: imgWordNameData.name, data: imgWordName }
        : undefined,
      imageDefinitions: imgDefinitions
        ? { name: imgDefinitionsData.name, data: imgDefinitions }
        : undefined,
      // it's going to be a folder id
      folder: formData.get("folder"),
    };
  } catch (err) {
    throw err;
  }
};
