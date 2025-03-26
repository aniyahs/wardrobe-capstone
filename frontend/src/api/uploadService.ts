export const savePhotoUrl = async (userId: string, photoUrl: string) => {
    const response = await fetch("http://10.0.2.2:5001/photos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, photoUrl }),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to save photo:", errorText);
      throw new Error("Failed to save photo URL");
    }
  
    const data = await response.json();
    console.log("✅ Flask response:", data);
  };
  