import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { CollectionType, RequestType } from "../types/postman";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type CollectionsState = {
  collections: CollectionType[];
  setCollections: (collections: CollectionType[]) => void;
  addCollection: (name: string) => void;
  deleteCollection: (collectionId: string) => void;
  deleteFolder: (collectionId: string, folderId: string) => void;
  deleteRequest: (
    collectionId: string,
    folderId: string,
    requestId: string
  ) => void;
  addFolderToCollection: (collectionId: string, name: string) => void;
  addRequestToCollection: (
    collectionId: string,
    folderId: string,
    requestType: HttpMethod,
    name: string
  ) => void;
  updateRequest: (
    collectionId: string,
    folderId: string,
    requestId: string,
    updatedData: Partial<RequestType>
  ) => void;
  getRequest: (
    collectionId: string,
    folderId: string,
    requestId: string
  ) => RequestType;
};

const useCollections = create<CollectionsState>()(
  persist(
    (set, get) => ({
      collections: [],

      setCollections: (collections) => set({ collections }),

      deleteCollection: (collectionId) => {
        set((state) => ({
          collections: state.collections.filter(
            (col) => col.id !== collectionId
          ),
        }));
      },

      deleteFolder: (collectionId, folderId) => {
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  folders: col.folders.filter(
                    (folder) => folder.id !== folderId
                  ),
                }
              : col
          ),
        }));
      },
      deleteRequest: (collectionId, folderId, requestId) => {
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  folders: col.folders.map((folder) =>
                    folder.id === folderId
                      ? {
                          ...folder,
                          requests: folder.requests.filter(
                            (request) => request.id !== requestId
                          ),
                        }
                      : folder
                  ),
                }
              : col
          ),
        }));
      },

      addCollection: (name) => {
        set((state) => ({
          collections: [
            ...state.collections,
            { id: uuidv4(), name, folders: [] },
          ],
        }));
      },

      addFolderToCollection: (collectionId, name) => {
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  folders: [
                    ...collection.folders,
                    { id: uuidv4(), name, requests: [] },
                  ],
                }
              : collection
          ),
        }));
      },

      addRequestToCollection: (collectionId, folderId, requestType, name) => {
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  folders: collection.folders.map((folder) =>
                    folder.id === folderId
                      ? {
                          ...folder,
                          requests: [
                            ...folder.requests,
                            {
                              id: uuidv4(),
                              method: requestType,
                              name,
                              createdAt: Date.now(),
                              updatedAt: Date.now(),
                              url: "",
                              headers: [
                                {
                                  key: "Content-Type",
                                  value: "application/json",
                                },
                              ],
                              body: "",
                              auth: {
                                type: "none", // Default auth configuration
                              },
                            },
                          ],
                        }
                      : folder
                  ),
                }
              : collection
          ),
        }));
      },

      updateRequest: (collectionId, folderId, requestId, updatedData) => {
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  folders: collection.folders.map((folder) =>
                    folder.id === folderId
                      ? {
                          ...folder,
                          requests: folder.requests.map((req) =>
                            req.id === requestId
                              ? {
                                  ...req,
                                  ...updatedData,
                                  updatedAt: Date.now(),
                                }
                              : req
                          ),
                        }
                      : folder
                  ),
                }
              : collection
          ),
        }));
      },

      getRequest: (collectionId, folderId, requestId) => {
        const collections = get().collections;
        const collection = collections.find((c) => c.id === collectionId);
        if (!collection) throw new Error("Collection not found");

        const folder = collection.folders.find((f) => f.id === folderId);
        if (!folder) throw new Error("Folder not found");

        const request = folder.requests.find((r) => r.id === requestId);
        if (!request) throw new Error("Request not found");

        return request;
      },
    }),
    {
      name: "collections-storage", // key for localStorage
    }
  )
);

export default useCollections;
