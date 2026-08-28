import { infiniteQueryOptions, mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
  ApiResponse,
  QuerySong,
  Song
} from '@/@types'
import { queryClient } from '../../providers/query-client-provider'
import { httpClient } from '../repository/http-client'
import { keys as userKeys } from './user'

export const keys = {
  all: (opts: QuerySong) => ['songs', opts],
  one: (id: string) => ['songs', id],
  create: () => ['songs', 'create'],
  update: () => ['songs', 'update'],
  delete: () => ['songs', 'delete'],
  addListens: () => ['songs', 'add', 'listens']
} as const

export const songQueries = () => ({
  all: {
    queryOptions: (opts: QuerySong = {}) =>
      infiniteQueryOptions({
        queryKey: keys.all(opts),
        queryFn: async ({ pageParam }) => {
          return await httpClient.get<
            ApiResponse<Song[]>
          >('/songs', { search: opts?.search ?? '', page: pageParam + 1, limit: opts.limit ?? 15 })
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          return lastPage.paginate!.totalPages > lastPageParam + 1 ? lastPageParam + 1 : undefined
        }
      }),
  },

  one: {
    queryOptions: (id: string) =>
      queryOptions({
        queryKey: keys.one(id),
        queryFn: async () => {
          const { data } = await httpClient.get<ApiResponse<Song>>(
            `/songs/${id}`
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
          return await httpClient.post<ApiResponse<Song>>(
            '/songs',
            input
          )
        },
        onSuccess: () => {
          // invalidates all songs
          queryClient().invalidateQueries({ queryKey: keys.all({}) })
          // invalidates my uploaded songs
          queryClient().invalidateQueries({ queryKey: userKeys.song('uploaded') })
        },
      }),
  },

  addListens: {
    mutationOptions: () =>
      mutationOptions({
        mutationKey: keys.addListens(),
        mutationFn: async (id: string) => {
          return await httpClient.put<ApiResponse>(`/songs/listens/add/${id}`)
        },
      }),
  }

  // update: {
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
