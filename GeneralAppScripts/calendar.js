const CHANNEL_POST_URL = "DISCORD_WEBHOOK_LINK_GOES_HERE";
const CALENDAR_ID = "GOOGLE_CALENDAR_ID_GOES_HERE";
const NO_VALUE_FOUND = "N/A";
const minsInAdvance = 1;

// Import Luxon
const DateTime = luxon.DateTime;
const DTnow = DateTime.now().startOf('minute');

function postEventsToChannel() {
  const optionalArgs = {
    timeMin: DTnow.toISO(),
    timeMax: DTnow.plus({ minutes: minsInAdvance }).toISO(),
    showDeleted: false,
    singleEvents: true,
    orderBy: 'startTime'
  };

  const response = Calendar.Events.list(CALENDAR_ID, optionalArgs);
  const events = response.items;

  if (events.length > 0) {
    events.forEach((event) => {
      const { summary, id, start, end, htmlLink, location, description } = event;
      const ISOStartDate = start.dateTime || start.date;
      const ISOEndDate = end.dateTime || end.date;

      if (DateTime.fromISO(ISOStartDate) < DTnow.plus({ minutes: minsInAdvance - 1 })) {
        Logger.log(`Event ${summary} [${id}] has already started. Skipping`);
        return;
      }

      const payload = {
        content: "‌",
        embeds: [
          {
            author: {
              name: `${summary}`,
              icon_url: "https://cdn.discordapp.com/attachments/696400605908041794/888874282950750238/1200px-Google_Calendar_icon_28202029.png"
            },
            timestamp: DTnow.toISO(),
            description: `[Google Event Link](${htmlLink})`,
            color: 1425196,
            fields: [
              {
                name: "Start Time",
                value: ISOToDiscordUnix(ISOStartDate) ?? NO_VALUE_FOUND,
                inline: false
              },
              {
                name: "End Time",
                value: ISOToDiscordUnix(ISOEndDate) ?? NO_VALUE_FOUND,
                inline: false
              },
              {
                name: "Location",
                value: location ?? NO_VALUE_FOUND,
                inline: false
              },
              {
                name: "Description",
                value: description ?? NO_VALUE_FOUND,
                inline: false
              }
            ]
          }
        ]
      };

      const options = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        payload: JSON.stringify(payload)
      };

      Logger.log(options, null, 2);
      try {
        UrlFetchApp.fetch(CHANNEL_POST_URL, options);
      } catch (error) {
        Logger.log(`Error sending POST request: ${error}`);
      }
    });
  } else {
    Logger.log(`No events starting within ${minsInAdvance} minute(s) found.`);
  }
}

function ISOToDiscordUnix(isoString) {
  return `<t:${Math.floor(DateTime.fromISO(isoString).toSeconds())}:F>`;
}
