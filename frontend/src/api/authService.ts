export const loginUser = async (email: string, password: string) => {
  try {
      const response = await fetch("http://10.0.2.2:5001/users/login", { // Use /login, NOT /register
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || "Login failed");
      }

      return data; // Returns { message, user_id, username }
  } catch (error) {
      if (error instanceof Error) {
          throw new Error(error.message || "Something went wrong");
      } else {
          throw new Error("Something went wrong");
      }
  }
};

  
  export const fetchAllUsers = async () => {
    try {
        const response = await fetch("http://10.0.2.2:5001/users/", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch users");
        }

        return data; // Returns an array of user emails
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Something went wrong while fetching users");
        } else {
            throw new Error("Something went wrong while fetching users");
        }
    }
};

export const signupUser = async (username: string, email: string, password: string) => {
  try {
      const response = await fetch("http://10.0.2.2:5001/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }), // Send `username`
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || "Signup failed");
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

