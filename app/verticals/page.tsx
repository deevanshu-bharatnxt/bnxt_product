"use client";

// pages/index.js (or your home page file)
import { title, subtitle } from "@/components/primitives";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation"; // For Next.js App Router (app directory)

export default function Verticals() {
  const router = useRouter();

  const handleClick = (path: string) => {
    router.push(path);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>BharatNXT&nbsp;</span>
        <br />
        <span className={title({ color: "violet", class: "mt-4" })}>
          Product&nbsp;
        </span>
        <br />
        <div className={subtitle({ class: "mt-4" })}>
          Tools to increase productivity
        </div>

        <Button onPress={() => handleClick("verticals/fetch-cc-bill")}>Fetch CC Bill</Button>
        <Button onPress={() => handleClick("verticals/fetch-cc-bill-akhil")}>Fetch CC Bill Akhil</Button>
        <Button onPress={() => handleClick("verticals/fetch-cc-bill-setu")}>Fetch CC Bill Setu</Button>
      </div>
    </section>
  );
}
