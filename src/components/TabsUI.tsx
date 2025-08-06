import React from "react";
import { X } from "lucide-react";
import useTab from "../hooks/useTab";

const TabsUI = () => {
  const { openTabs, activeTab, setActiveTab, closeTab } = useTab();
  // const activeTabData = getActiveTabData();

  const getMethodColor = (method: string) => {
    const methodColors: Record<string, string> = {
      GET: "text-method-get bg-method-get/10 border-method-get/20",
      POST: "text-method-post bg-method-post/10 border-method-post/20",
      PUT: "text-method-put bg-method-put/10 border-method-put/20",
      DELETE: "text-method-delete bg-method-delete/10 border-method-delete/20",
      PATCH: "text-method-patch bg-method-patch/10 border-method-patch/20",
    };
    return (
      methodColors[method?.toUpperCase()] ||
      "text-text-secondary bg-bg-secondary/20 border-bg-secondary/40"
    );
  };

  const generateTabId = (
    collectionId: string,
    folderId: string,
    requestId: string
  ) => `${collectionId}-${folderId}-${requestId}`;

  if (openTabs.length === 0) {
    return (
      <div className="bg-bg-primary w-full h-12 border-b border-bg-secondary flex items-center justify-center">
        <span className="text-text-muted text-sm">No tabs open</span>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary w-full border-b border-bg-secondary">
      <div className="flex items-center overflow-x-auto">
        {openTabs.map((tab, index) => {
          const tabId = generateTabId(
            tab.collectionId,
            tab.folderId,
            tab.requestId
          );
          const isActive = tabId === activeTab;
          const method = tab.originalRequest?.method?.toUpperCase() || "GET";

          return (
            <div
              key={index}
              className={`relative flex items-center min-w-0 max-w-xs border-r border-bg-secondary
                ${
                  isActive
                    ? "bg-bg-panel border-b-2 border-b-accent-blue"
                    : "bg-bg-primary hover:bg-bg-secondary/50"
                }`}
            >
              <button
                onClick={() => setActiveTab(tabId)}
                className="flex items-center gap-2 px-3 py-2 min-w-0 flex-1 group"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getMethodColor(
                    method
                  )}`}
                >
                  {method}
                </span>
                <span
                  className={`text-sm truncate min-w-0 ${
                    isActive ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {tab.originalRequest?.name || "Untitled Request"}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                className={`p-1 mr-2 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-bg-secondary ${
                  isActive ? "opacity-60" : ""
                }`}
              >
                <X className="w-3 h-3 text-text-muted hover:text-text-primary" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabsUI;
