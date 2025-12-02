import { View, Text } from "react-native";
import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  children?: ReactNode;
}

export default function PageContainer({ title, children }: PageContainerProps) {
  return (
    <View className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-900 mb-4">{title}</Text>
        {children}
      </View>
    </View>
  );
}
