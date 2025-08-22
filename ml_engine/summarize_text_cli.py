import sys
from ml_utilities import summarize_text

if __name__ == "__main__":
    # Read input text from stdin
    input_text = sys.stdin.read()
    summary = summarize_text(input_text)
    print(summary)
