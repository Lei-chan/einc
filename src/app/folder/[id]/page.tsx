"use client";
import LinkAddVocab from "@/app/Components/LinkAddVocab";
import Logo from "@/app/Components/Logo";
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
  plugins,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { use } from "react";
import { time } from "console";

export default function Folder({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="w-screen h-fit flex flex-col items-center gap-12">
      <Top />
      <ContentContainer />
      <Graph />
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
      <ButtonContent name="List" />
      <ButtonContent name="Flashcard" />
      <ButtonContent name="Quiz" />
      <ButtonContent name="Journal" />
    </div>
  );
}

function ButtonContent({ name }: { name: string }) {
  return (
    <button className="w-[120px] aspect-square text-center bg-gradient-to-l from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 rounded-md text-white text-xl font-semibold tracking-widest shadow-md shadow-black/20">
      {name}
    </button>
  );
}

const labels = ["January", "February", "March", "April", "May", "June", "July"];

function Graph() {
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

  return (
    <div className="w-full h-fit bg-gradient-to-tl from-red-600/50 to-red-400/50 px-3 py-5">
      <h2 className="text-xl">Your Progress</h2>
      <div className="relative w-full h-fit bg-white rounded flex flex-col gap-8 mt-5">
        <Pie
          options={{
            plugins: {
              title: {
                display: true,
                text: "Today's Progress",
                color: "brown",
              },
            },
          }}
          data={{
            labels: [
              "Completed",
              "Mostly completed",
              "A little difficult",
              "Difficult",
            ],
            datasets: [
              {
                label: "Number of words",
                data: [12, 19, 3, 5],
                backgroundColor: [
                  "rgba(255, 99, 132, 0.9)",
                  "rgba(54, 162, 235, 0.9)",
                  "rgba(255, 206, 86, 0.9)",
                  "rgba(75, 192, 192, 0.9)",
                ],
              },
            ],
          }}
        />
        <Line
          options={{
            plugins: {
              title: { display: true, text: "Recent Progress", color: "brown" },
              legend: {
                position: "top" as const,
              },
            },
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.3 / 1,
          }}
          data={{
            labels,
            datasets: [
              {
                label: "Completed",
                data: labels.map(() =>
                  faker.number.int({ min: -1000, max: 1000 }),
                ),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
              },
              {
                label: "Difficult",
                data: labels.map(() =>
                  faker.number.int({ min: -1000, max: 1000 }),
                ),
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
