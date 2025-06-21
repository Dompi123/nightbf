import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useRouter } from "expo-router";
import api, { setLogoutHandler } from "@/utils/apiService";

// Use relative path for useColorScheme to avoid module resolution issues
import { useColorScheme } from "../src/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed requests once
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (renamed from cacheTime)
    },
  },
});

// AuthBridge component to connect AuthContext with API service
function AuthBridge() {
  const { logout } = useAuth();

  useEffect(() => {
    // Register the logout handler with the API service
    setLogoutHandler(logout);

    // Cleanup function
    return () => {
      setLogoutHandler(null);
    };
  }, [logout]);

  return null; // This component doesn't render anything
}

function RootNavigation() {
  const { isAuthenticated, isLoading, userToken, user } = useAuth();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Add detailed debug logging
  useEffect(() => {
    console.log("[Navigation] Auth state updated:", {
      isAuthenticated,
      isLoading,
      userToken: userToken ? "exists" : "null",
      user: user ? `${user.name} (${user.email})` : "null",
    });
  }, [isAuthenticated, isLoading, userToken, user]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || isLoading) {
    // Show a loading indicator while fonts load or auth state is resolving
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#9370DB" />
        <Text style={{ marginTop: 10, color: "gray" }}>
          {isLoading ? "Checking authentication..." : "Loading fonts..."}
        </Text>
      </View>
    );
  }

  // Authenticated User Stack
  if (isAuthenticated) {
    console.log("[Navigation] User is authenticated - showing app screens");
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            // Default header styling for consistency
            headerStyle: { backgroundColor: palette.background },
            headerTintColor: palette.text,
          }}
        >
          {/* Tab Navigator Entry Point */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Detail/Placeholder Screens */}
          <Stack.Screen
            name="group/[groupId]"
            options={({ navigation }) => ({
              headerShown: true,
              headerTransparent: true,
              headerTitle: "",
              headerLeft: () => (
                <TouchableOpacity // Outer button for press, background, shape
                  onPress={() => navigation.goBack()}
                  style={styles.headerButton} // Use updated styles.headerButton
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                >
                  {/* Inner View specifically for centering the icon */}
                  <View style={styles.iconContainer}>
                    {/* Increased icon size */}
                    <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity // Outer button for press, background, shape
                  onPress={() =>
                    console.log("Share button placeholder pressed")
                  }
                  style={styles.headerButton} // Use updated styles.headerButton
                  accessibilityLabel="Share group"
                  accessibilityRole="button"
                >
                  {/* Inner View specifically for centering the icon */}
                  <View style={styles.iconContainer}>
                    {/* Increased icon size */}
                    <Ionicons name="share-outline" size={22} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ),
              // Apply margin directly to the header button components if needed
              headerLeftContainerStyle: {
                paddingLeft: spacing.md, // Use paddingLeft for positioning
              },
              headerRightContainerStyle: {
                paddingRight: spacing.md, // Use paddingRight for positioning
              },
            })}
          />
          <Stack.Screen
            name="conversation/[chatId]"
            options={({
              navigation,
              route,
            }: {
              navigation: any;
              route: { params?: { title?: string; participantCount?: number } };
            }) => {
              const { title, participantCount } = route.params || {};
              return {
                headerShown: true,
                headerTitle: () => (
                  <View style={{ alignItems: "flex-start" }}>
                    <Text
                      style={{
                        color: palette.text,
                        fontSize: 18,
                        fontWeight: "600",
                      }}
                      numberOfLines={1}
                    >
                      {title ? title : "Chat"}
                    </Text>
                    {typeof participantCount === "number" && (
                      <Text
                        style={{ color: palette.textSecondary, fontSize: 14 }}
                      >
                        {`${participantCount} members`}
                      </Text>
                    )}
                  </View>
                ),
                headerTitleAlign: "left",
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: spacing.md }}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={28}
                      color={palette.text}
                    />
                  </TouchableOpacity>
                ),
              };
            }}
          />
          <Stack.Screen
            name="exploreGroups"
            options={({ navigation }) => ({
              title: "",
              headerShown: true,
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: 0 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="arrow-back"
                    size={28}
                    color={palette.text}
                  />
                </TouchableOpacity>
              ),
              headerShadowVisible: false,
            })}
          />
          <Stack.Screen
            name="locationDetail/[locationName]"
            options={({
              route,
            }: {
              route: { params?: { locationName?: string } };
            }) => ({
              title: route.params?.locationName || "Location",
              headerShown: true,
            })}
          />
          <Stack.Screen
            name="bffProfileDetail/[userId]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="createGroup"
            options={({ navigation }) => ({
              // Need navigation for custom headerLeft
              presentation: "modal", // Keep modal presentation
              headerShown: true, // Header bar IS visible
              title: "Create Plan", // <<< SET HEADER BAR TITLE HERE
              headerBackTitleVisible: false, // Keep trying to hide default text (might not work but harmless)
              headerLeft: () => (
                // <<< ADD CUSTOM HEADER LEFT
                <TouchableOpacity
                  onPress={() => navigation.goBack()} // Use navigation prop from options
                  style={{ marginLeft: spacing.sm }} // Adjust margin as needed
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="arrow-back"
                    size={28}
                    color={palette.text} // Ensure palette/Colors accessible
                  />
                </TouchableOpacity>
              ),
              // Keep theme styles if needed, but headerLeft handles back button color
              headerStyle: { backgroundColor: palette.background }, // Or Colors.dark.background
              headerTintColor: palette.text, // For title if it were visible, and potentially other elements
            })}
          />
          <Stack.Screen
            name="planNightOutPlaceholder"
            options={{ title: "Plan Night Out", headerShown: true }}
          />
          <Stack.Screen
            name="myFriendsList"
            options={{ title: "My Friends", headerShown: true }}
          />

          {/* Other top-level screens */}
          <Stack.Screen
            name="paywall"
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
              contentStyle: { backgroundColor: "#121212" },
            }}
          />

          {/* Redirect authenticated users away from auth screens */}
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />

          {/* Removed redundant explorePlans/planDetail - assumed handled by file routes */}
          {/* <Stack.Screen name="explorePlans" /> */}
          {/* <Stack.Screen name="planDetail" /> */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  } else {
    // Non-Authenticated Stack - CORRECTED
    console.log(
      "[Navigation] User is NOT authenticated - showing auth screens",
    );
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ gestureEnabled: false }} />
          <Stack.Screen name="signup" />
          {/* --- REMOVED authenticated screen definitions from here --- */}
          {/* <Stack.Screen name="(tabs)" /> */}
          {/* <Stack.Screen name="exploreGroups" /> */}
          {/* <Stack.Screen name="locationDetail/[locationName]" /> */}
          {/* <Stack.Screen name="popularGroupDetail/[groupId]" /> */}
          {/* <Stack.Screen name="bffProfileDetail/[userId]" /> */}
          {/* <Stack.Screen name="conversation/[chatId]" /> */}
          {/* <Stack.Screen name="createGroup" /> */}
          {/* <Stack.Screen name="planNightOutPlaceholder" /> */}
          {/* <Stack.Screen name="paywall" /> */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthBridge />
            <RootNavigation />
          </AuthProvider>
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40, // Larger width
    height: 40, // Larger height
    borderRadius: 20, // Half of new width/height for perfect circle
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Reverted opacity
    overflow: "hidden", // Might help ensure borderRadius applies cleanly
  },
  iconContainer: {
    // Inner view for centering
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
