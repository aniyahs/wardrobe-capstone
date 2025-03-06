# entry point for the Flask API
from flask import Flask
from flask_cors import CORS
from app.routes.users import users_bp
from app.routes.wardrobe_items import wardrobe_bp

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = "your-super-secret-key"

app.register_blueprint(users_bp, url_prefix="/users")
app.register_blueprint(wardrobe_bp, url_prefix="/wardrobe")


# Print all registered routes before running Flask
with app.app_context():
    print("Registered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule} -> {rule.endpoint}")



if __name__ == "__main__":
    app.run(debug=True)
