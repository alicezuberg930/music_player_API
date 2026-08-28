import { queryOptions } from '@tanstack/react-query'
import type {
    ApiResponse,
    Banner
} from '@/@types'
import { httpClient } from '../repository/http-client'

export const keys = {
    all: () => ['banners'],
    create: () => ['banners', 'create'],
    update: () => ['banners', 'update'],
    delete: () => ['banners', 'delete'],
} as const

export const banner = () => ({
    all: {
        queryOptions: () =>
            queryOptions({
                queryKey: keys.all(),
                queryFn: async () => {
                    const { data } = await httpClient.get<
                        ApiResponse<Banner[]>
                    >('/banners')
                    return data
                },
            }),
    },

    // create: {
    //     mutationOptions: () =>
    //         mutationOptions({
    //             mutationKey: keys.create(),
    //             mutationFn: async (input: PlaylistValidators.AddSongsInput) => {
    //                 return await httpClient.post<ApiResponse<Playlist>>(
    //                     '/playlists',
    //                     input
    //                 )
    //             },
    //             onSuccess: () => {
    //                 // invalidates all playlists
    //                 queryClient().invalidateQueries({ queryKey: keys.all({}) })
    //                 // invalidates my playlists
    //                 queryClient().invalidateQueries({ queryKey: userKeys.playlist('created') })
    //             },
    //         }),
    // },

    // update: {
    //   mutationKey: keys.update,
    //   mutationOptions: () =>
    //     mutationOptions({
    //       mutationKey: keys.update(),
    //       mutationFn: async ({
    //         id,
    //         ...input
    //       }: TemplateValidators.TemplateForm) => {
    //         return await httpClient.put<ApiResponse<Template[]>>(
    //           `/templates/${id}`,
    //           input
    //         )
    //       },
    //       onSuccess: () => {
    //         queryClient().invalidateQueries({ queryKey: keys.all({}) })
    //       },
    //     }),
    // },

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
