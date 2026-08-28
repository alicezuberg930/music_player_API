import { infiniteQueryOptions, mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
    ApiResponse,
    Notification,
    QueryNotification
} from '@/@types'
import { httpClient } from '../repository/http-client'
import { queryClient } from '@/providers/query-client-provider'
// import { queryClient } from '@/providers/query-client-provider'

export const keys = {
    all: (opts: QueryNotification) => ['notifications', opts],
    read: (id: string) => ['notifications', id],
    unread: () => ['notifications', 'unread'],
    markAsRead: () => ['notifications', 'markAsRead']
} as const

export const notificationQueries = () => ({
    all: {
        queryOptions: (opts: QueryNotification) =>
            infiniteQueryOptions({
                queryKey: keys.all(opts),
                queryFn: async ({ pageParam }) => {
                    const response = await httpClient.get<ApiResponse<Notification[]>>('/notifications', { page: pageParam + 1, limit: opts.limit ?? 15 })
                    return response
                },
                initialPageParam: 0,
                getNextPageParam: (lastPage, _allPages, lastPageParam) => {
                    return lastPage.paginate!.totalPages > lastPageParam + 1 ? lastPageParam + 1 : undefined
                }
            }),
    },

    unread: {
        queryOptions: () =>
            queryOptions({
                queryKey: keys.unread(),
                queryFn: async () => {
                    const { data } = await httpClient.get<ApiResponse<number>>('/notifications/unread')
                    return data
                },
            }),
    },

    markAsRead: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.markAsRead(),
                mutationFn: async (input: { ids: string[] }) => {
                    return await httpClient.put<ApiResponse<ApiResponse>>(
                        '/notifications/read',
                        { ...input }
                    )
                },
                onSuccess: () => {
                    queryClient().invalidateQueries({ queryKey: keys.all({}) })
                    queryClient().invalidateQueries({ queryKey: keys.unread() })
                },
            }),
    },
})
