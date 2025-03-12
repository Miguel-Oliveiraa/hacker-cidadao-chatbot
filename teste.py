import csv

# Read the input file
with open('teste.csv', 'r', encoding='utf-8') as infile:
  data = infile.readlines()

# Write to the output file
with open('output.csv', 'w', newline='', encoding='utf-8') as outfile:
  writer = csv.writer(outfile)
  
  for line in data:
    # Split the line by tab or multiple spaces
    row = line.split()
    # Combine the school name fields until "Estadual" or "Municipal" is found
    school_name = []
    while row and row[4] not in ["Estadual", "Municipal"]:
      school_name.append(row.pop(4))
    school_name.append(row.pop(4))  # Add "Estadual" or "Municipal" to the school name

    # Insert the combined school name back into the row
    row.insert(4, ' '.join(school_name))
    writer.writerow(row)