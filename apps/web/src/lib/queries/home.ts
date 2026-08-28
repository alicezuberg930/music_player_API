import { queryOptions } from '@tanstack/react-query'
import type {
    ApiResponse,
    HomeData,
    WeekChartItem
} from '@/@types'
import { httpClient } from '../repository/http-client'

export const keys = {
    all: () => ['home', 'all'],
    rankings: () => ['home', 'rankings'],
} as const

export const homeQueries = () => ({
    all: {
        queryOptions: () =>
            queryOptions({
                queryKey: keys.all(),
                queryFn: async () => {
                    const { data } = await httpClient.get<
                        ApiResponse<HomeData>
                    >('/home/get')
                    return data
                },
            }),
    },

    rankings: {
        queryOptions: () =>
            queryOptions({
                queryKey: keys.rankings(),
                queryFn: async () => {
                    const response = await httpClient.get<ApiResponse<WeekChartItem[]>>('/home/rankings')
                    return response.data ?? []
                },
            }),
    },

})