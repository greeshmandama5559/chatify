import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

export default function MigrateChatCache() {
  useEffect(() => {
    (async () => {
      try {
        const res = await useChatStore.getState().migrateDecryptCache({
          batchSize: 20,
          progressCb: (done, total) => {
            console.info(`[migration] ${done}/${total}`);
          },
        });
        console.info("messagesCache migration result:", res);
      } catch (e) {
        console.error("migration error", e);
      }
    })();
  }, []);

  return null;
}
