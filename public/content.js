chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.type !== "GET_PAGE_TEXT") {
      return;
    }

    const pageText = document.body?.innerText || "";

    sendResponse({
      text: pageText
    });
  }
);