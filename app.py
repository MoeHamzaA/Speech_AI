from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
if not os.getenv('OPENAI_API_KEY'):
    raise ValueError("OPENAI_API_KEY not found in environment variables. Please add it to your .env file.")

# Model configuration
# MODEL = "gpt-4"  # Using GPT-4 for better analysis
MODEL = "gpt-3.5-turbo"  # Alternative if GPT-4 is not available

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

        # Create a detailed prompt for interview analysis
        prompt = (
            f"Analyze this interview transcript and provide:\n"
            f"1. A rating out of 100 based on:\n"
            f"   - Technical knowledge (30 points)\n"
            f"   - Communication skills (20 points)\n"
            f"   - Problem-solving approach (20 points)\n"
            f"   - Professionalism (15 points)\n"
            f"   - Overall impression (15 points)\n"
            f"2. A detailed review highlighting:\n"
            f"   - Strengths\n"
            f"   - Areas for improvement\n"
            f"   - Key takeaways\n"
            f"3. Specific feedback on:\n"
            f"   - Technical responses\n"
            f"   - Communication style\n"
            f"   - Interview presence\n\n"
            f"Transcript to analyze:\n{text}"
        )

        # Generate analysis using OpenAI
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert interview analyst with experience in software engineering interviews."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        analysis = response.choices[0].message.content
        
        return jsonify({'analysis': analysis})

    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True) 