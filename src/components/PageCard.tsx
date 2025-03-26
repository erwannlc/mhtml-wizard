import type { PageData } from "@/App";
import type { FileData } from "./FileConverter";
import { useState } from "react";
import { useLanguage } from "@/LanguageContext";

import { onDownload } from "@/lib/download";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { FileDown } from "lucide-react";
import LoadingDots from "./loaders/LoadingDots";
import FileConverter from "./FileConverter";

export interface Props extends Omit<PageData, "id" | "title"> {
  addPage: (fileData: FileData, isFirst: boolean) => void;
  checkDuplicates: (filename: string) => boolean;
  cancel: () => void;
}

export default function PageCard({ fileData, addPage, checkDuplicates, cancel }: Props) {
  const { RESET, DOWNLOAD_HTML_FILE } = useLanguage();
  const [loading, setLoading] = useState(true);

  async function handleDownload() {
    if (!fileData) {
      console.error("no file data");
    } else {
      onDownload(fileData);
    }
  }

  return (
    <Card
      className={cn("w-full h-full overflow-hidden items-center relative p-4", {
        "justify-start": fileData,
      })}
    >
      {fileData ? (
        <>
          <CardHeader className="w-full bg-accent/50 rounded-md p-4">
            <CardDescription className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-sm font-light">{fileData?.filename}</p>
              <div className="flex flex-col md:flex-row gap-8">
                <Button onClick={cancel} variant={"outline"} className="cursor-pointer">
                  {RESET}
                </Button>
                <Button onClick={handleDownload} className="cursor-pointer">
                  {DOWNLOAD_HTML_FILE}
                  <FileDown />
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full max-h-[80dvh] md:max-h-full flex flex-1 justify-center items-start shadow-xl p-0 rounded-sm">
            {loading && (
              <Skeleton
                className={
                  "w-full h-full bg-accent-foreground/10 flex flex-1 justify-center items-center"
                }
              >
                <LoadingDots color="black" />
              </Skeleton>
            )}
            <iframe
              srcDoc={fileData?.html}
              className={cn("w-full h-full rounded-sm", {
                hidden: loading,
              })}
              onLoad={() => {
                setLoading(false);
              }}
            />
          </CardContent>
        </>
      ) : (
        <FileConverter addPage={addPage} checkDuplicates={checkDuplicates} />
      )}
    </Card>
  );
}
