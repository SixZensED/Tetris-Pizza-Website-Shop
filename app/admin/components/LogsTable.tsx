"use client";

import { useEffect, useMemo, useState } from "react";
import { getLogs, LogsPagination, LogsQueryParams } from "@/app/lib/logs";
import { AuditLog } from "@/app/types/logs.d";
import { Log } from "@/app/types/logs";

const PAGE_SIZES = [10, 25, 50];
const EMPTY_PLACEHOLDER = "-";
const NO_DETAILS_PLACEHOLDER = "ไม่มีรายละเอียด";

const LEVEL_BADGE_STYLES: Record<string, string> = {
  error: "bg-red-100 text-red-700",
  fatal: "bg-red-100 text-red-700",
  warn: "bg-amber-100 text-amber-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  debug: "bg-indigo-100 text-indigo-700",
  success: "bg-emerald-100 text-emerald-700",
};

function formatDetails(details: Log["details"]) {
  if (!details) {
    return {
      summary: NO_DETAILS_PLACEHOLDER,
      full: NO_DETAILS_PLACEHOLDER,
      isStructured: false,
    };
  }

  if (typeof details === "string") {
    const trimmed = details.trim();
    if (!trimmed.length) {
      return {
        summary: NO_DETAILS_PLACEHOLDER,
        full: NO_DETAILS_PLACEHOLDER,
        isStructured: false,
      };
    }
    const summary =
      trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;

    return { summary, full: trimmed, isStructured: false };
  }

  const formatted = JSON.stringify(details, null, 2);
  const summary =
    formatted.length > 140 ? `${formatted.slice(0, 137)}...` : formatted;

  return { summary, full: formatted, isStructured: true };
}

