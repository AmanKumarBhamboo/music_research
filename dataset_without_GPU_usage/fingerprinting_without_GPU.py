import librosa
import numpy as np
import hashlib
from scipy.ndimage import maximum_filter


def generate_hashes(file_path,
                    song_id,
                    sr=11025,
                    n_fft=2048,
                    hop_length=512,
                    threshold=-30,          
                    fan_value=3,            
                    neighborhood_size=30):  

    # Load Audio
    y, sr = librosa.load(file_path, sr=sr)

    # Spectrogram
    S = np.abs(librosa.stft(y, n_fft=n_fft, hop_length=hop_length))
    S_db = librosa.amplitude_to_db(S, ref=np.max)

    # Local maxima
    local_max = maximum_filter(S_db, size=neighborhood_size) == S_db
    detected_peaks = (S_db > threshold) & local_max
    peaks = np.argwhere(detected_peaks)

    # EXTRA CONTROL: limit peaks per time frame
    # keep only top 5 peaks per time column
    peaks_by_time = {}

    for f, t in peaks:
        peaks_by_time.setdefault(t, []).append((f, S_db[f, t]))

    filtered_peaks = []

    for t in peaks_by_time:
        # sort by magnitude descending
        sorted_peaks = sorted(peaks_by_time[t], key=lambda x: -x[1])
        for f, _ in sorted_peaks[:5]:  # keep only top 5
            filtered_peaks.append((f, t))

    filtered_peaks = sorted(filtered_peaks, key=lambda x: x[1])

    # Generate Hashes
    hashes = []

    for i in range(len(filtered_peaks)):
        f1, t1 = filtered_peaks[i]

        for j in range(1, fan_value):
            if i + j < len(filtered_peaks):

                f2, t2 = filtered_peaks[i + j]
                delta_t = t2 - t1

                if 0 < delta_t <= 50:

                    time_sample = t1 * hop_length / sr

                    hash_input = f"{f1}-{f2}-{delta_t}"
                    hash_output = hashlib.sha1(
                        hash_input.encode()
                    ).hexdigest()[:12]

                    hashes.append([hash_output, song_id, time_sample])

    return hashes
