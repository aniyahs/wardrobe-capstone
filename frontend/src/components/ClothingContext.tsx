import React, { createContext, useState, useEffect, useContext } from "react";

// Define the structure of a clothing item
export interface ClothingItem {
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
      console.log("Fetching clothing items from backend...");
      const response = await fetch("http://10.0.2.2:5001/wardrobe/clothing");

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
    <ClothingContext.Provider value={{ clothingItems, loading, error, fetchClothingItems }}>
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
