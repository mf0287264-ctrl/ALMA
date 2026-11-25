"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import MessagesClient from "../MessagesClient";

function MessageUsernameContent() {
  const params = useParams();
  const username =
    typeof params?.username === "string"
      ? params.username
      : Array.isArray(params?.username)
      ? params.username[0]
      : undefined;

  return <MessagesClient initialPartnerId={username} />;
}

export default function MessageUsernamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <MessageUsernameContent />
    </Suspense>
  );
}
