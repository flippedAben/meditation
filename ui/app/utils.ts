export function sendLog(datetime: string, event: string) {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/log`, {
    method: "POST",
    body: JSON.stringify({
      timestamp: datetime,
      event: event,
    }),
  }).then((response) => {
    if (response.ok) {
      console.log("Log sent successfully");
    } else {
      console.error("Failed to send log");
    }
  });
}
