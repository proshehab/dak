import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  clearAuthSession,
  getAuthSession,
  logout,
  updateProfileName,
} from "@/lib/api";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to update profile.";
}

export default function ProfileScreen() {
  const session = getAuthSession();
  const [name, setName] = useState(session.user?.name ?? "");
  const [email] = useState(session.user?.email ?? "");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!session.isLoggedIn) {
      router.replace("/");
    }
  }, [session.isLoggedIn]);

  async function handleSave() {
    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const result = await updateProfileName(name.trim());
      setName(result.user.name);
      setMessage(result.message ?? "Profile updated successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      clearAuthSession();
    } finally {
      setIsLoggingOut(false);
      router.replace("/");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold uppercase text-emerald-300">
                Account
              </Text>
              <Text className="mt-1 text-3xl font-black text-white">
                Profile
              </Text>
            </View>

            <Pressable
              onPress={() => router.replace("/dashboard")}
              className="h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4"
            >
              <Text className="font-bold text-white">Dashboard</Text>
            </Pressable>
          </View>

          <View className="mt-10 gap-5">
            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-200">
                Name
              </Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#64748b"
                value={name}
                className="h-14 rounded-xl border border-slate-700 bg-slate-900 px-4 text-base text-white"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-200">
                Email address
              </Text>
              <View className="h-14 justify-center rounded-xl border border-slate-800 bg-slate-900 px-4">
                <Text className="text-base text-slate-400">
                  {email || "No email found"}
                </Text>
              </View>
            </View>

            {message ? (
              <Text className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                {message}
              </Text>
            ) : null}

            <Pressable
              disabled={isSaving}
              onPress={handleSave}
              className={`h-14 items-center justify-center rounded-xl bg-emerald-400 ${
                isSaving ? "opacity-70" : "opacity-100"
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text className="text-base font-bold text-slate-950">
                  Save name
                </Text>
              )}
            </Pressable>

            <Pressable
              disabled={isLoggingOut}
              onPress={handleLogout}
              className="h-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-900"
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-bold text-white">Logout</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
