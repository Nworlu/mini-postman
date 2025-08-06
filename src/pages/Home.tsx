import React, { useState } from "react";
import AppLayouts from "../layouts/app-layouts";
import TabsUI from "../components/TabsUI";
import useTab from "../hooks/useTab";
import RequestDetails from "../components/RequestDetails";
import RequestTabs from "../components/RequestTabs";

const HomePage = () => {
  const { getActiveTabData, openTabs } = useTab();
  const activeTabData = getActiveTabData();
  const [responseData, setResponseData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const handleResponseReceived = (responseData: Record<string, unknown>) => {
    setResponseData(responseData);
  };

  return (
    <AppLayouts>
      <div className="flex flex-col h-full max-w-6xl w-full">
        {/* Tabs Header */}
        <TabsUI />

        {/* Main Content Area */}
        <div className="flex-1 bg-bg-panel overflow-hidden w-full">
          {activeTabData ? (
            <div className="h-full flex flex-col">
              {/* Request Details Header */}
              <div className="flex-shrink-0 bg-bg-primary border-b border-bg-secondary p-4">
                <RequestDetails
                  activeTabData={activeTabData}
                  onResponseReceived={handleResponseReceived}
                />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Request Configuration */}
                  <div className="bg-bg-primary rounded-lg p-4">
                    <RequestTabs activeTabData={activeTabData} />
                  </div>

                  {/* Response Area */}
                  {/* Response Area */}
                  <div className="bg-bg-primary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-text-primary font-medium">
                        Response
                      </h3>
                      {responseData ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">
                            Status:
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              responseData.isError
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {String(responseData?.status)}{" "}
                            {String(responseData?.statusText)}
                          </span>
                          <span className="text-xs text-text-muted ml-2">
                            {String(responseData?.duration)} ms
                          </span>
                          <span className="text-xs text-text-muted">
                            {String(responseData?.size)} bytes
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">
                            Status:
                          </span>
                          <span className="px-2 py-1 text-xs bg-bg-secondary text-text-secondary rounded">
                            Not sent
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border border-bg-secondary rounded">
                      {/* Response Tabs */}
                      <div className="border-b border-bg-secondary">
                        <div className="flex">
                          <button className="px-4 py-2 text-sm font-medium text-accent-blue border-b-2 border-accent-blue bg-bg-secondary/30">
                            Body
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary/20">
                            Headers
                          </button>
                        </div>
                      </div>

                      {/* Response Content */}
                      <div className="p-4 min-h-48 bg-bg-secondary/20 text-sm font-mono text-text-primary whitespace-pre-wrap break-words">
                        {!responseData ? (
                          <div className="flex items-center justify-center h-full text-text-muted">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto mb-3 opacity-40">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-full h-full"
                                >
                                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7" />
                                </svg>
                              </div>
                              <p className="text-sm">
                                Send a request to see the response
                              </p>
                            </div>
                          </div>
                        ) : responseData.isError ? (
                          <div className="text-red-400">
                            <strong>Error:</strong>{" "}
                            {JSON.stringify(responseData.data, null, 2)}
                          </div>
                        ) : (
                          <div>
                            {JSON.stringify(responseData.data, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 opacity-20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-full h-full text-text-muted"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-text-primary text-lg font-medium mb-2">
                  No Request Selected
                </h3>
                <p className="text-text-muted">
                  {openTabs.length === 0
                    ? "Open a request from the sidebar to get started"
                    : "Select a tab to view the request details"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayouts>
  );
};

export default HomePage;
