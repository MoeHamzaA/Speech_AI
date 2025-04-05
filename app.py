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
            f"Extract the main educational or professional topic from this text, focusing on "
            f"the subject matter or activity being discussed. Ignore greetings and filler words. "
            f"Text: '{text}'\n\nMain subject matter:"
        )
        topic_response = analyzer(topic_prompt, 
                                max_new_tokens=50,
                                min_new_tokens=20,
                                num_return_sequences=1,
                                temperature=0.3)[0]['generated_text']
        
        # Extract the generated topic (everything after "Main subject matter:")
        topic = topic_response.split("Main subject matter:")[-1].strip()
        # Clean up the topic
        topic = re.split(r'[.!?]', topic)[0] + '.'
        
        analysis = f"""Main Topic:
{topic}"""

        return jsonify({'analysis': analysis})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 