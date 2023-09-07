import axios from 'axios';
import nonTechnicalArrayKeyword from './nonTechnicalKeywords.js'
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../../.env' });
const accessToken = process.env.TEAMS_TOKEN;


//const question = "How do Test ?";
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



async function searchQuery(keyword) {
  try {
    let result = [];
    const messages = await fetchAllMessages(keyword);

    // const matchedMessages = messages
    //   .filter((message) => message.body.content.includes(keyword))
    //   .map((message) => ({
    //     sender:
    //       message.from && message.from.user
    //         ? message.from.user.displayName
    //         : "System",
    //     message: message.body.content,
    //   }));


    const matchedMessages = messages
      .filter((message) => message.body.content.includes(keyword))
      .map((message) => {
        result.push(message.body.content);
      });

    return {
      found: matchedMessages.length > 0,
      foundMessages: result,
    };
  } catch (error) {
    console.error("Error searching messages:", error);
    
  }
}

export async function getAnswerFromTeams(question) {
  const foundKeywords = findTechnicalKeywords(question);

  const keywordResults = [];

  for (const keyword of foundKeywords) {
    try {
      const keywordData = await searchQuery(keyword);
      if (keywordData.found) {
        keywordResults.push(...keywordData.foundMessages);
      }
      // keywordResults.push({
      //   keyword: keyword,
      //   found: keywordData.found,
      //   foundMessages: keywordData.foundMessages,
      // });
    } catch (error) {
      console.error("An error occurred while processing keyword:", keyword);
      console.error(error);
    }
  }
  return keywordResults;
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

//console.log(await getAnswerFromTeams(question));



