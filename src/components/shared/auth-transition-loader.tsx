"use client";

import Image from "next/image";
import { CircleLoader } from "react-spinners";

export function AuthTransitionLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/images/OHO-Logo.png"
          alt="OHOPRS logo"
          width={120}
          height={120}
          className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          priority
        />
        <CircleLoader color="#39b04a" size={64} speedMultiplier={0.9} />
      </div>
    </div>
  );
}
