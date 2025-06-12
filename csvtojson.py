import csv
import json

def convert_csv_to_json(csv_file, json_file):
    # Read CSV file
    data = []
    with open(csv_file, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            data.append(row)

    # Write JSON file 
    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

# Convert file
csv_file = 'tcas_cleaned.csv'
json_file = 'tcas_cleaned.json'

convert_csv_to_json(csv_file, json_file)
print(f"Converted {csv_file} to {json_file}")