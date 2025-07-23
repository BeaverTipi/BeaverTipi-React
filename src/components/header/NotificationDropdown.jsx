import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { useSecureAxios } from "../../hooks/useSecureAxios";
import { PageIcon, DocsIcon, AlertHexaIcon, CalenderIcon, InfoIcon } from "../../icons";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// 알림 내려오는 정보
export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifList, setNotifList] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const pagesPerGroup = 10;

  const totalPages = Math.ceil(notifList?.length / pageSize);
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const groupStart = currentGroup * pagesPerGroup + 1;
  const groupEnd = Math.min(groupStart + pagesPerGroup - 1, totalPages);

  const PROTOCOL = window.location.protocol; // 'http:' or 'https:'
  let HOSTNAME = window.location.hostname;   // e.g., react.beavertipi.com

  // 👉 react 서브도메인 접근 시 백엔드는 beavertipi.com 사용
  if (HOSTNAME === "react.beavertipi.com") {
    HOSTNAME = "beavertipi.com";
  }
  if (HOSTNAME === "hbdev.beavertipi.com") {
    HOSTNAME = "hbdev1.beavertipi.com";
  }
  if (HOSTNAME === "dev.beavertipi.com") {
    HOSTNAME = "dev1.beavertipi.com";
  }
  const SPRING_URL_ORIGIN = `${PROTOCOL}//${HOSTNAME}`;

  const axios = useSecureAxios();
  useEffect(() => {
    reloadNotifications();
  }, []);
  // useEffect(() => {
  //   if (isOpen) reloadNotifications();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isOpen]);
  useEffect(() => {
    if (notifList?.length > 0) {
      const hasUnread = notifList
        .slice(0, 20)
        .some(notif => !notif.notifReadYn);

      setNotifying(hasUnread);
    }
  }, [notifList]);
  const hasUnread = notifList?.slice(0, 20).some(notif => !notif.notifReadYn);

  const reloadNotifications = async () => {
    try {
      const data = await axios.post("notifications/loading", {});
      setNotifList(data);
      setUnreadCount(data.filter(n => !n.notifReadYn).length);
    }
    catch (err) { console.error("알림 못 불러왔다 씨밤바라 ^ㅂ^ㅗ", err); }
  }

  const markAsReadAndRedirect = async (notifId) => {
    try {
      const data = await axios.post(`notifications/read/${notifId}`);
      const targetUrl = data.notifRefUrl || "/";
      if (!targetUrl.startsWith("/broker") &&
        !targetUrl.startsWith("/contract") &&
        !targetUrl.startsWith("/sign")
      ) window.location.href = SPRING_URL_ORIGIN + targetUrl;
      else window.location.href = targetUrl;
      //^0^끝
      setNotifList(prev => {
        prev.map(notif => notif.notifId === notifId ? { ...notif, notifReadYn: true } : notif);
      });
    }
    catch (err) { console.err("알림 클릭 벗 targetUrl 이동 실패", err); }
  };

  const deleteNotification = async (notifId) => {
    await axios.delete(`/api/notifications/${notifId}`);
    reloadNotifications();
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${!notifying ? "hidden" : "flex"
            }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[400px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifList?.length > 0 ? (
            notifList.slice(0, 20).map((notif, idx) => (
              <li key={idx}>
                <DropdownItem
                  onItemClick={() => {
                    // closeDropdown();
                    markAsReadAndRedirect(notif.notifId);
                  }}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-0 py-2.5 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    {notif.notifTypeCd === "001" ? (<InfoIcon className="w-6 h-6" />) : (<AlertHexaIcon />)}
                    {!notif.notifReadYn ? (
                      <span className="absolute -bottom-[15px] right-[7px] z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
                    ) : (
                      <span className="absolute -bottom-[15px] right-[7px] z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-gray-500 dark:border-gray-900"></span>
                    )}
                  </span>
                  <span className="block">
                    <span className="block  text-theme-sm text-gray-500 dark:text-gray-400 space-x-1">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {notif.notifTitle}
                      </span>
                      <span className="font-medium text-sm text-gray-800 dark:text-white/90 invisible">
                        {notif.notifDt}
                      </span>
                    </span>
                    <span className="mb-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 space-x-1">
                      {notif.notifMsg}
                    </span>
                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>{notif.notifReadYn ? "읽음" : "새 알림"}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{dayjs(notif.notifDt.replace(' ', 'T')).fromNow()}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>

            ))) : (<></>)

          }

          {/* Add more items as needed */}
        </ul>
        <button
          onClick={() => setShowAllModal(true)}
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </button>
      </Dropdown>


      <AnimatePresence>
        {showAllModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeIn" }}
          >
            <motion.div
              className="w-[640px] max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col dark:bg-[#2f2f2f]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="fixed inset-0 z-99999 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <div className="w-[640px] max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col dark:bg-[#2f2f2f]">
                  {/* Header */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">전체 알림</h2>
                    <button onClick={() => setShowAllModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>

                  {/* List */}
                  <ul className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-700">
                    {notifList
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map((notif, idx) => (
                        <li key={idx} className="flex justify-between items-start gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-150">
                          <div className="items-start gap-4 w-full">
                            <div className="flex flex-row items-center gap-3">
                              <AlertHexaIcon className="w-6 h-6 text-gray-400 dark:text-white" />
                              <p className="font-semibold text-gray-800 dark:text-white mb-0.5">{notif.notifTitle}</p>
                            </div>
                            <div>
                              <p className="pl-9 text-sm text-gray-500 dark:text-gray-400">{notif.notifMsg}</p>
                            </div>
                          </div>
                          <div className="flex flex-row justify-between gap-4 h-full w-45">
                            <div className="flex flex-row flex-1 gap-2 justify-start">
                              <p className="block text-xs text-start text-gray-400 dark:text-gray-500 mt-1">
                                {dayjs(notif.notifDt.replace(" ", "T")).format("YYYY-MM-DD")}
                              </p>
                              <p className="block flex-1 text-xs  text-gray-400 dark:text-gray-500 mt-1">
                                {dayjs(notif.notifDt.replace(" ", "T")).format("HH:mm")}
                              </p>
                            </div>
                            <div>
                              <button
                                onClick={() => deleteNotification(notif.notifId)}
                                className="block text-lg text-gray-400 hover:text-red-500"
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                        </li>
                      ))}
                  </ul>

                  {/* Pagination */}
                  <div className="flex justify-center items-center gap-1 py-3 border-t border-gray-100 dark:border-gray-700">
                    {/* << prev group */}
                    {currentGroup > 0 && (
                      <button
                        onClick={() => setCurrentPage(groupStart - 1)}
                        className="px-2 py-1 text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                      >
                        &laquo;
                      </button>
                    )}

                    {/* page buttons */}
                    {Array.from({ length: groupEnd - groupStart + 1 }).map((_, i) => {
                      const pageNum = groupStart + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-full text-sm ${currentPage === pageNum
                            ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                            : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-white/10"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* >> next group */}
                    {groupEnd < totalPages && (
                      <button
                        onClick={() => setCurrentPage(groupEnd + 1)}
                        className="px-2 py-1 text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                      >
                        &raquo;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
