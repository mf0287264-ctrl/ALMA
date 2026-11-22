"use client";

import React from "react";
import { useParams } from "next/navigation";
import MessagesClient from "../MessagesClient";

export default function MessageUsernamePage() {
  const params = useParams();
  const username =
    typeof params?.username === "string"
      ? params.username
      : Array.isArray(params?.username)
      ? params.username[0]
      : undefined;

  return <MessagesClient initialPartnerId={username} />;
}
