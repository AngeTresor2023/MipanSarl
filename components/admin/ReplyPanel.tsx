"use client";

import { useState } from "react";
import ReplyForm from "./ReplyForm";
import SentEmailsList from "./SentEmailsList";

export default function ReplyPanel() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <ReplyForm onSent={() => setRefreshKey((k) => k + 1)} />
      <SentEmailsList refreshKey={refreshKey} />
    </div>
  );
}
