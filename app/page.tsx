"use client"

// pages/index.js (or your home page file)
import { title, subtitle } from "@/components/primitives";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation"; // For Next.js App Router (app directory)
// import { useRouter } from 'next/router'; // For Next.js Pages Router (pages directory)

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/verticals/fetch-cc-bill");
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

        <Button onPress={handleClick}>Fetch CC Bill</Button>
      </div>
    </section>
  );
}
