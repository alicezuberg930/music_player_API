// apps/app/src/navigation/root-navigator.tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainScreen } from '@/screens/main-screen'
import { AristScreen } from '@/screens/artist-screen'

export type RootStackParamList = {
    Main: undefined
    Artist: { id: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Artist" component={AristScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}