// apps/app/src/navigation/hooks.ts
import { useNavigation as UseAppNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { RootStackParamList } from '@/navigation/root-navigator'

export function useNavigation() {
    return UseAppNavigation<NativeStackNavigationProp<RootStackParamList>>()
}