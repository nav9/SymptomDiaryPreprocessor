#If any file has too many small strings in multiple lines, this program will reduce the vertical length of the file by adding many of those strings into a single line of limited length
import re

# Replace 'your_input_file.txt' with the filename containing your data
input_filename = 'en_US.js'
output_filename = 'output_lines.txt'
maxLengthOfOutputLine = 1000
lines = []
currentLine = ''
# Read the entire content of the input file
with open(input_filename, 'r', encoding='utf-8') as file:
    for oneLine in file:                
        currentLine = currentLine + oneLine.rstrip() #strips newlines and spaces at the right
        if len(currentLine) + len(oneLine) > maxLengthOfOutputLine:
            lines.append(currentLine) # Append the current line to lines and start a new line
            currentLine = ''
    if len(currentLine) > 0:#there may be some lines remaining
        lines.append(currentLine)
    # Write the output lines to the output file
    with open(output_filename, 'w', encoding='utf-8') as out_file:
        for line in lines:
            out_file.write(line + '\n')

    print(f"Processing complete. Output written to '{output_filename}'.")
