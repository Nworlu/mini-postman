import {
  ChevronDown,
  ChevronRight,
  File,
  FilePlus,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import useCollections from "../hooks/useCollections";
import MethodSelector, { type HttpMethod } from "./MethodSelector";
import useTab from "../hooks/useTab";

const Sidebar = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState<string | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isAddRequestOpen, setIsAddRequestOpen] = useState<{
    colId: string;
    folderId: string;
  } | null>(null);
  const [newRequestName, setNewRequestName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const {
    addCollection,
    collections,
    addFolderToCollection,
    addRequestToCollection,
    getRequest,
    deleteCollection,
    deleteFolder,
    deleteRequest,
  } = useCollections();

  const { openRequest } = useTab();

  const handleAddCollection = () => setIsAddModalOpen(true);

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSaveFolder = (collectionId: string) => {
    if (!newFolderName.trim()) return;
    addFolderToCollection(collectionId, newFolderName);
    setNewFolderName("");
    setIsAddFolderOpen(null);
  };

  const handleSaveRequest = () => {
    if (!newRequestName.trim() || !isAddRequestOpen) return;
    addRequestToCollection(
      isAddRequestOpen.colId,
      isAddRequestOpen.folderId,
      method,
      newRequestName
    );
    setNewRequestName("");
    setIsAddRequestOpen(null);
  };

  return (
    <aside className="border-r border-bg-secondary h-full max-w-72 w-full p-3 flex flex-col bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={handleAddCollection}
          className="p-1 bg-accent-blue hover:bg-accent-orange rounded-md transition"
          title="Add Collection"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
        <input
          className="flex-1 bg-bg-panel border border-bg-secondary rounded-md px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-accent-blue"
          placeholder="Search collections"
        />
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto mt-2">
        {collections.map((col) => {
          const isOpen = expandedCollections.includes(col.id);
          return (
            <div key={col.id} className="mb-2">
              {/* Collection Header */}
              <div
                className="flex items-center justify-between px-2 py-1 bg-bg-secondary rounded-md cursor-pointer group"
                onClick={() => toggleCollection(col.id)}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  )}
                  <Folder className="w-4 h-4 text-accent-yellow" />
                  <span className="text-sm">{col.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddFolderOpen(col.id);
                    }}
                    className="p-1 hover:bg-bg-panel rounded"
                    title="Add Folder"
                  >
                    <FolderPlus className="w-4 h-4 text-accent-green" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete collection "${col.name}"?`))
                        deleteCollection(col.id);
                    }}
                    className="p-1 hover:bg-bg-panel rounded opacity-0 group-hover:opacity-100"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4 text-accent-red" />
                  </button>
                </div>
              </div>

              {/* Collection Contents */}
              {isOpen && (
                <div className="ml-6 mt-1">
                  {col.folders.length === 0 ? (
                    <p className="text-xs text-text-muted italic">
                      No folders yet
                    </p>
                  ) : (
                    col.folders.map((f) => {
                      const isFolderOpen = expandedFolders.includes(f.id);
                      return (
                        <div key={f.id} className="mb-1">
                          {/* Folder Header */}
                          <div
                            className="flex items-center justify-between px-2 py-1 hover:bg-bg-panel rounded-md cursor-pointer group"
                            onClick={() => toggleFolder(f.id)}
                          >
                            <div className="flex items-center gap-2">
                              {isFolderOpen ? (
                                <ChevronDown className="w-3 h-3 text-text-secondary" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-text-secondary" />
                              )}
                              📂 <span className="text-xs">{f.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAddRequestOpen({
                                    colId: col.id,
                                    folderId: f.id,
                                  });
                                }}
                                className="p-1 hover:bg-bg-panel rounded"
                                title="Add Request"
                              >
                                <FilePlus className="w-3 h-3 text-accent-blue" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete folder "${f.name}"?`))
                                    deleteFolder(col.id, f.id);
                                }}
                                className="p-1 hover:bg-bg-panel rounded opacity-0 group-hover:opacity-100"
                                title="Delete Folder"
                              >
                                <Trash2 className="w-3 h-3 text-accent-red" />
                              </button>
                            </div>
                          </div>

                          {/* Requests */}
                          {isFolderOpen && (
                            <div className="ml-6 mt-1">
                              {f.requests.length === 0 ? (
                                <p className="text-xs text-text-muted italic">
                                  No requests yet
                                </p>
                              ) : (
                                f.requests.map((r) => (
                                  <div
                                    key={r.id}
                                    className="flex items-center justify-between group"
                                  >
                                    <button
                                      onClick={() => {
                                        openRequest(
                                          col.id,
                                          f.id,
                                          r.id,
                                          getRequest
                                        );
                                      }}
                                      className="flex items-center gap-1 py-1 px-2 text-xs hover:bg-bg-panel rounded flex-1 text-left"
                                    >
                                      <File className="w-3 h-3 text-accent-blue" />
                                      <span>{r.method}</span>
                                      <span>{r.name}</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          confirm(`Delete request "${r.name}"?`)
                                        )
                                          deleteRequest(col.id, f.id, r.id);
                                      }}
                                      className="p-1 hover:bg-bg-panel rounded opacity-0 group-hover:opacity-100"
                                      title="Delete Request"
                                    >
                                      <Trash2 className="w-3 h-3 text-accent-red" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Add Folder Input */}
              {isAddFolderOpen === col.id && (
                <div className="ml-6 mt-2">
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-bg-panel border border-bg-secondary rounded px-2 py-1 text-xs mb-1"
                    placeholder="Folder name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveFolder(col.id)}
                      className="bg-accent-green text-white text-xs px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAddFolderOpen(null)}
                      className="bg-accent-red text-white text-xs px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Add Request Input */}
              {isAddRequestOpen?.colId === col.id &&
                isAddRequestOpen.folderId && (
                  <div className="ml-12 mt-2 bg-bg-panel p-2 rounded-md">
                    <input
                      value={newRequestName}
                      onChange={(e) => setNewRequestName(e.target.value)}
                      className="w-full bg-bg-primary border border-bg-secondary rounded px-2 py-1 text-xs mb-2"
                      placeholder="Request name"
                    />
                    <MethodSelector value={method} onChange={setMethod} />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveRequest}
                        className="bg-accent-green text-white text-xs px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsAddRequestOpen(null)}
                        className="bg-accent-red text-white text-xs px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Add Collection Modal */}
      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-bg-panel p-4 rounded-lg w-64 border border-bg-secondary shadow-lg">
            <h2 className="text-sm font-semibold mb-2 text-text-primary">
              New Collection
            </h2>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full bg-bg-primary border border-bg-secondary rounded px-2 py-1 text-sm mb-3 text-text-primary focus:outline-none focus:border-accent-blue"
              placeholder="Collection name"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1 bg-bg-secondary hover:bg-accent-red rounded text-xs text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addCollection(newCollectionName);
                  setNewCollectionName("");
                  setIsAddModalOpen(false);
                }}
                disabled={!newCollectionName.trim()}
                className="px-3 py-1 bg-accent-green hover:bg-accent-blue rounded text-xs text-white transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
