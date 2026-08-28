import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
  ApiResponse,
  Artist,
  QueryArtist
} from '@/@types'
import { queryClient } from '../../providers/query-client-provider'
import { httpClient } from '../repository/http-client'
import { keys as userKeys } from './user'

export const keys = {
  all: (opts: QueryArtist) => ['artists', opts],
  one: (id: string) => ['artists', id],
  create: () => ['artists', 'create'],
  update: () => ['artists', 'update'],
  delete: () => ['artists', 'delete'],
} as const

export const artistQueries = () => ({
  all: {
    queryOptions: (opts: QueryArtist = {}) =>
      queryOptions({
        queryKey: keys.all(opts),
        queryFn: async () => {
          const { data } = await httpClient.get<
            ApiResponse<Artist[]>
          >('/artists', opts)
          return data
        },
      }),
  },

  one: {
    queryOptions: (id: string) =>
      queryOptions({
        queryKey: keys.one(id),
        queryFn: async () => {
          const { data } = await httpClient.get<ApiResponse<Artist>>(
            `/artists/${id}`
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
        mutationFn: async (input: FormData) => {
          return await httpClient.post<ApiResponse<Artist>>(
            '/artists',
            input
          )
        },
        onSuccess: () => {
          // invalidates all artists
          queryClient().invalidateQueries({ queryKey: keys.all({}) })
          // invalidates my artists
          queryClient().invalidateQueries({ queryKey: userKeys.artist() })
        },
      }),
  },

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
