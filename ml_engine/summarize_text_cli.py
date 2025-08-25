import argparse
from ml_utilities import summarize_text

# print("I am in summarize_text_cli")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True, help="Text to summarize")
    args = ap.parse_args()

    # Run the summarize_text() function
    summary = summarize_text(args.text)
    print(summary)  # print summary to stdout where it would be picked up by the "summarize_text.js" nodejs process

if __name__ == "__main__":
    main()
