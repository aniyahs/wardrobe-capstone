import React from "react";
import { View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { globalStyles } from "../styles/styles";
import { ImageBackground } from "react-native";

const Background: React.FC = () => {
  return (
    <View style={globalStyles.backgroundWrapper}>
      {/* Bottom Layer: Linear Gradient */}
      <ImageBackground
        source={require("../assets/images/Background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"  
      >
      </ImageBackground>
    </View>
  );
};

export default Background;
