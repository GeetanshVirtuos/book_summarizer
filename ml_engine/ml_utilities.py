from transformers import pipeline

# print("I am in ml_utilities")

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(ARTICLE, max_length=130, min_length=10):
    output = summarizer(ARTICLE, max_length=max_length, min_length=min_length, do_sample=False)
    return output[0]['summary_text']
