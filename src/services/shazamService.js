import axios from 'axios';

export const identifyTrack = async (audioBlob, apiKey) => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const formData = new FormData();
  // 'upload_file' is a common field name, but it varies by specific RapidAPI provider.
  // We'll use 'upload_file' or 'file'.
  // We explicitly name the file 'recording.webm' or similar to help the API.
  formData.append('upload_file', audioBlob, 'recording.webm');

  const options = {
    method: 'POST',
    url: 'https://shazam-core.p.rapidapi.com/v1/tracks/recognize',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
      // Content-Type is set automatically by axios when using FormData
    },
    data: formData,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
