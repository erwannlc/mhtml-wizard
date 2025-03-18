import type { FileData } from "./components/FileConverter";
import type { LanguageContextType } from "./LanguageContext";

import { useEffect, useState } from "react";
import { LanguageContext, useLanguage } from "./LanguageContext";

import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { onZipDownload } from "@/lib/download.js";
import { FolderDown, Plus, X } from "lucide-react";
import { LogoGithubOutline as Github, WorldHeroicon } from "./assets/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import PageCard from "./components/PageCard";
import { GITHUB_LINK } from "./constants.js";

export interface PageData {
  id: string;
  fileData: FileData | null;
}

export default function App() {
  const [lang, setLang] = useState<LanguageContextType>("en");
  const [pageData, setPageData] = useState<PageData[]>([emptyPage]);
  const [defaultTab, setDefaultTab] = useState(pageData[0].id.toString());
  const [newTabId, setNewTabId] = useState<string | null>(null);

  const { SITE_TITLE, NEW_TAB, CLOSE_TAB } = useLanguage();

  useEffect(() => {
    if (newTabId) {
      setDefaultTab(newTabId);
      setNewTabId(null);
    }
  }, [newTabId]);

  function toggleLang() {
    setLang(lang => (lang === "en" ? "fr" : "en"));
  }

  function cancel(pageId: string) {
    setPageData(data =>
      data.map(page =>
        page.id === pageId ? { ...page, fileData: null, title: "" } : page
      )
    );
  }
  /**
   * - Check for duplicates
   * - In multiple files case : check isFirst to replace current tab, else add new tabs */
  function addPage(originPageId: string, fileData: FileData, isFirst: boolean) {
    if (checkDuplicates(fileData.filename)) {
      console.error("this file is already converted");
      return;
    } else {
      if (isFirst) {
        setPageData(data =>
          data.map(page => (page.id === originPageId ? { ...page, fileData } : page))
        );
      } else {
        setPageData(data => [...data, { fileData, id: createPageId() }]);
      }
    }
  }

  /** return true if duplicate */
  function checkDuplicates(inputFilename: string): boolean {
    const isDuplicate = pageData
      .map(data => data.fileData?.filename)
      .some(filename => filename === inputFilename);
    return isDuplicate;
  }

  function addEmptyPage() {
    const newPageId = createPageId();
    setPageData(data => [...data, { ...emptyPage, id: newPageId }]);
    setNewTabId(newPageId.toString());
  }

  function closeTab(pageId: string) {
    const index = pageData.findIndex(page => page.id === pageId);
    setPageData(data => data.filter(page => page.id !== pageId));
    const newIndex = index === 0 ? 1 : index > 1 ? index - 1 : 0;
    setDefaultTab(pageData[newIndex].id.toString());
  }

  function handleDownload() {
    const filesData = pageData.map(page => page.fileData).filter(fileData => !!fileData);
    onZipDownload(filesData);
  }

  const disabledPlus = !pageData[pageData.length - 1].fileData;

  const disableCloseTab = pageData.length === 1;

  const showDownloadButton =
    pageData.length < 2 ||
    (pageData.length === 2 && !pageData[pageData.length - 1].fileData);

  return (
    <LanguageContext.Provider value={lang}>
      <div
        className={cn(
          "flex flex-col items-center md:py-10 p-5 md:mx-8 md:gap-8 gap-2 relative h-full"
        )}
      >
        <header className="w-full md:max-w-[90vw] gap-2 md:gap-8 mb-4 md:mb-0 flex flex-col-reverse md:flex-row justify-between items-baseline">
          <DownloadButton
            handleDownload={handleDownload}
            showDownloadButton={showDownloadButton}
          />
          <h1 className="flex justify-center items-baseline gap-8 font-bold text-4xl w-full">
            {SITE_TITLE}
            <a href={GITHUB_LINK} target="_blank">
              <Github className="w-[1.5rem] h-[1.5rem] hover:scale-110 transition-transform" />
            </a>
          </h1>
          <Button
            variant={"ghost"}
            onClick={toggleLang}
            className="font-extralight self-center cursor-pointer"
          >
            <span className={cn("font-extralight", { "font-medium": lang === "en" })}>
              en
            </span>
            |
            <span className={cn("font-extralight", { "font-medium": lang === "fr" })}>
              fr
            </span>
          </Button>
        </header>

        <Tabs
          value={defaultTab}
          onValueChange={setDefaultTab}
          className="w-[90vw] h-full"
          data-orientation="vertical"
          orientation="vertical"
        >
          <TabsList
            data-orientation="vertical"
            className="max-h-[80dvh] no-scrollbar overflow-auto overflow-x-hidden"
          >
            {pageData.map((page, i) => (
              <TabsTrigger
                value={page.id.toString()}
                className={cn("group hover:bg-background cursor-pointer pb-4", {
                  "cursor-auto": disableCloseTab,
                })}
                key={page.id}
                title={page.fileData?.filename}
              >
                <TabTriggerContent
                  page={page}
                  text={page.fileData?.title || `page ${i + 1}`}
                  closeTab={{
                    disable: disableCloseTab,
                    title: CLOSE_TAB,
                    onClose: () => closeTab(page.id),
                  }}
                />
              </TabsTrigger>
            ))}
            <TabTriggerPlus
              disable={disabledPlus}
              title={NEW_TAB}
              onClick={addEmptyPage}
            />
          </TabsList>

          {pageData.map(page => (
            <TabsContent value={page.id.toString()} key={page.id}>
              <PageCard
                fileData={page.fileData}
                addPage={(fileData, isFirst) => addPage(page.id, fileData, isFirst)}
                checkDuplicates={checkDuplicates}
                cancel={() => cancel(page.id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </LanguageContext.Provider>
  );
}

function TabTriggerContent({
  page,
  text,
  closeTab,
}: {
  page: PageData;
  text: string;
  closeTab: {
    disable: boolean;
    title: string;
    onClose: () => void;
  };
}) {
  const { fileData } = page;
  return (
    <>
      <span
        className={cn(
          "group-hover:hidden w-5 h-5 flex flex-1 justify-center items-center",
          { "group-hover:flex": closeTab.disable }
        )}
      >
        {fileData?.faviconUrl ? (
          <img src={fileData?.faviconUrl} className="w-5 h-5" />
        ) : (
          <WorldHeroicon className="w-5 h-5 text-black/30" strokeWidth={1} />
        )}
      </span>
      <span
        title={closeTab.title}
        onClick={e => {
          e.stopPropagation();
          closeTab.onClose();
        }}
        className={cn(
          "w-5 h-5 cursor-pointer hidden group-hover:flex justify-center items-center  rounded-md text-black/40 hover:text-black/80 hover:border hover-border-black ",
          {
            "group-hover:hidden": closeTab.disable,
          }
        )}
      >
        <X strokeWidth={1} className="w-5 h-5" />
      </span>
      {text}
    </>
  );
}

function TabTriggerPlus({
  disable,
  title,
  onClick,
}: {
  disable: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "self-center p-1 m-2 cursor-pointer border border-transparent rounded-md hover:bg-black/5 transition-all hover:transition-all",
        {
          "opacity-15 pointer-events-none border-none transition-all": disable,
        }
      )}
      onClick={onClick}
      title={title}
    >
      <Plus className="h-4 w-4" />
    </div>
  );
}

function DownloadButton({
  showDownloadButton,
  handleDownload,
}: {
  showDownloadButton: boolean;
  handleDownload: () => void;
}) {
  const { DOWNLOAD_ALL_FILES } = useLanguage();
  return (
    <div className="flex md:w-fit w-full">
      <Button
        className={cn("cursor-pointer", {
          "opacity-0": showDownloadButton,
        })}
        onClick={handleDownload}
      >
        <FolderDown />
        {DOWNLOAD_ALL_FILES}
      </Button>
    </div>
  );
}

function createPageId() {
  return uuidv4();
}

const emptyPage: PageData = {
  id: createPageId(),
  fileData: null,
};
