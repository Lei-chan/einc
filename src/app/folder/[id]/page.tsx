"use client";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// components
import Logo from "@/app/Components/Logo";
import LinkAddVocab from "@/app/Components/LinkAddVocab";
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
import { getUserDev, getUserWordsDev } from "@/app/lib/helper";
import { useEffect, useState } from "react";

export default function Folder() {
  return (
    <div className="w-full h-fit flex flex-col items-center gap-12">
      <Top />
      <ContentContainer />
      <Graphs />
    </div>
  );
}

function Top() {
  return (
    <div className="relative w-full h-14 flex flex-row items-center mt-1">
      <Logo />
      <div className="absolute w-[55%] h-[70%] flex flex-row items-center justify-end right-4 text-center">
        <LinkAddVocab />
      </div>
    </div>
  );
}

function ContentContainer() {
  return (
    <div className="w-[90%] h-[65vh] grid grid-cols-2 row-span-2 justify-items-center place-content-evenly">
      <LinkContent name="List" />
      <LinkContent name="Flashcard" />
      <LinkContent name="Quiz" />
      <LinkContent name="Journal" />
    </div>
  );
}

function LinkContent({ name }: { name: string }) {
  const currentPathname = usePathname();

  // Create new pathname (current pathname + lowercased link name)
  const href = `${currentPathname}/${name.toLowerCase()}`;

  return (
    <Link
      href={href}
      className="w-[120px] aspect-square text-center flex flex-col justify-center bg-gradient-to-l from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 rounded-md text-white text-xl font-semibold tracking-widest shadow-md shadow-black/20"
    >
      {name}
    </Link>
  );
}

function Graphs() {
  const [wordStatusData, setWordStatusData] = useState<number[]>(
    new Array(6).fill(0),
  );
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

  const accessToken = "iiii";

  useEffect(() => {
    // I will connect it to server with await later
    const setUserWordStates = async () => {
      try {
        const user = getUserDev(accessToken);
        if (!user) throw new Error("User not found");

        const userWords = getUserWordsDev(user._id);
        setWordStatusData((prev) => {
          const newStatus = [...prev];
          userWords.forEach((word) => {
            newStatus[word.status] += 1;
          });
          return newStatus;
        });
      } catch (err: unknown) {
        console.error("Error", err);
      }
    };

    (async () => await setUserWordStates())();
  }, []);

  return (
    <div className="w-full h-fit bg-gradient-to-tl from-red-600/50 to-red-400/50 px-3 py-5">
      <h2 className="text-xl">Your Progress</h2>
      <div className="relative w-full h-fit bg-white rounded flex flex-col gap-8 mt-5 py-3 items-center">
        <PieGraph wordStatusData={wordStatusData} />
        {/* <LineGraph wordStatusData={wordStatusData} /> */}
      </div>
    </div>
  );
}

// Change the data later
function PieGraph({ wordStatusData }: { wordStatusData: number[] }) {
  return (
    <Pie
      options={{
        plugins: {
          title: {
            display: false,
            text: "Your Progress",
            color: "brown",
          },
        },
      }}
      data={{
        labels: [
          "New",
          "Seen Once",
          "Getting Familier",
          "Remembered",
          "Strong Memory",
          "Mastered",
        ],
        datasets: [
          {
            label: "Number of words",
            data: wordStatusData,
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
