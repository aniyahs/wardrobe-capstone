import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";

interface BottomShadowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;     
  contentStyle?: StyleProp<ViewStyle>; 
  shadowStyle?: StyleProp<ViewStyle>;  
  borderRadius?: number;              
}

const BottomShadow: React.FC<BottomShadowProps> = ({
  children,
  style,
  contentStyle,
  shadowStyle,
  borderRadius = 10,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Android-specific fake shadow below the content */}
      {Platform.OS === "android" && (
        <View
          style={[
            styles.androidShadow,
            {
              borderBottomLeftRadius: borderRadius,
              borderBottomRightRadius: borderRadius,
            },
            shadowStyle,
          ]}
        />
      )}

      {/* Main content container */}
      <View
        style={[
          styles.content,
          { borderRadius },
          Platform.OS === "ios" && styles.iosShadow,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center", 
  },
  androidShadow: {
    position: "absolute",
    bottom: 0,
    width: "90%",      
    height: 8,         
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: -1,
  },
  iosShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  content: {
    backgroundColor: "#3F342E",
  },
});

export default BottomShadow;
