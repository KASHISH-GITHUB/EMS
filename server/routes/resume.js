import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ dest: "uploads/resumes/" });

router.post("/upload", upload.array("resumes"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded. Please upload a resume." });
    }

    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required." });
    }

    const results = [];

    for (let file of req.files) {
      const filePath = path.resolve(file.path);

      if (fs.existsSync(filePath)) {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        const extractedText = pdfData.text.toLowerCase();

        // Calculate score based on frequency of keyword matches
        const score = calculateScore(extractedText, jobDescription.toLowerCase());

        // Extract preview sentences with highest keyword density
        const preview = extractPreviewSentences(extractedText, jobDescription.toLowerCase());

        results.push({
          filename: file.originalname,
          score,
          preview,
        });

        fs.unlinkSync(filePath); // Clean up
      } else {
        console.error(`File not found: ${filePath}`);
      }
    }

    results.sort((a, b) => b.score - a.score);

    res.json({ results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing resumes" });
  }
});

// Normalize text: remove punctuation, trim spaces
function normalize(text) {
  return text.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
}

// Calculate score by counting total occurrences of job description keywords
function calculateScore(text, jd) {
  const normalizedText = normalize(text);
  const jdKeywords = jd.split(/\s+/).filter(word => word.length > 3).map(normalize);
  let score = 0;

  jdKeywords.forEach(word => {
    // Count occurrences of each keyword in text
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = normalizedText.match(regex);
    if (matches) {
      score += matches.length;
    }
  });

  return score;
}

// Extract preview sentences with highest number of keyword matches
function extractPreviewSentences(text, jd) {
  const jdKeywords = jd.split(/\s+/).filter(word => word.length > 3).map(normalize);

  // Split text into sentences (simple split by period, exclamation, question mark)
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

  // Calculate keyword matches for each sentence
  const sentenceScores = sentences.map(sentence => {
    let count = 0;
    const normalizedSentence = normalize(sentence);
    jdKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = normalizedSentence.match(regex);
      if (matches) count += matches.length;
    });
    return { sentence: sentence.trim(), count };
  });

  // Sort sentences by keyword count, descending
  sentenceScores.sort((a, b) => b.count - a.count);

  // Pick top 3 sentences with matches (or less if not enough)
  const topSentences = sentenceScores.filter(s => s.count > 0).slice(0, 3);

  if (topSentences.length === 0) {
    // fallback to first 300 characters if no matches found
    return text.substring(0, 300) + "...";
  }

  // Join selected sentences as preview
  return topSentences.map(s => s.sentence).join(" ") + "...";
}

export default router;
