export const loginUser = async (email: string, password: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username: "testuser" }), // Username for now
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
  
      return data; // Success message
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Something went wrong");
      } else {
        throw new Error("Something went wrong");
      }
    }
  };
  