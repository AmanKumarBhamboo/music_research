import librosa
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt
import librosa.display


# Base directory (backend folder)
BASE_DIR = Path(__file__).resolve().parent

# Folder to save spectrogram files (optional but recommended)
SPECTROGRAM_DIR = BASE_DIR / "spectrograms"

# Function to generate spectrogram
# Make sure that the spectrogram is fully done 
def generate_spectrogram(file_path: str, save_numpy: bool = True, save_image: bool = False):
    """
    Generate mel spectrogram from audio file.

    Parameters:
        file_path (str): Path to audio file
        save_numpy (bool): Save spectrogram as .npy file
        save_image (bool): Save spectrogram as image

    Returns:
        mel_db (np.ndarray): Spectrogram array
    """

    try:
        # Load audio
        y, sr = librosa.load(file_path, sr=None)

        print(f"[Spectrogram] Loaded audio: {file_path}")
        print(f"[Spectrogram] Audio shape: {y.shape}, Sample rate: {sr}")

        # Generate mel spectrogram
        mel = librosa.feature.melspectrogram(
            y=y,
            sr=sr,
            n_fft=2048,
            hop_length=512,
            n_mels=128
        )

        # Convert to decibel scale
        mel_db = librosa.power_to_db(mel, ref=np.max)

        print(f"[Spectrogram] Generated shape: {mel_db.shape}")

        # Save spectrogram as numpy file
        if save_numpy:
            filename = Path(file_path).stem
            npy_path = SPECTROGRAM_DIR / f"{filename}.npy"
            np.save(npy_path, mel_db)
            print(f"[Spectrogram] Saved numpy: {npy_path}")

        # Save spectrogram as image (optional)
        if save_image:
            filename = Path(file_path).stem
            img_path = SPECTROGRAM_DIR / f"{filename}.png"

            plt.figure(figsize=(10, 4))
            librosa.display.specshow(
                mel_db,
                sr=sr,
                x_axis="time",
                y_axis="mel"
            )
            plt.colorbar(format="%+2.0f dB")
            plt.title("Mel Spectrogram")
            plt.tight_layout()
            plt.savefig(img_path)
            plt.close()

            print(f"[Spectrogram] Saved image: {img_path}")

        return mel_db

    except Exception as e:
        print(f"[Spectrogram ERROR] {e}")
        raise e
