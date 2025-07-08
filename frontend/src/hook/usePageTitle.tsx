import { useEffect } from "react";

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = "Speakly | " + title;
  }, [title]);
};
