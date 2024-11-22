import csv
import json

# Define the path to your CSV file
csv_file_path = "ruzake-translations.csv"
json_file_path = "translations.json"

# Initialize an empty dictionary to store the JSON data
json_data = {}

# Open the CSV file and read its contents
with open(csv_file_path, mode="r", encoding="utf-8") as csv_file:
    csv_reader = csv.reader(csv_file)
    header = next(csv_reader)  # Read the header row
    for row in csv_reader:
        deutsch = row[0].strip()
        englisch = row[1].strip()

        json_data[deutsch] = {"en": englisch}

# Write the JSON data to a file
with open(json_file_path, mode="w", encoding="utf-8") as json_file:
    json.dump(json_data, json_file, ensure_ascii=False, indent=2)

print(f"JSON data has been written to {json_file_path}")