function toStartOfDayISOString(value: string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function toEndOfDayISOString(value: string) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export default function LogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [pagination, setPagination] = useState<LogsPagination | null>(null);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZES[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedAction, userIdFilter, startDate, endDate, limit]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setError("ไม่พบเซสชันผู้ดูแล กรุณาเข้าสู่ระบบอีกครั้ง");
        setIsLoading(false);
        return;
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
          setError("วันที่เริ่มต้นต้องอยู่ก่อนหรือเท่ากับวันที่สิ้นสุด");
          setIsLoading(false);
          return;
        }
      }

      const params: LogsQueryParams = {
        page: currentPage,
        limit,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const trimmedUser = userIdFilter.trim();
      if (trimmedUser) {
        params.userId = trimmedUser;
      }

      if (selectedAction !== "all") {
        params.action = selectedAction;
      }

      if (startDate) {
        params.startDate = toStartOfDayISOString(startDate);
      }

      if (endDate) {
        params.endDate = toEndOfDayISOString(endDate);
      }

      try {
        const response = await getLogs(params, token, { signal: controller.signal });
        const fetchedLogs = Array.isArray(response.logs) ? response.logs : [];
        const fetchedPagination = response.pagination;
        const actions = response.availableActions || [];

        setLogs(fetchedLogs);
        setPagination(fetchedPagination);
        setExpandedLogId(null);
        setLastRefreshedAt(new Date());

        if (actions.length) {
          setAvailableActions([...actions].sort());
        } else {
          const inferredActions = Array.from(
            new Set(
              fetchedLogs
                .map((log) =>
                  typeof log.action === "string" ? log.action.trim() : "",
                )
                .filter(Boolean),
            ),
          );

          if (inferredActions.length) {
            setAvailableActions((prev) =>
              Array.from(new Set([...prev, ...inferredActions])).sort(),
            );
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }

        setError((err as Error).message || "ไม่สามารถโหลดบันทึกได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();

    return () => controller.abort();
  }, [
    currentPage,
    limit,
    debouncedSearch,
    selectedAction,
    userIdFilter,
    startDate,
    endDate,
    refreshIndex,
  ]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "medium",
      }),
    [],
  );

  const hasServiceColumn = useMemo(
    () =>
      logs.some(
        (log) => typeof log.service === "string" && log.service.trim().length,
      ),
    [logs],
  );

  const hasLevelColumn = useMemo(
    () =>
      logs.some(
        (log) => typeof log.level === "string" && log.level.trim().length,
      ),
    [logs],
  );

  const hasIpColumn = useMemo(
    () =>
      logs.some(
        (log) =>
          typeof log.ipAddress === "string" && log.ipAddress.trim().length,
      ),
    [logs],
  );

  const totalItems = pagination?.total ?? logs.length ?? 0;
  const totalPages = Math.max(
    1,
    pagination?.pages ??
      (totalItems && limit ? Math.ceil(totalItems / limit) : 1),
  );
  const currentPageDisplay = Math.min(currentPage, totalPages);
  const firstItem = totalItems
    ? (currentPageDisplay - 1) * limit + 1
    : 0;
  const lastItem = totalItems
    ? Math.min(firstItem + (logs.length || limit) - 1, totalItems)
    : 0;

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedAction("all");
    setUserIdFilter("");
    setStartDate("");
    setEndDate("");
    setRefreshIndex((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshIndex((prev) => prev + 1);
  };

  const renderLevelBadge = (level?: string) => {
    if (!level) {
      return null;
    }

    const key = level.toLowerCase();
    const badgeClass =
      LEVEL_BADGE_STYLES[key] ?? "bg-gray-100 text-gray-700";

    return (
      <span
        className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}
      >
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  ค้นหา
                </span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="การดำเนินการ, รายละเอียด, หรือคำค้นหา"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#b21807] focus:ring-2 focus:ring-[#b21807]/20"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  รหัสผู้ใช้
                </span>
                <input
                  type="text"
                  value={userIdFilter}
                  onChange={(event) => setUserIdFilter(event.target.value)}
                  placeholder="ตัวอย่าง: 102938"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#b21807] focus:ring-2 focus:ring-[#b21807]/20"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  การดำเนินการ
                </span>
                <select
                  value={selectedAction}
                  onChange={(event) => setSelectedAction(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#b21807] focus:ring-2 focus:ring-[#b21807]/20"
                >
                  <option value="all">การดำเนินการทั้งหมด</option>
                  {availableActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  วันที่เริ่มต้น
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#b21807] focus:ring-2 focus:ring-[#b21807]/20"
                  max={endDate || undefined}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  วันที่สิ้นสุด
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#b21807] focus:ring-2 focus:ring-[#b21807]/20"
                  min={startDate || undefined}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  แถวต่อหน้า
                </span>
                <select
                  value={limit}
                  onChange={(event) => setLimit(Number(event.target.value))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#b21807] focus:ring-2 focus:ring-[#b21807]/20"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#b21807] hover:text-[#b21807] disabled:cursor-not-allowed disabled:opacity-60"
              >
                รีเฟรช
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <span>
              {isLoading
                ? "กำลังโหลดบันทึกการตรวจสอบ..."
                : totalItems
                  ? `แสดง ${firstItem}-${lastItem} จากทั้งหมด ${totalItems} รายการ`
                  : "ไม่พบรายการบันทึกการตรวจสอบ"}
            </span>
            {lastRefreshedAt && (
              <span>
                อัปเดตล่าสุด {dateFormatter.format(lastRefreshedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">วันและเวลา</th>
                <th className="px-4 py-3">ผู้ใช้</th>
                {hasLevelColumn && <th className="px-4 py-3">ระดับ</th>}
                {hasServiceColumn && <th className="px-4 py-3">บริการ</th>}
                {hasIpColumn && <th className="px-4 py-3">ที่อยู่ IP</th>}
                <th className="px-4 py-3">การดำเนินการและรายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr key="loading-row">
                  <td
                    colSpan={
                      3 +
                      (hasLevelColumn ? 1 : 0) +
                      (hasServiceColumn ? 1 : 0) +
                      (hasIpColumn ? 1 : 0)
                    }
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    กำลังโหลดบันทึก...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr key="no-results-row">
                  <td
                    colSpan={
                      3 +
                      (hasLevelColumn ? 1 : 0) +
                      (hasServiceColumn ? 1 : 0) +
                      (hasIpColumn ? 1 : 0)
                    }
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    ไม่พบข้อมูล ลองปรับตัวกรองหรือรีเฟรชหน้าใหม่
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => {
                  const formattedDetails = formatDetails(log.details);
                  const isExpanded = expandedLogId === log._id;
                  const showToggle =
                    formattedDetails.full !== formattedDetails.summary ||
                    formattedDetails.isStructured;
                  return (
                    <tr key={`log-${log._id || index}`} className="align-top">
                      <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {dateFormatter.format(new Date(log.timestamp))}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toISOString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {log.username || log.metadata?.userName || (log.user_id ? `ผู้ใช้ ${log.user_id}` : log.userId ? `ผู้ใช้ ${log.userId}` : 'ระบบ')}
                          </span>
                          {log.metadata?.userEmail && (
                            <span className="text-xs text-gray-500">
                              {log.metadata.userEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      {hasLevelColumn && (
                        <td className="px-4 py-4 text-gray-700">
                          {renderLevelBadge(
                            typeof log.level === "string" ? log.level : log.level as string | undefined,
                          )}
                        </td>
                      )}
                      {hasServiceColumn && (
                        <td className="px-4 py-4 text-gray-700">
                          {typeof log.service === "string" && log.service.trim()
                            ? log.service
                            : EMPTY_PLACEHOLDER}
                        </td>
                      )}
                      <td className="px-4 py-4 text-gray-700">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{log.action_type || log.action || EMPTY_PLACEHOLDER}</div>
                          <div className="text-sm text-gray-600">
                            {formattedDetails.summary}
                            {showToggle && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedLogId(
                                    isExpanded ? null : String(log._id)
                                  )
                                }
                                className="ml-2 text-xs font-medium text-[#b21807] hover:underline"
                              >
                                {isExpanded ? "แสดงน้อยลง" : "แสดงเพิ่มเติม"}
                              </button>
                            )}
                          </div>
                          {isExpanded && (
                            <pre className="mt-2 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                              {formattedDetails.full}
                            </pre>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPageDisplay} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(currentPageDisplay - 1)}
            disabled={currentPageDisplay <= 1 || isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#b21807] hover:text-[#b21807] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(currentPageDisplay + 1)}
            disabled={currentPageDisplay >= totalPages || isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#b21807] hover:text-[#b21807] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
