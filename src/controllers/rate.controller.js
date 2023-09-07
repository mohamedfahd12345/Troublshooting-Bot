import * as elastic from '../services/elasticSearchService.js';
import * as db from '../services/question.service.js'

export async function updateAnswerRate(req, res) {
    try {
        const docId = req.params.qesid;//----------------------------->
        const answerId = req.params.ansid;

        const rate = req.query.rate;
        if (!docId || !answerId) {
            return res.status(400).json({ statusCode: 400, message: "Both  Document Id and answer Id must be provided " });
        }
        if (!rate) {
            return res.status(400).json({ error: "rate parameter is missing in the query string." });
        }
        if (!await elastic.checkDocumentExistence(docId)) {
            return res.status(404).json({ statusCode: 404, message: `There is no document with id ${docId}` });
        }
        await db.updateRate(docId, answerId, rate);
        await elastic.updateRate(docId, answerId, rate);
        return res.status(200).json({ statusCode: 200, message: "rate updated successfully" });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "An error occurred." });
    }
}