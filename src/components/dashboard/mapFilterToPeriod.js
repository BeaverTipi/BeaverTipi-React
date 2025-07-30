export function mapFilterToPeriod(filter) {
  switch (filter) {
    case "오늘" : return "today";
    case "이번 주":
      return "week";
    case "이번 달":
      return "month";
    case "이번 분기":
      return "quarter";
    case "올해":
      return "year";
    default:
      return "month";
  }
}

