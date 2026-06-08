"use client";

import { CircleLoader } from "react-spinners";

export function AuthTransitionLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-6">
        <CircleLoader color="#39b04a" size={64} speedMultiplier={0.9} />
      </div>
    </div>
  );
}
