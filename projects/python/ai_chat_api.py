import openai
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    data = request.json
    api_key = data.get('apiKey')
    message = data.get('message')
    
    openai.api_key = api_key
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": message}]
        )
        return jsonify({"message": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
