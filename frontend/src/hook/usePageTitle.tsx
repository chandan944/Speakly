import { useEffect } from "react";

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = "Talksy | " + title;
  }, [title]);
};
