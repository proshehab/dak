import { Link, router } from "expo-router";
import React, { useState } from "react";
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

import { register, setAuthSession } from "@/lib/api";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to register.";
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      setMessage("Please fill in every field.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await register(name.trim(), email.trim(), password);
      const token = result.token ?? result.access_token;

      if (!token) {
        setMessage(
          result.message ?? "Account created successfully, but no token returned.",
        );
        return;
      }

      setAuthSession(result);
      router.replace("/dashboard");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-between px-6 py-8">
          <View className="mt-8">
            <View className="mb-10 h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400">
              <Text className="text-3xl font-black text-slate-950">D</Text>
            </View>

            <Text className="text-4xl font-black text-white">
              Create account
            </Text>
            <Text className="mt-3 text-base leading-6 text-slate-300">
              Register a new user in your Laravel backend.
            </Text>
          </View>

          <View className="gap-5">
            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-200">
                Full name
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
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
                value={email}
                className="h-14 rounded-xl border border-slate-700 bg-slate-900 px-4 text-base text-white"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-200">
                Password
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                className="h-14 rounded-xl border border-slate-700 bg-slate-900 px-4 text-base text-white"
              />
            </View>

            {message ? (
              <Text className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                {message}
              </Text>
            ) : null}

            <Pressable
              disabled={isLoading}
              onPress={handleRegister}
              className={`mt-2 h-14 items-center justify-center rounded-xl bg-emerald-400 ${
                isLoading ? "opacity-70" : "opacity-100"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text className="text-base font-bold text-slate-950">
                  Create account
                </Text>
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-center">
            <Text className="text-sm text-slate-400">
              {"Already have an account? "}
            </Text>
            <Link href="/" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-emerald-300">
                  Log in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
