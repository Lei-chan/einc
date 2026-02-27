import wordsDev from "@/app/ModelsDev/UserWord";
import { LISTS_ONE_PAGE } from "../config/settings";

// export const getMatchedWordsCurPage = (value: string, curPage: number) => {
//   const indexFrom = (curPage - 1) * LISTS_ONE_PAGE;
//   const indexTo = indexFrom + LISTS_ONE_PAGE;

//   // change it later by connecting to server
//   // get words that match the value
//   const matchedWords = value
//     ? wordsDev.filter((word) => word.name.includes(value))
//     : wordsDev;
//   console.log(indexFrom, indexTo);
//   // get only words that are needed to curPage
//   const matchedWordsCurPage = matchedWords.slice(indexFrom, indexTo);

//   return {
//     numberOfMatchedWords: matchedWords.length,
//     matchedWordsCurPage: matchedWordsCurPage,
//   };
// };
