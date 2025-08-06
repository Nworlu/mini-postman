import type { AuthConfig } from "../components/RequestTabs";

export type CollectionType = {
  id: string;
  name: string;
  folders: FolderType[];
};

export type FolderType = {
  id: string;
  name: string;
  requests: RequestType[];
};

export type RequestType = {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers: HeaderType[];
  body: string | null;
  createdAt: number; // For history tracking
  updatedAt: number;
  auth: AuthConfig;
};

export type HeaderType = {
  key: string;
  value: string;
};

export type OpenTab = {
  id: string; // Unique tab id
  request: RequestType; // Request currently being edited/sent
  isDirty: boolean; // If the request has unsaved changes
};
