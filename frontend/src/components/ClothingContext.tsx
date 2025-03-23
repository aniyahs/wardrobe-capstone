import React, { createContext, useState, useEffect, useContext } from "react";

// Define the structure of a clothing item
interface ClothingItem {
  _id: string;
  type: string;
  color: string;
  season: string[];
  size: string;
  formality: string;
  imageUrl: string;  // Make sure this is included!
}

// Define the context type
interface ClothingContextType {
  clothingItems: ClothingItem[];
  fetchClothingItems: () => Promise<void>;
}

// Create the context
const ClothingContext = createContext<ClothingContextType | undefined>(undefined);

// Provider component
export const ClothingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);

  // Fetch clothing items from the backend
  const fetchClothingItems = async () => {
    try {
      const response = await fetch("http://10.0.2.2:4000/app/models/clothing", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch clothing items");
      }
  
      const data = await response.json();
      console.log("Clothing Items:", data);  // 🔹 Check if images are being fetched
      setClothingItems(data);
    } catch (error) {
      console.error("Error fetching clothing items:", error);
    }
  };
  

  // Fetch clothing data when the provider mounts
  useEffect(() => {
    fetchClothingItems();
  }, []);

  return (
    <ClothingContext.Provider value={{ clothingItems, fetchClothingItems }}>
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
