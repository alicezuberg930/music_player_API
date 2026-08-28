import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
    ApiResponse,
    Playlist,
    QueryPlaylist
} from '@/@types'
import { queryClient } from '../../providers/query-client-provider'
import { httpClient } from '../repository/http-client'
import { keys as userKeys } from './user'
import type { PlaylistValidators } from '@yukikaze/validator'

export const keys = {
    all: (opts: QueryPlaylist) => ['playlists', opts],
    one: (id: string) => ['playlists', id],
    create: () => ['playlists', 'create'],
    update: () => ['playlists', 'update'],
    delete: () => ['playlists', 'delete'],

    addToPlaylist: () => ['songs', 'add', 'playlist'],
    removeFromPlaylist: () => ['songs', 'remove', 'playlist'],
} as const

export const playlistQueries = () => ({
    all: {
        queryOptions: (opts: QueryPlaylist = {}) =>
            queryOptions({
                queryKey: keys.all(opts),
                queryFn: async () => {
                    const { data } = await httpClient.get<
                        ApiResponse<Playlist[]>
                    >('/playlists', opts)
                    return data
                },
            }),
    },

    one: {
        queryOptions: (id: string) =>
            queryOptions({
                queryKey: keys.one(id),
                queryFn: async () => {
                    const { data } = await httpClient.get<ApiResponse<Playlist>>(
                        `/playlists/${id}`
                    )
                    return data
                },
                enabled: !!id,
            }),
    },

    create: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.create(),
                mutationFn: async (input: PlaylistValidators.CreatePlaylistInput) => {
                    return await httpClient.post<ApiResponse<Playlist>>(
                        '/playlists',
                        input
                    )
                },
                onSuccess: () => {
                    // invalidates all playlists
                    queryClient().invalidateQueries({ queryKey: keys.all({}) })
                    // invalidates my playlists
                    queryClient().invalidateQueries({ queryKey: userKeys.playlist('created') })
                },
            }),
    },

    update: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.update(),
                mutationFn: async ({
                    id,
                    ...input
                }: PlaylistValidators.UpdatePlaylistInput) => {
                    return await httpClient.put<ApiResponse<Playlist>>(
                        `/playlists/${id}`,
                        input
                    )
                },
                onSuccess: (_, input) => {
                    queryClient().invalidateQueries({ queryKey: keys.one(input.id!) })
                    queryClient().invalidateQueries({ queryKey: keys.all({}) })
                    queryClient().invalidateQueries({ queryKey: userKeys.playlist('created') })
                },
            }),
    },

    addToPlaylist: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.addToPlaylist(),
                mutationFn: async ({ id, songIds }: { id: string, songIds: string[] }) => {
                    return await httpClient.put<ApiResponse>(
                        `/playlists/add-songs/${id}`, { songIds }
                    )
                },
                onSuccess: (_, input) => {
                    // invalidates current playlist
                    queryClient().invalidateQueries({ queryKey: keys.one(input.id) })
                },
            }),
    },

    removeFromPlaylist: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.removeFromPlaylist(),
                mutationFn: async ({ id, songIds }: { id: string, songIds: string[] }) => {
                    return await httpClient.put<ApiResponse>(
                        `/playlists/remove-songs/${id}`, { songIds }
                    )
                },
                onSuccess: (_, input) => {
                    // invalidates current playlist
                    queryClient().invalidateQueries({ queryKey: keys.one(input.id) })
                },
            }),
    },


    // delete: {
    //   mutationKey: keys.delete,
    //   mutationOptions: () =>
    //     mutationOptions({
    //       mutationKey: keys.delete(),
    //       mutationFn: async (id: string) => {
    //         return await httpClient.delete<ApiResponse<Template[]>>(
    //           `/templates/${id}`
    //         )
    //       },
    //       onSuccess: () => {
    //         queryClient().invalidateQueries({ queryKey: keys.all({}) })
    //       },
    //     }),
    // },
})
