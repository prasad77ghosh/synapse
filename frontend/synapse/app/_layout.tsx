import SafeScreen from "@/components/SafeScreen";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeScreen>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SafeScreen>
  );
}
