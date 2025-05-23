import React, { createContext, useState, useEffect, useContext } from "react";
import { getCurrentUserId } from "./authService";

// Define the structure of a clothing item
export interface ClothingItem {
  favorite: any;
  _id: string;
  type: string;
  style: string;
  texture: string;
  color: string;
  season: string[];
  size: string;
  formality: string;
  imageUrl: string;
  tags?: Record<string, string> | string[];
}

// Define the context type
interface ClothingContextType {
  clothingItems: ClothingItem[];
  loading: boolean;
  error: string | null;
  fetchClothingItems: () => Promise<void>;
  setClothingItems: React.Dispatch<React.SetStateAction<ClothingItem[]>>;
}

// Create the context
const ClothingContext = createContext<ClothingContextType | undefined>(undefined);

// Provider component
export const ClothingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clothing items from the backend
  const fetchClothingItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      // instead of returning an error it logs it, this got the landing page to not show the error 
      if (!userId) {
        console.log("Skipping wardrobe fetch — no user logged in yet.");
        return;
      }

      console.log("Fetching clothing items for user:", userId);
      const response = await fetch(`http://10.0.2.2:5001/wardrobe/clothing?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch clothing items. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Clothing items received:", data);
      setClothingItems(data);
    } catch (error) {
      console.error("Error fetching clothing items:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch clothing data when the provider mounts
  useEffect(() => {
    fetchClothingItems();
  }, []);

  return (
    <ClothingContext.Provider value={{ clothingItems, loading, error, fetchClothingItems, setClothingItems }}>
      {children}
    </ClothingContext.Provider>
  );
};

// Custom hook for using the clothing context
export const useClothing = () => {
  const context = useContext(ClothingContext);
  if (!context) {
    throw new Error("useClothing must be used within a ClothingProvider");
  }
  return context;
};

export const deleteClothingItem = async (itemId: string) => {
  try {
    const response = await fetch(`http://10.0.2.2:5001/wardrobe/delete/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete item.");
    }

    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};


export const toggleFavoriteItem = async (itemId: string, currentFavorite: boolean) => {
  try {
    const response = await fetch(`http://10.0.2.2:5001/wardrobe/${itemId}/favorite`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ favorite: !currentFavorite }),
    });

    if (!response.ok) {
      throw new Error("Failed to update favorite status.");
    }

    return true;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};