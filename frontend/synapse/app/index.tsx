import { Image } from "expo-image";
import { View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Image
        source={require("../assets/app-assets/revenue-i1.png")}
        className="resize-contain"
        style={{ height: 310, width: 300 }}
      />
    </View>
  );
}
