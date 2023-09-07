const axios = require("axios"); // Import the 'axios' library
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const accessToken = process.env.TEAMS_TOKEN;
const nonTechnicalArrayKeyword = require("../nonTechnicalKeywords");
const question = "How do Test ?";
// const searchQuery = "Hello";
const fetchAllMessages = async () => {
  const chatEndpoint =
    "https://graph.microsoft.com/beta/chats/19:uni01_tcy3xfktmzpebrha5hqua34tpfnuuey3je6q26zkbbtzi5k4dasq@thread.v2/messages";

  let allMessages = [];

  let pageUrl = chatEndpoint;
  while (pageUrl) {
    try {
      const response = await axios.get(pageUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        const messages = responseData.value.filter(
          (message) => message.body.content.trim() !== ""
        );
        allMessages = allMessages.concat(messages);

        // Check if there are more pages
        pageUrl = responseData["@odata.nextLink"];
      } else {
        console.error("Error fetching messages:", response.statusText);
        break;
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      break;
    }
  }

  return allMessages;
};

// Endpoint to fetch all messages
app.get("/fetch-chat", async (req, res) => {
  try {
    const messages = await fetchAllMessages();

    // Extract sender's name and message content
    const simplifiedMessages = messages.map((message) => ({
      sender:
        message.from && message.from.user
          ? message.from.user.displayName
          : "System",
      message: message.body.content,
    }));

    res.json(simplifiedMessages);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages." });
  }
});
// app.post("/search-chat", async (req, res) => {
//   const searchKeyword = req.body.keyword || ""; // Get the keyword from the request body

//   try {
//     const messages = await fetchAllMessages(searchKeyword);

//     const matchedMessages = messages
//       .filter((message) => message.body.content.includes(searchKeyword))
//       .map((message) => ({
//         sender:
//           message.from && message.from.user
//             ? message.from.user.displayName
//             : "System",
//         message: message.body.content,
//       }));

//     res.json(matchedMessages);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching messages." });
//   }
// });

async function searchQuery(keyword) {
  try {
    const messages = await fetchAllMessages(keyword);

    const matchedMessages = messages
      .filter((message) => message.body.content.includes(keyword))
      .map((message) => ({
        sender:
          message.from && message.from.user
            ? message.from.user.displayName
            : "System",
        message: message.body.content,
      }));

    return {
      found: matchedMessages.length > 0,
      foundMessages: matchedMessages,
    };
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
}

async function searchQuestion(question) {
  const foundKeywords = findTechnicalKeywords(question);

  const keywordResults = [];

  for (const keyword of foundKeywords) {
    try {
      const keywordData = await searchQuery(keyword);
      keywordResults.push({
        keyword: keyword,
        found: keywordData.found,
        foundMessages: keywordData.foundMessages,
      });
    } catch (error) {
      console.error("An error occurred while processing keyword:", keyword);
      console.error(error);
    }
  }

  const result = {
    status: 200,
    message: "Question Received",
    data: {
      question,
      keywordResults,
    },
  };

  console.log(JSON.stringify(result, null, 2)); // Pretty-print the result
}
//Find technical keywords in the question
function findTechnicalKeywords(question) {
  const keywords = question.toLowerCase().split(" ");
  const foundKeywords = [];

  for (const keyword of keywords) {
    if (!nonTechnicalArrayKeyword.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}
searchQuestion(question)


module.exports = app;
