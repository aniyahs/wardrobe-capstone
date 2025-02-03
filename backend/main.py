# main application folder
from flask import Flask
from app.routes.users import users_bp  # Import users blueprint

app = Flask(__name__)

# Register the blueprint
app.register_blueprint(users_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
