import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const globalStyles = StyleSheet.create({
  centered: {  
    justifyContent: "center",
    alignItems: "center",
  },
  // General container styling
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Allows absolute layers
    paddingBottom: 60, // Space for navbar
    paddingTop: 40, // Space for eventual header
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject, // Covers entire screen
    zIndex: -1, // Behind all content
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  radialGradientLayer: {
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.48, // 38% Opacity
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1f1f21",
    opacity: 0.53, // 43% Opacity
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EEE",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
    marginBottom: 5,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },

  listItem: {
    fontSize: 16,
    paddingVertical: 5,
  },

  // Input Fields
  input: {
    width: 250,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },

  // Buttons
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    marginTop: 10,
    borderRadius: 5,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Alerts and messages
  message: {
    color: "#fff",
    marginVertical: 10,
    fontWeight: "bold",
  },
  errorMessage: {
    color: "red",
    textAlign: 'center'
  },
  successMessage: {
    color: "green",
  },

  // Image Styling
  imageContainer: {
    flex: 1,
    padding: 5,
    alignItems: "center",
  },
  image: {
    width: "100%", 
    height: "100%",
    borderRadius: 5,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },

  // Alert Input Fields
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  alertButton: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
  },
  alertButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    marginTop: 10,
    color: "#007bff",
    textDecorationLine: "underline",
    fontSize: 16,
    fontWeight: "bold",
  }, 
  uploadButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  weatherContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherInfo: {
    marginLeft: 10,
  },
  weatherText: {
    fontSize: 18,
    color: '#333',
  },
  weatherEmoji: {
    fontSize: 50,
  }
});
