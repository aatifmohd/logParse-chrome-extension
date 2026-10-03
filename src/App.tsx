import { useState } from "react";

type LogLevel = "INFO" | "WARNING" | "ERROR";

type ParsedLog = {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, string>;
};

function App() {
  const [pageText, setPageText] = useState("");
  const [logs, setLogs] = useState<ParsedLog[]>([]);

  const [filter, setFilter] =
    useState<"ALL" | LogLevel>("ALL");

  const [error, setError] = useState("");
  const [pageRead, setPageRead] = useState(false);

  const readPage = async () => {
    setError("");
    setPageRead(false);

    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      const activeTab = tabs[0];

      if (!activeTab?.id) {
        setError("Could not find the current tab.");
        return;
      }

      const result =
        await chrome.scripting.executeScript({
          target: {
            tabId: activeTab.id
          },
          func: () => {
            return document.body?.innerText || "";
          }
        });

      const text = result[0]?.result || "";

      setPageText(text);
      setPageRead(true);
      setLogs([]);
      setFilter("ALL");
    } catch {
      setError(
        "Could not read this page. Chrome may restrict access to this page."
      );
    }
  };

  const parseLogs = () => {
    setError("");

    if (!pageText.trim()) {
      setError("Read the page first.");
      return;
    }

    const lines = pageText.split("\n");

    const parsedLogs: ParsedLog[] = [];

    for (const line of lines) {
      const cleanedLine = line.trim();

      if (!cleanedLine) {
        continue;
      }

      const match = cleanedLine.match(
        /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+(INFO|WARNING|ERROR)\s+(.*)$/
      );

      if (!match) {
        continue;
      }

      const [, timestamp, level, remainingText] =
        match;

      const metadata: Record<string, string> = {};

      const metadataMatches =
        remainingText.matchAll(
          /(\w+)=([^\s]+)/g
        );

      for (const metadataMatch of metadataMatches) {
        const [, key, value] =
          metadataMatch;

        metadata[key] = value;
      }

      const message = remainingText
        .replace(/(\w+)=([^\s]+)/g, "")
        .replace(/\s+/g, " ")
        .trim();

      parsedLogs.push({
        timestamp,
        level: level as LogLevel,
        message,
        metadata
      });
    }

    setLogs(parsedLogs);
    setFilter("ALL");

    if (parsedLogs.length === 0) {
      setError(
        "No supported logs were found on this page."
      );
    }
  };

  const filteredLogs =
    filter === "ALL"
      ? logs
      : logs.filter(
          (log) => log.level === filter
        );

  const copyLogs = async () => {
    if (filteredLogs.length === 0) {
      return;
    }

    const text = filteredLogs
      .map((log) => {
        const metadata = Object.entries(
          log.metadata
        )
          .map(
            ([key, value]) =>
              `${key}=${value}`
          )
          .join(" ");

        return `${log.timestamp} ${log.level} ${log.message}${
          metadata ? ` ${metadata}` : ""
        }`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError(
        "Could not copy the logs to the clipboard."
      );
    }
  };

  const infoCount = logs.filter(
    (log) => log.level === "INFO"
  ).length;

  const warningCount = logs.filter(
    (log) => log.level === "WARNING"
  ).length;

  const errorCount = logs.filter(
    (log) => log.level === "ERROR"
  ).length;

  const characterCount = pageText.length;

  const lineCount = pageText
    ? pageText.split("\n").length
    : 0;

  return (
    <div className="min-h-[600px] w-[520px] bg-zinc-50 p-5 text-zinc-900">

      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">
          LogParse
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Parse and clean application logs
        </p>
      </header>

      <div className="mb-4 flex gap-2">

        <button
          onClick={readPage}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
        >
          Read Page
        </button>

        <button
          onClick={parseLogs}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Parse Logs
        </button>

        <button
          onClick={copyLogs}
          disabled={filteredLogs.length === 0}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Copy
        </button>

      </div>

      {pageRead && !error && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3">

          <p className="text-xs font-semibold text-green-700">
            Page read successfully
          </p>

          <div className="mt-1 flex gap-4 text-[11px] text-green-600">

            <span>
              Characters:{" "}
              {characterCount.toLocaleString()}
            </span>

            <span>
              Lines:{" "}
              {lineCount.toLocaleString()}
            </span>

          </div>

        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-4 gap-2">

        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <p className="text-[11px] text-zinc-500">
            Total
          </p>

          <p className="mt-1 text-xl font-bold">
            {logs.length}
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-[11px] text-blue-600">
            Info
          </p>

          <p className="mt-1 text-xl font-bold text-blue-700">
            {infoCount}
          </p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-[11px] text-yellow-700">
            Warnings
          </p>

          <p className="mt-1 text-xl font-bold text-yellow-700">
            {warningCount}
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-[11px] text-red-600">
            Errors
          </p>

          <p className="mt-1 text-xl font-bold text-red-700">
            {errorCount}
          </p>
        </div>

      </div>

      <div className="mb-4 flex gap-1">

        {(
          [
            "ALL",
            "INFO",
            "WARNING",
            "ERROR"
          ] as const
        ).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
              filter === item
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {item}
          </button>
        ))}

      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

        <div className="border-b border-zinc-200 px-4 py-3">

          <h2 className="text-sm font-semibold">
            Parsed Logs
          </h2>

          <p className="mt-0.5 text-[11px] text-zinc-500">
            {filteredLogs.length} result
            {filteredLogs.length !== 1
              ? "s"
              : ""}
          </p>

        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-5 py-12 text-center">

            <p className="text-sm font-semibold text-zinc-700">
              No logs to display
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Read a webpage containing logs,
              then click Parse Logs.
            </p>

          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto">

            {filteredLogs.map(
              (log, index) => (
                <div
                  key={index}
                  className="border-b border-zinc-100 p-4 last:border-b-0"
                >

                  <div className="mb-2 flex items-center gap-3">

                    <span
                      className={`text-[10px] font-bold ${
                        log.level === "INFO"
                          ? "text-blue-600"
                          : log.level === "WARNING"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {log.level}
                    </span>

                    <span className="font-mono text-[10px] text-zinc-400">
                      {log.timestamp}
                    </span>

                  </div>

                  <p className="text-xs leading-5 text-zinc-700">
                    {log.message}
                  </p>

                  {Object.keys(
                    log.metadata
                  ).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">

                      {Object.entries(
                        log.metadata
                      ).map(
                        ([key, value]) => (
                          <span
                            key={key}
                            className="rounded bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600"
                          >
                            {key}={value}
                          </span>
                        )
                      )}

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default App;