// import Image from "next/image";
import FormComponent from "./FormComponent";
import { NewsCard } from "./NewsCard";
import PredictionChart from "./PredictionChart";

export default function Home() {
  return (
    <>
      <FormComponent />
      {/* <NewsCard /> */}
      <PredictionChart />
    </>
  );
}
