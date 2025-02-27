import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // General container styling
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingBottom: 60, // Space for navbar
  },

  // Titles
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    padding: 15,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: {
    padding: 10,
  },
  navText: {
    color: "#fff",
    fontSize: 16,
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
