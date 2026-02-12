from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import shutil
from datetime import datetime
# Connection to the spectrogram.py
from spectrogram import generate_spectrogram


app = FastAPI()

# Get backend directory
BASE_DIR = Path(__file__).resolve().parent

# recordings folder inside backend
RECORDINGS_DIR = BASE_DIR / "recordings"

# -----------------------------
# POST: Save recording
# -----------------------------
@app.post("/record")
async def record_audio(file: UploadFile = File(...)):

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"recording_{timestamp}.webm"

    file_path = RECORDINGS_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("Saved:", file_path)

    # Generate spectrogram
    spectrogram = generate_spectrogram(str(file_path))

    return {
        "message": "Recording saved and spectrogram generated",
        "filename": filename,
        "spectrogram_shape": spectrogram.shape
    }



# -----------------------------
# GET: List all recordings
# -----------------------------
@app.get("/recordings")
def list_recordings():

    files = []

    for file in RECORDINGS_DIR.iterdir():
        if file.is_file():
            files.append({
                "filename": file.name
            })

    return {
        "recordings": files
    }


# -----------------------------
# GET: Fetch specific recording
# -----------------------------
@app.get("/recordings/{filename}")
def get_recording(filename: str):

    file_path = RECORDINGS_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type="audio/webm")
