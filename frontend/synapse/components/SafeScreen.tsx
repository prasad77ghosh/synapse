import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  const inset = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: inset.top,
        paddingBottom:inset.bottom
      }}
      className="flex-1 bg-background"
    >
      {children}
    </View>
  );
};

export default SafeScreen;
