

# THIS STUFF DOES NOT WORK SAVING FOR LATER THO


from flask import Flask, jsonify, request
from ....frontend.src.components.outfitGenerator import generate_outfit_cps # Your outfit generation logic
from ....frontend.src.components.sampleWardrobe import wardrobeItems

app = Flask(__name__)

@app.route('/generate-outfit', methods=['POST'])
def generate_outfit():
    # Get input from the request body (you can send season and formality in the POST request)
    data = request.get_json()
    season = data.get('season', ['Spring'])
    formality = data.get('formality', 'Casual')

    try:
        outfit = generate_outfit_cps(season, formality, wardrobeItems)  # Call your algorithm
        return jsonify(outfit), 200  # Return the outfit in JSON format
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
