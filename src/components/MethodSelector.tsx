import { useState } from "react";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const methodColors: Record<HttpMethod, string> = {
  GET: "text-green-400",
  POST: "text-blue-400",
  PUT: "text-yellow-400",
  PATCH: "text-purple-400",
  DELETE: "text-red-400",
};

const MethodSelector = ({
  value,
  onChange,
}: {
  value: HttpMethod;
  onChange: (m: HttpMethod) => void;
}) => {
  const [open, setOpen] = useState(false);
  const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  return (
    <div className="relative w-24">
      {/* Selected Method */}
      <button
        className={`w-full border border-bg-secondary bg-bg-primary px-2 py-1 text-xs font-bold rounded flex justify-between items-center ${methodColors[value]}`}
        onClick={() => setOpen((o) => !o)}
      >
        {value}
        <span className="text-text-secondary">▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full bg-bg-panel border border-bg-secondary rounded shadow-lg z-10">
          {methods.map((m) => (
            <div
              key={m}
              className={`px-2 py-1 text-xs cursor-pointer hover:bg-bg-secondary font-bold ${methodColors[m]}`}
              onClick={() => {
                onChange(m);
                setOpen(false);
              }}
            >
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MethodSelector;
