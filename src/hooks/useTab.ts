import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RequestType } from "../types/postman";

export type TabType = {
  collectionId: string;
  folderId: string;
  requestId: string;
  originalRequest: RequestType;
  tabId: string;
};

type TabState = {
  openTabs: TabType[];
  activeTab: string | null;
  openRequest: (
    collectionId: string,
    folderId: string,
    requestId: string,
    getRequest: (cId: string, fId: string, rId: string) => RequestType
  ) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (id: string | null) => void;
  getActiveTabData: () => TabType | null;
  generateTabId: (
    collectionId: string,
    folderId: string,
    requestId: string
  ) => string;

  // ✅ NEW: Sync openTabs when request changes
  updateOpenTabRequest: (
    collectionId: string,
    folderId: string,
    requestId: string,
    data: Partial<RequestType>
  ) => void;
};

const useTab = create<TabState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      activeTab: null,

      generateTabId: (collectionId, folderId, requestId) =>
        `${collectionId}-${folderId}-${requestId}`,

      openRequest: (collectionId, folderId, requestId, getRequest) => {
        const { openTabs, generateTabId } = get();
        const tabId = generateTabId(collectionId, folderId, requestId);

        const exists = openTabs.find(
          (t) =>
            t.collectionId === collectionId &&
            t.folderId === folderId &&
            t.requestId === requestId
        );

        if (!exists) {
          try {
            const req = getRequest(collectionId, folderId, requestId);
            if (req) {
              set((state) => ({
                openTabs: [
                  ...state.openTabs,
                  {
                    collectionId,
                    folderId,
                    requestId,
                    originalRequest: req,
                    tabId,
                  },
                ],
              }));
            }
          } catch (error) {
            console.error("Failed to get request:", error);
            return;
          }
        }

        set({ activeTab: tabId });
      },

      closeTab: (tabId) => {
        set((state) => {
          const newTabs = state.openTabs.filter((t) => t.tabId !== tabId);

          let newActiveTab = state.activeTab;

          if (state.activeTab === tabId) {
            if (newTabs.length > 0) {
              const closedTabIndex = state.openTabs.findIndex(
                (t) => t.tabId === tabId
              );
              if (closedTabIndex > 0) {
                newActiveTab = newTabs[closedTabIndex - 1].tabId;
              } else if (newTabs.length > 0) {
                newActiveTab = newTabs[0].tabId;
              } else {
                newActiveTab = null;
              }
            } else {
              newActiveTab = null;
            }
          }

          return {
            openTabs: newTabs,
            activeTab: newActiveTab,
          };
        });
      },

      closeAllTabs: () => set({ openTabs: [], activeTab: null }),

      setActiveTab: (id) => set({ activeTab: id }),

      getActiveTabData: () => {
        const { activeTab, openTabs } = get();
        if (!activeTab) return null;
        return openTabs.find((t) => t.tabId === activeTab) || null;
      },

      // ✅ NEW: Sync any changes to the open tab's request
      updateOpenTabRequest: (collectionId, folderId, requestId, data) => {
        set((state) => ({
          openTabs: state.openTabs.map((tab) =>
            tab.collectionId === collectionId &&
            tab.folderId === folderId &&
            tab.requestId === requestId
              ? {
                  ...tab,
                  originalRequest: {
                    ...tab.originalRequest,
                    ...data,
                  },
                }
              : tab
          ),
        }));
      },
    }),
    {
      name: "opentab-storage",
      version: 1,
    }
  )
);

export default useTab;
