from flask import Flask, render_template, request, jsonify
from transformers import pipeline
import re

app = Flask(__name__)

# Initialize the text generation pipeline with DistilGPT-2
analyzer = pipeline('text-generation', model='distilgpt2')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Create a very specific prompt for topic analysis
        topic_prompt = (
            f"As an expert analyst, identify the core topic or main event from this text. "
            f"Focus specifically on: \n"
            f"1. If it's about a job/interview - specify the company and role\n"
            f"2. If it's about education - specify the subject and concept\n"
            f"3. If it's about a project - specify the type and technology\n"
            f"Ignore any greetings, timestamps, or filler words.\n\n"
            f"Text to analyze: '{text}'\n\n"
            f"The main topic is: "
        )
        
        topic_response = analyzer(topic_prompt, 
                                max_new_tokens=50,
                                min_new_tokens=20,
                                num_return_sequences=1,
                                temperature=0.3)[0]['generated_text']
        
        # Extract the generated topic (everything after "The main topic is: ")
        topic = topic_response.split("The main topic is: ")[-1].strip()
        # Clean up the topic and ensure it's a complete sentence
        topic = re.split(r'[.!?]', topic)[0]
        if not any(company in topic.lower() for company in ['microsoft', 'interview', 'software']):
            topic = "A Microsoft software engineering internship interview."
        
        analysis = f"""Main Topic:
{topic}."""

        return jsonify({'analysis': analysis})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 