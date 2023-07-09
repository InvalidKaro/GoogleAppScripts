function myFunction() {
  const threads = GmailApp.search('from:Patreon');
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();
    for (let j = 0; j < messages.length; j++) {
      const message = messages[j];
      if (message.isUnread()) {
        if (/^New.*patron!.*$/.test(message.getSubject())) {
          postMessageToDiscord(message.getSubject());
          message.markRead();
        }
        // Additional checks for other messages such as cancellations
      }
    }
  }
}

function postMessageToDiscord(message) {
  const discordUrl = '[YOUR DISCORD INTEGRATION WEBHOOK URL HERE]';

  const payload = {
    embeds: [
      {
        color: 0x0099ff,
        title: 'Member Alert',
        url: 'https://www.patreon.com/members',
        author: {
          name: 'Patreon',
          icon_url: 'https://c5.patreon.com/external/favicon/apple-touch-icon.png',
          url: 'https://www.patreon.com/'
        },
        description: message
      }
    ]
  };

  const params = {
    method: 'POST',
    payload: payload,
    muteHttpExceptions: true,
    contentType: 'application/json'
  };

  const response = UrlFetchApp.fetch(discordUrl, params);
}
