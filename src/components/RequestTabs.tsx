import React, { useState, useEffect } from "react";
import { Plus, X, Eye, EyeOff, Copy } from "lucide-react";
import type { RequestType, HeaderType } from "../types/postman";
import { v4 as uuid4 } from "uuid";
import useCollections from "../hooks/useCollections";
import useTab from "../hooks/useTab";

type RequestTabsProps = {
  activeTabData: {
    collectionId: string;
    folderId: string;
    requestId: string;
    originalRequest: RequestType;
    tabId: string;
  };
};

type TabType = "headers" | "body" | "params" | "auth";

type HeaderWithId = HeaderType & { id: string };
type ParamWithId = { id: string; key: string; value: string; enabled: boolean };
export type AuthConfig = {
  type: "none" | "bearer" | "basic" | "api-key" | "oauth2";
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiValue?: string;
  addTo?: "header" | "query";
};

const RequestTabs: React.FC<RequestTabsProps> = ({ activeTabData }) => {
  const [activeTab, setActiveTab] = useState<TabType>("headers");
  const { updateRequest } = useCollections();
  const { updateOpenTabRequest } = useTab();
  const { collectionId, folderId, requestId } = activeTabData;
  // Generate unique IDs for headers to prevent focus loss
  const [headers, setHeaders] = useState<HeaderWithId[]>(() => {
    const originalHeaders = activeTabData.originalRequest.headers || [];
    if (originalHeaders.length === 0) {
      // ✅ Always add default Content-Type header + an empty one
      return [
        { id: uuid4(), key: "Content-Type", value: "application/json" },
        { id: uuid4(), key: "", value: "" },
      ];
    }

    // ✅ If user saved headers before, but none contain Content-Type, add it
    const hasContentType = originalHeaders.some(
      (h) => h.key.toLowerCase() === "content-type"
    );
    const mapped = originalHeaders.map((h) => ({ ...h, id: uuid4() }));
    return hasContentType
      ? mapped
      : [
          { id: uuid4(), key: "Content-Type", value: "application/json" },
          ...mapped,
        ];
  });

  const [body, setBody] = useState<string>(
    activeTabData.originalRequest.body || ""
  );

  const [bodyType, setBodyType] = useState<
    "none" | "raw" | "form-data" | "x-www-form-urlencoded"
  >("raw");
  const [contentType, setContentType] = useState<string>("application/json");
  const [showValues, setShowValues] = useState<boolean>(true);

  // Query Parameters
  const [params, setParams] = useState<ParamWithId[]>([
    { id: crypto.randomUUID(), key: "", value: "", enabled: true },
  ]);

  // Auth Configuration
  const [authConfig, setAuthConfig] = useState<AuthConfig>({ type: "none" });

  // Parse URL params when URL changes
  useEffect(() => {
    const url = activeTabData.originalRequest.url;
    if (url && url.includes("?")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const parsedParams: ParamWithId[] = [];
      urlParams.forEach((value, key) => {
        parsedParams.push({
          id: crypto.randomUUID(),
          key,
          value,
          enabled: true,
        });
      });
      if (parsedParams.length > 0) {
        setParams(parsedParams);
      }
    }
  }, [activeTabData.originalRequest.url]);

  useEffect(() => {
    updateRequest(collectionId, folderId, requestId, { body });
  }, [body, collectionId, folderId, requestId, updateRequest]);
  console.log({ collectionId });

  // ✅ Sync headers to store (remove local id)
  useEffect(() => {
    const headersWithoutId = headers.map(({ key, value }) => ({ key, value }));
    updateRequest(collectionId, folderId, requestId, {
      headers: headersWithoutId,
    });
  }, [headers, collectionId, folderId, requestId, updateRequest]);

  // ✅ Sync params to store (update URL)
  useEffect(() => {
    const baseUrl = activeTabData.originalRequest.url.split("?")[0];
    const query = params
      .filter((p) => p.enabled && p.key)
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");

    updateRequest(collectionId, folderId, requestId, {
      url: query ? `${baseUrl}?${query}` : baseUrl,
    });
  }, [params, updateRequest]);

  useEffect(() => {
    const headersWithoutId = headers.map(({ key, value }) => ({ key, value }));
    updateRequest(collectionId, folderId, requestId, {
      headers: headersWithoutId,
    });

    // ✅ Sync with openTabs
    updateOpenTabRequest(collectionId, folderId, requestId, {
      headers: headersWithoutId,
    });
  }, [headers]);
  useEffect(() => {
    // ✅ Sync with openTabs
    updateOpenTabRequest(collectionId, folderId, requestId, {
      body,
    });
  }, [body]);

  // ✅ Sync auth to store
  useEffect(() => {
    updateRequest(collectionId, folderId, requestId, { auth: authConfig });
  }, [authConfig]);

  // Header functions
  const addHeader = () => {
    setHeaders([...headers, { id: crypto.randomUUID(), key: "", value: "" }]);
  };
  const updateHeader = (id: string, field: "key" | "value", value: string) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const removeHeader = (id: string) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((h) => h.id !== id));
    }
  };

  // Params Management
  const addParam = () => {
    setParams([
      ...params,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const updateParam = (
    id: string,
    field: "key" | "value" | "enabled",
    value: string | boolean
  ) => {
    setParams(params.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeParam = (id: string) => {
    if (params.length > 1) {
      setParams(params.filter((p) => p.id !== id));
    }
  };

  // Auth Management
  const updateAuth = (field: keyof AuthConfig, value: any) => {
    setAuthConfig((prev) => ({ ...prev, [field]: value }));
  };

  const copyAuthToClipboard = () => {
    if (authConfig.type === "bearer" && authConfig.token) {
      navigator.clipboard.writeText(authConfig.token);
    } else if (authConfig.type === "api-key" && authConfig.apiValue) {
      navigator.clipboard.writeText(authConfig.apiValue);
    }
  };

  // Tab Content Components
  const HeadersTab = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-text-primary font-medium">Request Headers</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-bg-secondary hover:bg-bg-secondary/80 rounded transition-colors text-text-primary"
          >
            {showValues ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {showValues ? "Hide" : "Show"} Values
          </button>
          <button
            onClick={addHeader}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent-blue hover:bg-accent-blue/80 text-white rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Header
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {headers.map((header) => (
          <div key={header.id} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Header name"
              value={header.key}
              onChange={(e) => updateHeader(header.id, "key", e.target.value)}
              className="flex-1 bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            <input
              type={showValues ? "text" : "password"}
              placeholder="Header value"
              value={header.value}
              onChange={(e) => updateHeader(header.id, "value", e.target.value)}
              className="flex-1 bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            {headers.length > 1 && (
              <button
                onClick={() => removeHeader(header.id)}
                className="p-2 text-text-muted hover:text-accent-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {headers.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p className="mb-2">No headers added yet</p>
          <button
            onClick={addHeader}
            className="text-accent-blue hover:text-accent-blue/80 text-sm"
          >
            Add your first header
          </button>
        </div>
      )}
    </div>
  );

  const BodyTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-text-primary font-medium">Request Body</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Body Type:</span>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value as any)}
            className="bg-bg-secondary border border-bg-secondary rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
          >
            <option value="none">None</option>
            <option value="raw">Raw</option>
            <option value="form-data">Form Data</option>
            <option value="x-www-form-urlencoded">URL Encoded</option>
          </select>
        </div>
      </div>

      {bodyType === "none" && (
        <div className="text-center py-8 text-text-muted">
          <p>No body content for this request</p>
        </div>
      )}

      {bodyType === "raw" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-text-secondary">Content Type:</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="bg-bg-secondary border border-bg-secondary rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="application/json">JSON</option>
              <option value="text/plain">Text</option>
              <option value="application/xml">XML</option>
              <option value="text/html">HTML</option>
            </select>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              contentType === "application/json"
                ? '{\n  "key": "value"\n}'
                : "Enter raw body content here..."
            }
            className="w-full h-64 bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue font-mono resize-none"
          />
        </div>
      )}
    </div>
  );

  const ParamsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-text-primary font-medium">Query Parameters</h4>
        <button
          onClick={addParam}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-accent-blue hover:bg-accent-blue/80 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Parameter
        </button>
      </div>

      <div className="space-y-2">
        {params.map((param) => (
          <div key={param.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={param.enabled}
              onChange={(e) =>
                updateParam(param.id, "enabled", e.target.checked)
              }
              className="w-4 h-4 text-accent-blue bg-bg-secondary border-bg-secondary rounded focus:ring-accent-blue"
            />
            <input
              type="text"
              placeholder="Parameter name"
              value={param.key}
              onChange={(e) => updateParam(param.id, "key", e.target.value)}
              className="flex-1 bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            <input
              type="text"
              placeholder="Parameter value"
              value={param.value}
              onChange={(e) => updateParam(param.id, "value", e.target.value)}
              className="flex-1 bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            {params.length > 1 && (
              <button
                onClick={() => removeParam(param.id)}
                className="p-2 text-text-muted hover:text-accent-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {params.filter((p) => p.key || p.value).length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p className="mb-2">No query parameters added yet</p>
          <p className="text-sm">
            Add parameters or they will be parsed from the URL automatically
          </p>
        </div>
      )}
    </div>
  );

  const AuthTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-text-primary font-medium">Authorization</h4>
        <select
          value={authConfig.type}
          onChange={(e) => updateAuth("type", e.target.value)}
          className="bg-bg-secondary border border-bg-secondary rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
          <option value="oauth2">OAuth 2.0</option>
        </select>
      </div>

      {authConfig.type === "bearer" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Bearer token"
              value={authConfig.token || ""}
              onChange={(e) => updateAuth("token", e.target.value)}
              className="flex-1 bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue font-mono"
            />
            <button
              onClick={copyAuthToClipboard}
              className="p-2 text-text-muted hover:text-accent-blue transition-colors"
              title="Copy token"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-text-muted">
            Token will be sent as: Authorization: Bearer{" "}
            {authConfig.token || "[token]"}
          </p>
        </div>
      )}

      {authConfig.type === "basic" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={authConfig.username || ""}
            onChange={(e) => updateAuth("username", e.target.value)}
            className="w-full bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <input
            type="password"
            placeholder="Password"
            value={authConfig.password || ""}
            onChange={(e) => updateAuth("password", e.target.value)}
            className="w-full bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <p className="text-xs text-text-muted">
            Credentials will be base64 encoded and sent as Authorization header
          </p>
        </div>
      )}

      {authConfig.type === "api-key" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Key name"
            value={authConfig.apiKey || ""}
            onChange={(e) => updateAuth("apiKey", e.target.value)}
            className="w-full bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <input
            type="text"
            placeholder="API key value"
            value={authConfig.apiValue || ""}
            onChange={(e) => updateAuth("apiValue", e.target.value)}
            className="w-full bg-bg-secondary border border-bg-secondary rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue font-mono"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Add to:</span>
            <select
              value={authConfig.addTo || "header"}
              onChange={(e) => updateAuth("addTo", e.target.value)}
              className="bg-bg-secondary border border-bg-secondary rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="header">Header</option>
              <option value="query">Query Params</option>
            </select>
          </div>
        </div>
      )}

      {authConfig.type === "oauth2" && (
        <div className="text-center py-8 text-text-muted">
          <p>OAuth 2.0 configuration</p>
          <p className="text-sm mt-1">Coming soon...</p>
        </div>
      )}

      {authConfig.type === "none" && (
        <div className="text-center py-8 text-text-muted">
          <p>No authentication configured</p>
          <p className="text-sm mt-1">
            Select an auth type from the dropdown above
          </p>
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      id: "headers",
      label: "Headers",
      count: headers.filter((h) => h.key || h.value).length,
    },
    { id: "body", label: "Body", count: bodyType !== "none" ? 1 : 0 },
    {
      id: "params",
      label: "Params",
      count: params.filter((p) => p.enabled && (p.key || p.value)).length,
    },
    { id: "auth", label: "Auth", count: authConfig.type !== "none" ? 1 : 0 },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-bg-secondary">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "text-accent-blue border-b-2 border-accent-blue bg-bg-secondary/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary/20"
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-accent-blue/20 text-accent-blue rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-64">
        {activeTab === "headers" && <HeadersTab />}
        {activeTab === "body" && <BodyTab />}
        {activeTab === "params" && <ParamsTab />}
        {activeTab === "auth" && <AuthTab />}
      </div>
    </div>
  );
};

export default RequestTabs;
