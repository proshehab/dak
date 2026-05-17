import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { clearAuthSession, getAuthSession, logout } from "@/lib/api";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to log out.";
}

export default function DashboardScreen() {
  const [session, setSession] = useState(() => getAuthSession());
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = session;

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      setSession(getAuthSession());
    }, []),
  );

  async function handleLogout() {
    setIsLoading(true);
    setMessage("");

    try {
      await logout();
      router.replace("/");
    } catch (error) {
      clearAuthSession();
      setMessage(getErrorMessage(error));
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 py-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold uppercase text-emerald-300">
              Admin
            </Text>
            <Text className="mt-1 text-3xl font-black text-white">
              Dashboard
            </Text>
          </View>

          <Pressable
            disabled={isLoading}
            onPress={handleLogout}
            className="h-11 min-w-24 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-bold text-white">Logout</Text>
            )}
          </Pressable>
        </View>

        <View className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <Text className="text-lg font-bold text-white">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-300">
            You are logged in to the admin dashboard.
          </Text>
          {user?.email ? (
            <Text className="mt-4 text-sm font-semibold text-emerald-300">
              {user.email}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => router.push("/profile")}
          className="mt-5 h-14 items-center justify-center rounded-xl bg-emerald-400"
        >
          <Text className="text-base font-bold text-slate-950">
            Edit profile
          </Text>
        </Pressable>

        <View className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <Text className="text-base font-bold text-white">Users</Text>
          <Text className="mt-2 text-3xl font-black text-white">1</Text>
          <Text className="mt-1 text-sm text-slate-400">Current admin user</Text>
        </View>

        {message ? (
          <Text className="mt-5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            {message}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
