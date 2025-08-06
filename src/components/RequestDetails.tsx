import React, { useState, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";
import type { TabType } from "../hooks/useTab";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import useCollections from "../hooks/useCollections";
import useTab from "../hooks/useTab";

type RequestDetailsProps = {
  activeTabData: TabType | null;
  onResponseReceived?: (response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    duration: number;
    size: number;
    config: AxiosRequestConfig;
    isError: boolean;
  }) => void;
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const RequestDetails = ({
  activeTabData,
  onResponseReceived,
}: RequestDetailsProps) => {
  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { updateRequest } = useCollections();
  const { updateOpenTabRequest } = useTab();

  useEffect(() => {
    if (!activeTabData?.originalRequest) return;

    const incomingUrl = activeTabData.originalRequest.url || "";
    const incomingMethod = (activeTabData.originalRequest.method ||
      "GET") as HttpMethod;

    if (incomingUrl !== url) setUrl(incomingUrl);
    if (incomingMethod !== method) setMethod(incomingMethod);
  }, [
    activeTabData?.collectionId,
    activeTabData?.folderId,
    activeTabData?.requestId,
  ]);

  // Update local state when activeTabData changes
  useEffect(() => {
    if (
      !activeTabData?.collectionId ||
      !activeTabData.folderId ||
      !activeTabData.requestId
    )
      return;

    const original = activeTabData.originalRequest;
    const trimmedUrl = url.trim();

    // ✅ Only push updates if local state actually differs from store
    if (original.url === trimmedUrl && original.method === method) return;

    const payload = { url: trimmedUrl, updatedAt: Date.now(), method };

    updateRequest(
      activeTabData.collectionId,
      activeTabData.folderId,
      activeTabData.requestId,
      payload
    );
    updateOpenTabRequest(
      activeTabData.collectionId,
      activeTabData.folderId,
      activeTabData.requestId,
      payload
    );
  }, [url, method]);

  const getMethodColor = (methodType: string) => {
    const colors = {
      GET: "bg-method-get/20 text-method-get border-method-get/30",
      POST: "bg-method-post/20 text-method-post border-method-post/30",
      PUT: "bg-method-put/20 text-method-put border-method-put/30",
      DELETE: "bg-method-delete/20 text-method-delete border-method-delete/30",
      PATCH: "bg-method-patch/20 text-method-patch border-method-patch/30",
    };
    return (
      colors[methodType as keyof typeof colors] ||
      "bg-bg-secondary/20 text-text-secondary border-bg-secondary/30"
    );
  };

  if (activeTabData?.originalRequest?.body) {
    console.log(JSON.parse(activeTabData.originalRequest.body), "headerr");
  }

  const buildAxiosConfig = (): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as string,
      url: url.trim(),
      timeout: 10000,
      headers: activeTabData?.originalRequest?.headers?.reduce(
        (acc, header) => {
          acc[header.key] = header.value;
          return acc;
        },
        {} as Record<string, string>
      ),
      data: activeTabData?.originalRequest?.body
        ? JSON.parse(activeTabData.originalRequest.body)
        : undefined,
    };

    return config;
  };

  // ✅ Keep both collections and openTabs in sync when url/method changes
  useEffect(() => {
    if (
      activeTabData?.collectionId &&
      activeTabData?.folderId &&
      activeTabData?.requestId
    ) {
      const payload = { url: url.trim(), updatedAt: Date.now(), method };

      // Update main collection store
      updateRequest(
        activeTabData.collectionId,
        activeTabData.folderId,
        activeTabData.requestId,
        payload
      );

      // ✅ Sync openTabs so TabsUI & RequestDetails see live data
      updateOpenTabRequest(
        activeTabData.collectionId,
        activeTabData.folderId,
        activeTabData.requestId,
        payload
      );
    }
  }, [
    url,
    method,
    updateRequest,
    activeTabData?.collectionId,
    activeTabData?.folderId,
    activeTabData?.requestId,
  ]);

  const handleSendRequest = async () => {
    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const config = buildAxiosConfig();
      const startTime = Date.now();

      console.log("Sending request with config:", config);

      const response: AxiosResponse = await axios(config);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(
          Object.entries(response.headers).map(([key, value]) => [
            key,
            String(value),
          ])
        ),
        data: response.data,
        duration: duration,
        size: JSON.stringify(response.data).length,
        config: config,
        isError: false,
      };
      if (responseData && onResponseReceived) {
        onResponseReceived(responseData);
      }

      // Here you would implement actual request logic
      console.log(
        "Sending request:",
        {
          method,
          url,
          tabData: activeTabData,
        },
        { responseData }
      );

      // Show success message or handle response
      alert(`${method} request sent to ${url}`);
    } catch (error: unknown) {
      console.error("Request failed:", error);
      const axiosError = error as {
        message: string;
        code?: string;
        response?: {
          status?: number;
          statusText?: string;
          headers?: Record<string, string>;
          data?: object;
        };
        config?: AxiosRequestConfig;
      };
      const endTime = Date.now();

      const isCorsError =
        axiosError.message.includes("CORS") ||
        axiosError.code === "ERR_NETWORK" ||
        axiosError.response?.status === 0;

      const errorResponse = {
        status: axiosError.response?.status || 0,
        statusText: isCorsError
          ? "CORS Error"
          : axiosError.response?.statusText || "Network Error",
        headers: axiosError.response?.headers
          ? Object.fromEntries(
              Object.entries(axiosError.response.headers).map(
                ([key, value]) => [key, String(value)]
              )
            )
          : {},
        data: isCorsError
          ? {
              error: "CORS Policy Violation",
              message:
                "The request was blocked by CORS policy. Try using a proxy service.",
              originalError: axiosError.message,
              suggestions: [
                "Switch to a proxy service above",
                "Use a browser extension like 'CORS Unblock'",
                "Set up your own proxy server",
                "Contact the API provider to enable CORS",
              ],
            }
          : axiosError.response?.data || {
              error: axiosError.message,
              code: axiosError.code,
            },
        duration: endTime - Date.now(),
        size: 0,
        config: axiosError.config || {},
        originalUrl: url,
        // proxyUsed: proxyMode !== "direct",
        isError: true,
        isCorsError: isCorsError,
      };
      if (errorResponse && onResponseReceived) {
        onResponseReceived(errorResponse);
      }
      alert("Request failed!");
    } finally {
      setIsSending(false);
    }
  };

  const handleMethodSelect = (selectedMethod: HttpMethod) => {
    setMethod(selectedMethod);
    setIsMethodDropdownOpen(false);
  };

  const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  if (!activeTabData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Request Title */}
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-1 rounded text-sm font-medium border ${getMethodColor(
            method
          )}`}
        >
          {method}
        </span>
        <h2 className="text-lg font-semibold text-text-primary">
          {activeTabData.originalRequest.name || "Untitled Request"}
        </h2>
      </div>

      {/* URL Input with Method Selector */}
      <div className="flex items-center gap-2">
        {/* Method Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium
              transition-colors min-w-[100px] justify-between
              ${getMethodColor(method)}
              hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-accent-blue/50
            `}
          >
            <span>{method}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isMethodDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isMethodDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-bg-secondary border border-bg-secondary rounded-md shadow-lg z-10 min-w-[100px]">
              {methods.map((methodOption) => (
                <button
                  key={methodOption}
                  onClick={() => handleMethodSelect(methodOption)}
                  className={`
                    w-full text-left px-3 py-2 text-sm font-medium transition-colors
                    hover:bg-bg-panel focus:outline-none focus:bg-bg-panel
                    ${method === methodOption ? "bg-bg-panel" : ""}
                    ${
                      getMethodColor(methodOption).split(" ")[1]
                    } // Extract text color
                  `}
                >
                  {methodOption}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL Input */}
        <input
          type="text"
          placeholder="Enter request URL (e.g., https://api.example.com/users)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-bg-secondary border border-bg-secondary rounded-md px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isSending) {
              handleSendRequest();
            }
          }}
        />

        {/* Send Button */}
        <button
          onClick={handleSendRequest}
          disabled={isSending || !url.trim()}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all
            ${
              isSending || !url.trim()
                ? "bg-bg-secondary text-text-muted cursor-not-allowed"
                : "bg-accent-blue hover:bg-accent-blue/80 text-white hover:shadow-md"
            }
          `}
        >
          <Send className={`w-4 h-4 ${isSending ? "animate-pulse" : ""}`} />
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>

      {/* URL Info */}
      {url && (
        <div className="text-xs text-text-muted">
          <span className="font-mono bg-bg-secondary/50 px-2 py-1 rounded">
            {method} {url}
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button className="text-xs text-text-secondary hover:text-accent-blue transition-colors">
          Save
        </button>
        <span className="text-xs text-text-muted">•</span>
        <button className="text-xs text-text-secondary hover:text-accent-blue transition-colors">
          Duplicate
        </button>
        <span className="text-xs text-text-muted">•</span>
        <button className="text-xs text-text-secondary hover:text-accent-blue transition-colors">
          Export
        </button>
        {url && (
          <>
            <span className="text-xs text-text-muted">•</span>
            <button
              onClick={() => navigator.clipboard.writeText(url)}
              className="text-xs text-text-secondary hover:text-accent-blue transition-colors"
            >
              Copy URL
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
