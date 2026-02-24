import os
import re

folder_path = "."

files = sorted(os.listdir(folder_path))
song_id = 1

for file in files:
    if file.lower().endswith(".mp3"):
        
        original_name = file
        
        # 🔥 Remove everything inside [] and ()
        clean = re.sub(r"\[.*?\]|\(.*?\)", "", file)
        
        # Remove extension
        clean = clean.replace(".mp3", "")
        
        # Replace dash with underscore
        clean = clean.replace("-", "_")
        
        # Replace spaces with underscore
        clean = clean.replace(" ", "_")
        
        # Remove unwanted characters
        clean = re.sub(r"[^A-Za-z0-9_]", "", clean)
        
        # Convert to lowercase
        clean = clean.lower()
        
        # Remove multiple underscores
        clean = re.sub(r"_+", "_", clean).strip("_")
        
        new_name = f"{str(song_id).zfill(3)}_{clean}.mp3"
        
        old_path = os.path.join(folder_path, original_name)
        new_path = os.path.join(folder_path, new_name)
        
        print(f"Renaming: {original_name} → {new_name}")
        
        os.rename(old_path, new_path)
        
        song_id += 1
