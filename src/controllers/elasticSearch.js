import * as elastic from '../services/elasticSearchService.js';
import * as db from '../services/question.service.js';
import { findTechnicalKeywords } from '../utils/searchkeywords.js';
import { getAnswerFromSlack } from '../utils/slack.utility.js';
import { getAnswerFromGoogleDocs } from '../utils/google.utilty.js';
import { getAnswerFromDiscord } from '../utils/discord.utility.js';
import { getAnswerFromConfluence } from '../utils/confluence.utility.js';
import { getAnswerFromTeams } from '../utils/teams.utility.js';
export async function getAllQeustions(req, res) {
    try {

        res.status(200).json(await elastic.retrieveAllDocuments())
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }

}

export async function getAnswer(req, res) {
    try {

        const question = req.query.question;

        if (!question) {
            return res.status(400).json({ error: "Question parameter is missing in the query string." });
        }
        let is_Q_Exist_WithNull = false;
        let questionId;


        let result = await elastic.SearchForDocument(question);

        if (result.length > 0 && result[0]._source.Answer) {
            let resultObj = {
                provider: 'Database',
                resul: result
            }
            return res.status(200).json(resultObj);
        }
        else if (result.length > 0 && !result[0]._source.Answer && result[0]._source.Question == question) {
            is_Q_Exist_WithNull = true;
            questionId = result[0]._id;
            console.log("{+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++}")
        }
        else {
            console.log("{=================================================================}")
            is_Q_Exist_WithNull = false;
            let newQuesion = await db.addQuestion(question, false, null, [], null);
            questionId = newQuesion.questionId;
            await elastic.AddDocument(newQuesion.questionId, question, null, null);
        }

        let finalReslut = [];

        let resultSlack = await getAnswerFromSlack(question);
        if (resultSlack.found) {
            let resultSlackObj = {
                provider: 'slack',
                result: resultSlack.data
            };
            finalReslut.push(resultSlackObj);
        }

        let resultGoogleDocs = await getAnswerFromGoogleDocs(question);
        if (resultGoogleDocs.length > 0) {
            let resultGoogleDocsObj = {
                provider: 'GoogleDocs',
                result: resultGoogleDocs
            };
            finalReslut.push(resultGoogleDocsObj);
        }


        let resultDiscord = await getAnswerFromDiscord(question);
        if (resultDiscord.length > 0) {
            let resultDiscordObj = {
                provider: 'discord',
                result: resultDiscord
            };
            finalReslut.push(resultDiscordObj);
        }

        let resultConfluence = await getAnswerFromConfluence(question);
        if (resultConfluence.length > 0) {
            let resultConfluenceObj = {
                provider: 'Confluence',
                result: resultConfluence
            };
            finalReslut.push(resultConfluenceObj);
        }

        let resultTeams = await getAnswerFromTeams(question);
        if (resultTeams.length > 0) {
            let resultTeamsObj = {
                provider: 'Teams',
                result: resultTeams
            };
            finalReslut.push(resultTeamsObj);
        }


        if (finalReslut.length == 0) {
            return res.status(404).json({ statusCode: 404, message: "our team will answer your question as soon as possible." });
        }

        return res.status(200).json({ QuestionId: questionId, result: finalReslut });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}

export async function getAnswerByMatchingPhrase(req, res) {
    try {

        const question = req.query.question;

        if (!question) {
            return res.status(400).json({ error: "Question parameter is missing in the query string." });
        }

        res.status(200).json(await elastic.searchQuestionByMatchingPhrase(question))

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}

export async function getAnswerByMultiMatch(req, res) {
    try {

        const question = req.query.question;

        if (!question) {
            return res.status(400).json({ error: "Question parameter is missing in the query string." });
        }
        let cleanQuestion = await findTechnicalKeywords(question);

        res.status(200).json(await elastic.searchWithMultiMatch(cleanQuestion))

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}

export async function addQuestionAndAnswer(req, res) {
    try {
        const question = req.body.question;
        const answer = req.body.answer;
        const tag = req.body.tag;
        const rate = null;
        let hasAnswer = !answer ? false : true;
        if (!question || !tag) {
            return res.status(400).json({ error: "Both question and tag must be provided " });
        }
        let result = await db.addQuestion(question, hasAnswer, tag, answer, rate);
        await elastic.AddDocument(result.questionId, question, result.finalAnswersArray, tag);

        return res.status(201).json({ statusCode: 201, message: "Question added successfully" });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}

export async function deleteQuestion(req, res) {
    try {
        const docId = req.params.id;
        if (!docId) {
            return res.status(400).json({ statusCode: 400, message: "Document Id must be provided " });
        }

        if (!await elastic.checkDocumentExistence(docId)) {
            return res.status(404).json({ statusCode: 404, message: `There is no document with id ${docId}` });
        }

        await db.deleteQuestionById(docId);
        await elastic.DeleteDocument(docId);
        return res.status(200).json({ statusCode: 200, message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}


export async function updateQuestionAndAnswer(req, res) {
    try {

        const question = req.body.question;
        const answer = req.body.answer;
        const tag = req.body.tag;
        let hasAnswer = !answer ? false : true;
        const docId = req.params.id;

        if (!docId) {
            return res.status(400).json({ statusCode: 400, message: "Document Id must be provided " });
        }
        if (!question || !answer) {
            return res.status(400).json({ statusCode: 400, message: "Both question and answer must be provided " });
        }
        if (!await elastic.checkDocumentExistence(docId)) {
            return res.status(404).json({ statusCode: 404, message: `There is no document with id ${docId}` });
        }

        const updateQuestion = {
            Question: question,
            Answer: answer,
            Tag: tag
        };
        await db.updateQuestion(docId, question, hasAnswer, tag, answer);
        await elastic.UpdateDocument(docId, updateQuestion);


        return res.status(200).json({ statusCode: 200, message: "Question updated successfully" });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}



