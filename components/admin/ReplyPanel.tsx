"use client";

import { useState } from "react";
import ReplyForm, { type ComposeInitial } from "./ReplyForm";
import SentEmailsList from "./SentEmailsList";

export default function ReplyPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [compose, setCompose] = useState<ComposeInitial | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  const handleCompose = (initial: ComposeInitial) => {
    setCompose(initial);
    setFormKey((k) => k + 1); // force le remount du formulaire pour appliquer les nouvelles valeurs
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <ReplyForm
        key={formKey}
        initial={compose}
        onSent={() => setRefreshKey((k) => k + 1)}
      />
      <SentEmailsList refreshKey={refreshKey} onCompose={handleCompose} />
    </div>
  );
}
