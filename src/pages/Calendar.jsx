import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useSecureAxios } from "../hooks/useSecureAxios";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

const Calendar = () => {
  const secureAxios = useSecureAxios();
  const calendarRef = useRef(null);
  const { isOpen, openModal, closeModal } = useModal();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [repeatType, setRepeatType] = useState("");
  const [repeatEndDate, setRepeatEndDate] = useState("");
  const [eventContent, setEventContent] = useState("");

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  const expandRepeatingEvents = (event) => {
    const rptRaw = event.extendedProps?.rptSetCont;
    if (!rptRaw) return [event];

    try {
      const rpt = typeof rptRaw === "string" ? JSON.parse(rptRaw) : rptRaw;
      const { type, end_date } = rpt;
      if (!type || !end_date) return [event];

      const result = [];
      const cur = new Date(event.start);
      const end = new Date(end_date);
      let count = 0;

      while (cur <= end && count < 100) {
        const newEvent = {
          ...event,
          start: cur.toISOString(),
          end: cur.toISOString(),
        };
        result.push(newEvent);

        if (type === "daily") cur.setDate(cur.getDate() + 1);
        else if (type === "weekly") cur.setDate(cur.getDate() + 7);
        else if (type === "monthly") cur.setMonth(cur.getMonth() + 1);
        else break;

        count++;
      }

      return result;
    } catch (e) {
      console.warn("반복 설정 파싱 실패:", e);
      return [event];
    }
  };

  useEffect(() => {
    secureAxios.post("/schedule/list", {})
      .then(data => {
        console.log("📦 일정 응답 데이터:", data);
        const allEvents = data.flatMap(evt => {
          const baseEvent = {
            id: evt.scdId,
            title: evt.scdTitlNm,
            start: evt.scdStrDtm,
            end: evt.scdEndDtm,
            allDay: false,
            extendedProps: {
              calendar: evt.calendarLevel,
              rptSetCont: evt.scdRptSetCont,
            },
          };
          return expandRepeatingEvents(baseEvent);
        });
        setEvents(allEvents);
      })
      .catch(console.error);
  }, []);

  const handleDateSelect = (selectInfo) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo) => {
    const e = clickInfo.event;

    secureAxios.post("/schedule/detail", { scdId: e.id })
      .then(data => {
        setSelectedEvent(e);
        setEventTitle(data.scdTitlNm);
        setEventStartDate(data.scdStrDtm.slice(0, 16));
        setEventEndDate(data.scdEndDtm.slice(0, 16));
        setEventLevel(data.calendarLevel);
        setEventContent(data.scdCont ?? "");

        const rptParsed = data.scdRptSetCont
          ? JSON.parse(data.scdRptSetCont)
          : null;

        if (rptParsed) {
          setRepeatType(rptParsed.type);
          setRepeatEndDate(rptParsed.end_date);
        } else {
          setRepeatType("");
          setRepeatEndDate("");
        }

        openModal();
      })
      .catch(console.error);
  };

  const handleAddOrUpdateEvent = () => {
    const rptCont = repeatType
      ? JSON.stringify({ type: repeatType, end_date: repeatEndDate })
      : null;

    const payload = {
      title: eventTitle,
      start: eventStartDate,
      end: eventEndDate,
      calendarLevel: eventLevel,
      rptSetCont: rptCont,
      content: eventContent,
    };

    if (selectedEvent) {
      secureAxios.post(`/schedule/modify/${selectedEvent.id}`, payload)
        .then(() => {
          setEvents(prev =>
            prev.map(ev =>
              ev.id === selectedEvent.id
                ? {
                    ...ev,
                    title: eventTitle,
                    start: eventStartDate,
                    end: eventEndDate,
                    extendedProps: {
                      calendar: eventLevel,
                      rptSetCont: rptCont,
                    },
                  }
                : ev
            )
          );
        })
        .catch(console.error);
    } else {
      secureAxios.post("/schedule/add", payload)
        .then(res => {
          const evt = res.data;
          calendarRef.current.getApi().addEvent({
            id: evt.id,
            title: evt.title,
            start: evt.start,
            end: evt.end,
            allDay: false,
            extendedProps: {
              calendar: evt.calendarLevel,
              rptSetCont: evt.rptSetCont,
            },
          });
        })
        .catch(console.error);
    }

    closeModal();
    resetModalFields();
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    if (confirm("정말 이 이벤트를 삭제하시겠습니까?")) {
      secureAxios.post(`/schedule/delete/${selectedEvent.id}`)
        .then(() => {
          selectedEvent.remove();
        })
        .catch(console.error)
        .finally(() => {
          closeModal();
          resetModalFields();
        });
    }
  };

  const resetModalFields = () => {
    setSelectedEvent(null);
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setRepeatType("");
    setRepeatEndDate("");
    setEventContent("");
  };

  return (
    <>
      <PageMeta title="React.js Calendar Dashboard" description="TailAdmin Calendar with CRUD" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: openModal,
            },
          }}
            eventClassNames={(arg) => {
    const level = arg.event.extendedProps.calendar;
    switch (level) {
      case "Danger":
        return ["bg-red-500", "text-white"];
      case "Success":
        return ["bg-green-500", "text-white"];
      case "Primary":
        return ["bg-blue-500", "text-white"];
      case "Warning":
        return ["bg-yellow-400", "text-black"];
      default:
        return ["bg-gray-300", "text-black"];
    }
  }}
        />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg p-6">
        <h5 className="text-xl font-semibold mb-4">
          {selectedEvent ? "Edit Event" : "Add Event"}
        </h5>

        <label className="block mb-2 text-sm">제목</label>
        <input
          type="text"
          value={eventTitle}
          onChange={e => setEventTitle(e.target.value)}
          className="w-full mb-4 rounded border px-3 py-2"
        />

        <label className="block mb-2 text-sm">내용</label>
        <textarea
          value={eventContent}
          onChange={e => setEventContent(e.target.value)}
          className="w-full mb-4 rounded border px-3 py-2"
        />

        <label className="block mb-2 text-sm">반복 설정</label>
        <select
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value)}
          className="w-full mb-4 rounded border px-3 py-2"
        >
          <option value="">반복 안 함</option>
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
        </select>

        {repeatType && (
          <>
            <label className="block mb-2 text-sm">반복 종료일</label>
            <input
              type="date"
              value={repeatEndDate}
              onChange={(e) => setRepeatEndDate(e.target.value)}
              className="w-full mb-4 rounded border px-3 py-2"
            />
          </>
        )}

        <label className="block mb-2 text-sm">Level</label>
        <select
          value={eventLevel}
          onChange={e => setEventLevel(e.target.value)}
          className="w-full mb-4 rounded border px-3 py-2"
        >
          <option value="">선택</option>
          {Object.keys(calendarsEvents).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>

        <label className="block mb-2 text-sm">시작일시</label>
        <input
          type="datetime-local"
          value={eventStartDate}
          onChange={e => setEventStartDate(e.target.value)}
          className="w-full mb-4 rounded border px-3 py-2"
        />

        <label className="block mb-2 text-sm">종료일시</label>
        <input
          type="datetime-local"
          value={eventEndDate}
          onChange={e => setEventEndDate(e.target.value)}
          className="w-full mb-4 rounded border px-3 py-2"
        />

        <div className="flex justify-end gap-2">
          {selectedEvent && (
            <button
              onClick={handleDeleteEvent}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleAddOrUpdateEvent}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {selectedEvent ? "Update" : "Add"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Calendar;