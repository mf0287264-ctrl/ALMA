"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MessagesClient from "./MessagesClient";

function MessagesContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || undefined;
  return <MessagesClient initialPartnerId={userId} />;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fff8ec]" />}>
      <MessagesContent />
    </Suspense>
  );
}
