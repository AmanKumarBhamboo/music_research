import fingerprinting_spectogram
print("Fingerprint file being used:", fingerprinting_spectogram.__file__)

print("Script started")

import os
import csv
from fingerprinting_spectogram  import generate_hashes

songs_folder = "../Songs"
database_file = "hash_database.csv"

with open(database_file, mode='w', newline='') as file:
    
    writer = csv.writer(file)
    writer.writerow(["hash", "song_id", "time_sample"])
    
    for filename in sorted(os.listdir(songs_folder)):
        
        if filename.endswith(".mp3"):
            
            song_id = filename.split("_")[0]
            file_path = os.path.join(songs_folder, filename)
            
            print(f"Processing Song ID: {song_id}")
            
            hashes = generate_hashes(file_path, song_id)
            
        
            print(f"{song_id} -> {len(hashes)} hashes")
            
            writer.writerows(hashes)

print("Hash database created successfully")
