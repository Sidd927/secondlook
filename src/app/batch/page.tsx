import type { Metadata } from "next";
import { BatchChecker } from "@/components/BatchChecker";

export const metadata: Metadata = {
  title: "Batch check: SecondLook",
  description: "Screen a whole intake list or garage-sale inventory against CPSC recalls and federal sale bans at once.",
};

export default function BatchPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-14">
      <p className="eyebrow">For thrift stores, donation drives &amp; sellers</p>
      <h1 className="serif mt-3 max-w-3xl text-[48px] leading-[1.02] sm:text-[60px]">Screen a whole donation pile at once.</h1>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-2">
        Selling a recalled product is illegal for resale and thrift stores too, and the CPSC publishes a{" "}
        <a
          className="underline underline-offset-4"
          href="https://www.cpsc.gov/Business--Manufacturing/Business-Education/ResaleThrift-Stores-Information-Center"
        >
          dedicated guide for them
        </a>
        . Paste an intake list or garage-sale inventory, one item per line. Every line is checked against CPSC recalls and federal sale
        bans.
      </p>
      <div className="mt-10">
        <BatchChecker />
      </div>
    </div>
  );
}
