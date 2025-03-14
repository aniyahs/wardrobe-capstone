import React from "react";
import { View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { globalStyles } from "../styles/styles";

const Background: React.FC = () => {
  return (
    <View style={globalStyles.backgroundWrapper}>
      {/* Bottom Layer: Linear Gradient */}
      <LinearGradient
        colors={["#252527", "#3F342E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={globalStyles.gradientLayer}
      />

      {/* Middle Layer: Radial Gradient */}
      <Svg style={globalStyles.radialGradientLayer}>
        <Defs>
          <RadialGradient
            id="radialGradient"
            cx="10%" cy="0%" // Centered at top left
            r="53%" // 1/3 of the screen
          >
            <Stop offset="0%" stopColor="#7E675A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#radialGradient)" />
      </Svg>

      {/* Top Layer: Semi-Transparent Overlay */}
      <View style={globalStyles.overlayLayer} />
    </View>
  );
};

export default Background;
