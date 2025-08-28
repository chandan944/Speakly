import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";

const API_KEY = import.meta.env.VITE_API_URL_GEMINI;
const MODEL = "gemini-2.5-flash-lite";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const MotionBox = motion(Box);

export default function FindMistak() {
  const [content, setContent] = useState({ front: "", back: "" });
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("sentence");
    const {user} = useAuthentication(); // sentence | vocab
  const toast = useToast();
  // Function to highlight corrections in sentences
  const highlightCorrections = (original, corrected) => {
    if (mode !== "sentence" || !original || !corrected) return corrected;
    
    const originalWords = original.toLowerCase().split(/\s+/);
    const correctedWords = corrected.split(/\s+/);
    
    return correctedWords.map((word, index) => {
      const originalWord = originalWords[index];
      const cleanWord = word.toLowerCase().replace(/[.,!?;:"']/g, '');
      const cleanOriginal = originalWord?.replace(/[.,!?;:"']/g, '');
      
      if (!originalWord || cleanWord !== cleanOriginal) {
        return (
          <Text as="span" key={index} color="#1449F7" fontWeight="bold">
            {word}{index < correctedWords.length - 1 ? ' ' : ''}
          </Text>
        );
      }
      return word + (index < correctedWords.length - 1 ? ' ' : '');
    });
  };
 const randomKeywords = [
  // Sparkle & Magic ✨
  "✨","🌟","💫","⚡","🌈","🌌","☄️","🌠","🌞","🌙",
  
  // Nature & Growth 🌱
  "🌱","🌿","🌳","🌴","🌵","🍀","🍃","🌻","🌸","🌹",
  "🌷","🌼","🌺","🍄","🌾","🪴","🌍","🌎","🌏","🪐",
  
  // Fire & Energy 🔥
  "🔥","💥","🌋","🌪️","🌀","☀️","⚡","🌊","❄️","⛄",
  
  // Achievement & Goals 🎯
  "🎯","🏆","🥇","🥈","🥉","🏅","🎖️","🚀","🛸","🪂",
  "🗡️","🛡️","🏰","🗿","🎲","♟️","🧩","🕹️","🎮","🏹",
  
  // Fun & Entertainment 🎉
  "🎉","🎊","🎵","🎶","🎤","🎧","📀","💿","🎸","🎹",
  "🥁","🎺","🎻","🪕","🪘","🎬","🎥","📸","📷","🎞️",
  
  // Food & Drinks 🍕
  "🍎","🍏","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🥭",
  "🍍","🥥","🥝","🍅","🥑","🥦","🥬","🥕","🧄","🧅",
  "🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥗","🍝","🍜",
  "🍣","🍤","🍦","🍩","🍪","🍫","🍿","🥤","☕","🍹",
  
  // Animals 🐾
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
  "🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦉","🦄",
  "🐝","🦋","🐌","🐞","🐢","🐍","🦖","🦕","🐙","🦑",
  
  // Travel & Adventure ✈️
  "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚜",
  "🚲","🛵","🏍️","🚂","🚆","✈️","🚀","🛳️","🚤","🚢",
  
  // Tech & Futuristic 🤖
  "📱","💻","🖥️","⌨️","🖱️","💾","📀","🔋","🔌","📡",
  "🤖","👾","🎛️","🎚️","🕹️","📶","🌐","💡","🔭","⚙️",
  
  // Love & Positivity ❤️
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💖",
  "💝","💘","💞","💕","💓","💗","💌","🌹","💐","🫶",
  
  // Sports & Games 🏀
  "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🥏","🎱","🏓",
  "🏸","🥊","🥋","🥅","⛳","🏒","🏑","🏏","🎿","🛷",
  
  // Random Fun Stuff 🎲
  "🎲","🧩","♟️","🪀","🎯","🃏","🎴","🀄","🧸","🎎",
  "🎁","🎀","📦","💎","🔮","🪄","🧿","📜","✉️","📖",
  
  // Emojis for Vibes 😎
  "😀","😃","😄","😁","😆","😎","🥳","🤩","🤯","😇",
  "🥶","😡","😱","😴","🤤","🤠","👻","💀","🦸","🦹",
  
  // Symbols & Cool Icons 🔥
  "♠️","♥️","♦️","♣️","⭐","🌟","⭕","❌","✅","⚜️",
  "🔱","⚛️","☯️","☮️","✝️","☪️","🕉️","♾️","♻️","⚠️"
];

  const randomKey =
    randomKeywords[Math.floor(Math.random() * randomKeywords.length)];

 const fetchContent = async () => {
  setLoading(true);
  setIsFlipped(false);

  const prompt =
    mode === "sentence"
      ? `topic ${randomKey} Give me ONLY two lines:\nFront: a concise sentence with 1–2 tricky mistakes in words and grammer.\nBack: the corrected version of that sentence.\nDo not add extra text.`
      : `Topic: ${randomKey} word(no astrics) + meaning + example. 
Generate EXACTLY 2 lines, formatted as a clean flashcard:  

Front: 📖 One simple English word (bold, capitalized).  
Back: 🌍 Its meaning in ${user?.nativeLanguage || "English"} + ✨ one short, natural example sentence.  

⚠️ Rules:  
- Keep it concise (max 10 words meaning, max 12 words sentence).  
- Do NOT add extra commentary, explanation, quotes, or labels.  
- Make sure it looks neat and learner-friendly.  
`; 

  try {
    console.log("Prompt sent:", prompt);
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("No content in response");
    }

    console.log("Raw AI Response:", rawText); // Debug

    let front = "";
    let back = "";

    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Try to find Front and Back by prefix
    const frontLine = lines.find((line) => line.toLowerCase().startsWith("front:"));
    const backLine = lines.find((line) => line.toLowerCase().startsWith("back:"));

    if (frontLine) {
      front = frontLine.replace(/front:\s*/i, "").trim();
    } else if (lines.length >= 1) {
      // Fallback: if no "Front:", take first line
      front = lines[0];
    } else {
      front = mode === "sentence" ? "Sentence unavailable 😅" : "Word unavailable 😅";
    }

    if (backLine) {
      back = backLine.replace(/back:\s*/i, "").trim();
    } else if (lines.length >= 2) {
      // Fallback: if no "Back:", take second line
      back = lines[1];
    } else {
      back = mode === "sentence" ? "Corrected unavailable 😅" : "Meaning unavailable 😅";
    }

    // Final safety
    if (!front) front = mode === "sentence" ? "Sentence unavailable 😅" : "Word unavailable 😅";
    if (!back) back = mode === "sentence" ? "Corrected unavailable 😅" : "Meaning unavailable 😅";

    setContent({ front, back });
  } catch (error) {
    console.error("Error fetching content:", error);
    toast({
      title: "Error",
      description: "Failed to fetch content. Please try again.",
      status: "error",
      duration: 3000,
    });
    setContent({
      front: mode === "sentence" ? "Sentence unavailable 😅" : "Word unavailable 😅",
      back: mode === "sentence" ? "Corrected unavailable 😅" : "Meaning unavailable 😅",
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <VStack minH="100vh" justify="center"  spacing={6} p={6}>
      {/* Buttons to switch modes */}
      <HStack spacing={4}>
        <Button
          variant={mode === "sentence" ? "solid" : "outline"}
         
          onClick={() => setMode("sentence")}
        >
          Sentence
        </Button>
        <Button
          variant={mode === "vocab" ? "solid" : "outline"}
        
          onClick={() => setMode("vocab")}
        >
          Vocab
        </Button>
      </HStack>

      {/* Flip Card */}
      <MotionBox
        w="300px"
        h="200px"
        position="relative"
        cursor="pointer"
        css={{
          perspective: "1000px"
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Inner wrapper that rotates */}
        <MotionBox
          w="100%"
          h="100%"
          position="relative"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          css={{
            transformStyle: "preserve-3d"
          }}
        >
          {/* FRONT */}
          <Box
            position="absolute"
            w="100%"
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="2px solid black"
            borderRadius="xl"
           
            p={4}
            css={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          >
            <Text textAlign="center" fontSize="md" fontWeight="medium">
              {content.front || "Tap generate to start! "}
            </Text>
          </Box>

          {/* BACK */}
          <Box
            position="absolute"
            w="100%"
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="2px solid black"
            borderRadius="xl"
           
            p={4}
            css={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          >
            <Text textAlign="center" fontSize="md" fontWeight="medium">
              {mode === "sentence" && content.front && content.back ? 
                highlightCorrections(content.front, content.back) : 
                (content.back || "Flip me over!")
              }
            </Text>
          </Box>
        </MotionBox>
      </MotionBox>

      {/* Generate Button */}
      <Button
      fontFamily={"'Comic Sans MS', cursive, sans-serif"}
        bg="#64E352"
        onClick={fetchContent}
        isLoading={loading}
      >
        Play {mode === "sentence" ? "Sentence" : "Word"}
      </Button>
    </VStack>
  );
}