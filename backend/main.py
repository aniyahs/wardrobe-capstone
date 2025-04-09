from flask import Flask
from flask_cors import CORS
from app.routes.users import users_bp
from app.routes.wardrobe_items import wardrobe_bp
from app.routes.outfits import outfit_bp  
from app.routes.photos import photos_bp
from app.routes.predict_tags import predict_bp

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = "your-super-secret-key"

# Register blueprints
app.register_blueprint(users_bp, url_prefix="/users")
app.register_blueprint(wardrobe_bp, url_prefix="/wardrobe")
app.register_blueprint(outfit_bp, url_prefix="/outfit")
app.register_blueprint(photos_bp, url_prefix="/photos")
app.register_blueprint(predict_bp, url_prefix="/predict")

# Print all registered routes before running Flask
with app.app_context():
    print("Registered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule} -> {rule.endpoint}")

if __name__ == "__main__":
    app.run(debug=True, port=5001)


