
import axios from 'axios';

//  Gemini API keys 
const apiKeys = [
  "AIzaSyBM7_ac70ZpFIcXMoTWuASYyZNBAS_c78A",
  "AIzaSyCqKKmzyQipawTnsZr7baqvkShNbz2HZ6c",
  "AIzaSyBt9A-xTXEGsZivCGAzm--rEWdC0wYvGXo",
  "AIzaSyBbUqBz57LnxhogSJ34_GVYyt3dTEbbwWs",
  "AIzaSyCoQoiNkY0vIRx2rcruLEnwjkLT5MhAZzs",
  "AIzaSyC1JpZC9q3OjHZ4_bxUo6j08jW-0CjQdRA",
  "AIzaSyAUPkDBxkj2wWU31xz21_daKeHeSMYY4dw",
  "AIzaSyAcI_jszUyKA-tRqO5wOFJ6KZBnphOK9m4",
  "AIzaSyAe9RX4phOfwc7YcfIvPzEYWxn_Y-IS8GE",
  "AIzaSyB12_o25JOWDG40gkGEgVlZ9Ocqez6x5DY",
  "AIzaSyCkzx1Jb0KdXuzkYGzBxTKqFv0T9siThEs",
  "AIzaSyBArOq9UZobbIzIyDSSqbL17fkTBSnkJ8o",
  "AIzaSyCCG6DPomjgJoHOtJS8g8ain0UD0EoLnLw",
  "AIzaSyDkppX574iv0BgK_wAtY_MyvuWgKPPlK2A",
  "AIzaSyD5WDjZd9D-k8Wqk7iFhLGZWy1MyrENDss",
  "AIzaSyB6pbPpjghX8NACudg6wmSxwDJJXVaiRRM",
  "AIzaSyBkaBdW0-4_bN0KrJlhno_zhrX-_VWAN_Q",
  "AIzaSyDPV3xs_eekxsKqKlTEpnCvLKnlj33TQdU",
  "AIzaSyAbbxBd_XnGLTsx-k6LBb8hWCB593Y84ik",
  "AIzaSyAdn13wC5pvZNv5CeK6t3arw7-NPtJ4ElU",
  "AIzaSyAImVktg5Q-mcAUGmhFTwi1oD1iWNrP760",
  "AIzaSyC8pcowoSGYBZ1adqGxayA9_0QoHiSj7uo",
  "AIzaSyD5YL9BOYFbhsyCmNwJyq8kFI3inXdRW1c",
  "AIzaSyBwI5d037fKk9Y9LNcsL_IDWP7Qx7M7PDk",
  "AIzaSyAGmCRj4Lvc312uThyvgZbxSqAREq7rlxo",
  "AIzaSyAA5SCdt6X8nuB_HgYN1v1w3AOv3B1jt68",
  "AIzaSyBqMF2AnumDQlWksYu7stEHhyspBi-hGBY",
  "AIzaSyC5XbEFpqxoy5Alw3XyCmOi8CmmYNt6Mls",
  "AIzaSyASEdK-ZdGAEiRDQQP4OAeU7ie0VPozcDg",
  "AIzaSyAoI1VYqLYt3dS6gM3pgDHQvAeCDY0JUA8",
  "AIzaSyBG_V6jBjcdzFqjHegegPUjR4CpVpfVm6Q",
  "AIzaSyAc9WYc4xRvVrpC7TBHqm0r7e_J2jEO_VA",
  "AIzaSyBAKz7sXHVhrr-u5gt4zxGFosPR2GJa49c",
  "AIzaSyAf-oYDa8Ca_6EOJb55MizLrmZP50xV8Cg",
  "AIzaSyA7Odlh5N2qc48arrs07zGsqjBPemGT_sg",
  "AIzaSyDj3x-dc-Cu_ySsCtr33EIqizuBS8HCDrI",
  "AIzaSyBGLIziF-bCqohWfk8W1TrLKIoR2URQ8Dc",
  "AIzaSyBr2wJOLhgydey8dAR3AwmNlvgzZFr4Hoc",
  "AIzaSyDzgznDcYQHORoKsf-UydfmDDJh_g_7GzM",
  "AIzaSyDsx7CRhNX2HK8dtsoJm5i-g0wDtbrrX4c",
  "AIzaSyBCOjDeB6IveJ304b0BDaBt-uhN-8qsNAg",
  "AIzaSyBY_YUw232F77w0QEzfCUctuCv0HUdz1v4",
  "AIzaSyCrY8oUOdWAKWzqO-s1oM5Kd3T92llSYbw",
  "AIzaSyCgAscOE2pMahUM15V6os0E9DKRt0D27IQ",
  "AIzaSyA0OL_6Y2mZzrXihA6IJWvtJPUeMuFSrvE",
  "AIzaSyCHKL0K8d-ogs6Oshh26VxLatcwRuE5LcU",
  "AIzaSyC6KMjr3KsjxTMJtvVPfWeAZxVQSzm5dDo",
  "AIzaSyAuo_GWbdGJzKEvG6WWl-YA_42GBb26Ids",
  "AIzaSyC96ZHeKkhe2rabFz-zYeoc04bLXAHyhkg",
  "AIzaSyAqkh0hjb1vIxwAxTnkNtWYbqfHSQfcqms",
  "AIzaSyC2nKI4s6A3gNm9A-9hfwUljK582uTiLGc",
  "AIzaSyBYo4Pxvir_HcooNezqdY6kOeWf_fo18M4",
  "AIzaSyDlccknQwzFBI0SJF5y4sJRDn2fJwHpyDc",
  "AIzaSyAxaSHWrYqoqW9CzQKW1V2CVBKlKi2qfmc"
  
  ];

let currentKeyIndex = Math.floor(Math.random() * apiKeys.length);
const maxRetries = apiKeys.length; // Retry with each key at most once
const activeKeys = new Map(); // Track current usage per key 🧠

function getNextApiKey() {
  for (let i = 0; i < apiKeys.length; i++) {
    const index = (currentKeyIndex + i) % apiKeys.length;
    const key = apiKeys[index];
    const usage = activeKeys.get(key) || 0;

    // Allow max 3 concurrent uses per key for safety 🚦
    if (usage < 3) {
      currentKeyIndex = (index + 1) % apiKeys.length;
      activeKeys.set(key, usage + 1);
      return key;
    }
  }

  // If all keys are in heavy use, fallback to the next one forcibly
  const key = apiKeys[currentKeyIndex];
  activeKeys.set(key, (activeKeys.get(key) || 0) + 1);
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

function releaseKey(key) {
  const usage = activeKeys.get(key);
  if (usage > 1) {
    activeKeys.set(key, usage - 1);
  } else {
    activeKeys.delete(key);
  }
}

export async function sendMessageToGemini(message, mode) {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    const key = getNextApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const prompt = `Mode: ${mode}\nUser: ${message}`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const response = await axios.post(apiUrl, body);
      const result = response.data.candidates[0]?.content?.parts[0]?.text;
      releaseKey(key);
      console.log(result);
      return result || "🤖 Sorry Sorry!.";
    } catch (error) {
      lastError = error;
      console.warn(`❌ Error with key ${key}:`, error.message || error);
      releaseKey(key);
      retries++;
    }
  }

  return `😓 All keys failed after ${maxRetries} retries. Last error: ${lastError?.message || 'Unknown error'}`;
}
