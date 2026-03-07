"use client";
// react
import { use, useEffect, useState } from "react";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// components
import Logo from "@/app/[language]/Components/Logo";
import LinkAddVocab from "@/app/[language]/Components/LinkAddVocab";
import PMessage from "@/app/[language]/Components/PMessage";
// dal
import { getUserWordsStatuses } from "@/app/lib/dal";
// methods
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
} from "@/app/lib/helper";
// types
import { Language, TYPE_DISPLAY_MESSAGE } from "@/app/lib/config/type";
import { Message } from "@/app/lib/definitions";
//libraries
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

export default function Collection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="w-full h-fit flex flex-col items-center gap-12">
      <Top language={language} collectionId={id} />
      <ContentContainer language={language} pathname={pathname} />
      <Graphs language={language} collectionId={id} />
    </div>
  );
}

function Top({
  language,
  collectionId,
}: {
  language: Language;
  collectionId: string;
}) {
  return (
    <div className="relative w-full h-14 flex flex-row items-center mt-1">
      <Logo />
      <div className="absolute w-[55%] h-[70%] flex flex-row items-center justify-end right-4 text-center">
        <LinkAddVocab language={language} collectionId={collectionId} />
      </div>
    </div>
  );
}

function ContentContainer({
  language,
  pathname,
}: {
  language: Language;
  pathname: string;
}) {
  return (
    <div className="w-[90%] h-[65vh] grid grid-cols-2 row-span-2 justify-items-center place-content-evenly">
      <LinkContent
        language={language}
        pathname={pathname}
        name={{ en: "List", ja: "リスト" }}
      />
      <LinkContent
        language={language}
        pathname={pathname}
        name={{ en: "Flashcard", ja: "暗記帳" }}
      />
      <LinkContent
        language={language}
        pathname={pathname}
        name={{ en: "Quiz", ja: "クイズ" }}
      />
      <LinkContent
        language={language}
        pathname={pathname}
        name={{ en: "Journal", ja: "ジャーナル" }}
      />
    </div>
  );
}

function LinkContent({
  language,
  pathname,
  name,
}: {
  language: Language;
  pathname: string;
  name: Message;
}) {
  const href = `${pathname}/${name.en.toLowerCase()}`;

  return (
    <Link
      href={href}
      className="w-[120px] aspect-square text-center flex flex-col justify-center bg-gradient-to-l from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 rounded-md text-white text-xl font-semibold tracking-widest shadow-md shadow-black/20"
    >
      {name[language]}
    </Link>
  );
}

function Graphs({
  language,
  collectionId,
}: {
  language: Language;
  collectionId: string;
}) {
  const [statuses, setStatuses] = useState<number[]>();
  const [messageData, setMessageData] = useState<TYPE_DISPLAY_MESSAGE>();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  );

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await getUserWordsStatuses(collectionId);
      if (!statuses) {
        setMessageData({
          type: "error",
          message: getGenericErrorMessage(language),
        });
        return;
      }
      setStatuses(statuses);
    };
    fetchStatuses();
  }, [collectionId]);

  return (
    <div className="w-full h-fit bg-gradient-to-tl from-red-600/50 to-red-400/50 px-3 py-5">
      <h2 className="text-xl">
        {language === "en" ? "Your Progress" : "あなたの進捗"}
      </h2>
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      {statuses && statuses.length === 0 && (
        <p className="w-full text-center mt-2">
          {language === "en"
            ? "No words added yet"
            : "単語が登録されていません"}
        </p>
      )}
      {statuses && statuses.length > 0 && (
        <div className="relative w-full h-fit bg-white rounded flex flex-col gap-8 mt-5 py-3 items-center">
          <PieGraph language={language} statuses={statuses} />
          {/* <LineGraph wordStatusData={wordStatusData} /> */}
        </div>
      )}
    </div>
  );
}

function PieGraph({
  language,
  statuses,
}: {
  language: Language;
  statuses: number[];
}) {
  return (
    <Pie
      // options={{
      //   plugins: {
      //     title: {
      //       display: false,
      //       text: "Your Progress",
      //       color: "brown",
      //     },
      //   },
      // }}
      data={{
        labels:
          language === "en"
            ? [
                "New",
                "Seen Once",
                "Getting Familier",
                "Remembered",
                "Strong Memory",
                "Mastered",
              ]
            : [
                "新しい",
                "一度確認済み",
                "慣れてきた",
                "覚えた",
                "深く覚えた",
                "習得済み",
              ],
        datasets: [
          {
            label: language === "en" ? "Number of words" : "単語数",
            data: statuses,
            backgroundColor: [
              "rgba(255, 99, 132, 0.9)",
              "rgba(255, 206, 86, 0.9)",
              "rgba(54, 162, 235, 0.9)",
              "rgba(75, 192, 192, 0.9)",
              "rgb(89, 238, 2, 0.9)",
              "rgb(255, 115, 0.9)",
            ],
          },
        ],
      }}
    />
  );
}

// function LineGraph({ wordStatusData }: { wordStatusData: number[] }) {
//   const labels = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//   ];

//   return (
//     <Line
//       options={{
//         plugins: {
//           title: { display: true, text: "Recent Progress", color: "brown" },
//           legend: {
//             position: "top" as const,
//           },
//         },
//         responsive: true,
//         maintainAspectRatio: true,
//         aspectRatio: 1.3 / 1,
//       }}
//       data={{
//         labels,
//         datasets: [
//           {
//             label: "Completed",
//             data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
//             borderColor: "rgb(255, 99, 132)",
//             backgroundColor: "rgba(255, 99, 132, 0.5)",
//           },
//           {
//             label: "Mostly completed",
//             data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
//             borderColor: "rgba(255, 206, 86)",
//             backgroundColor: "rgba(255, 206, 86, 0.5)",
//           },
//           {
//             label: "A little difficult",
//             data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
//             borderColor: "rgba(75, 192, 192)",
//             backgroundColor: "rgba(75, 192, 192, 0.5)",
//           },
//           {
//             label: "Difficult",
//             data: labels.map(() => faker.number.int({ min: -1000, max: 1000 })),
//             borderColor: "rgb(53, 162, 235)",
//             backgroundColor: "rgba(53, 162, 235, 0.5)",
//           },
//         ],
//       }}
//     />
//   );
// }
