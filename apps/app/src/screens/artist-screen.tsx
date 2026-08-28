import { RootStackParamList } from "@/navigation/root-navigator"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Text } from "react-native"

type Props = NativeStackScreenProps<RootStackParamList, 'Artist'>

export function AristScreen({ route }: Props) {
    return <Text>{route.params.id}</Text>
}