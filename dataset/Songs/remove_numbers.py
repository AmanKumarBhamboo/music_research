import os
import re

folder_path = "."

files = sorted(os.listdir(folder_path))
# Checking if the script is starting or not
print
for file in files:
    if file.lower().endswith(".mp3"):
        
        original_name = file
        
        # Separate name and extension
        name, ext = os.path.splitext(file)
        
        # Remove all numbers
        clean = re.sub(r"\d+", "", name)
        
        # replace spaces with underscore
        clean = clean.replace(" ", "_")
        
        # remove unwanted characters except underscore
        clean = re.sub(r"[^A-Za-z_]", "", clean)
        
        # Convert to lowercase
        clean = clean.lower()
        
        # Remove multiple underscores
        clean = re.sub(r"_+", "_", clean).strip("_")
        
        new_name = f"{clean}.mp3"
        
        old_path = os.path.join(folder_path, original_name)
        new_path = os.path.join(folder_path, new_name)
        
        print(f"Renaming: {original_name} → {new_name}")
        
        os.rename(old_path, new_path)


# Checking if the script is ending or not
print("Script ended successfully")