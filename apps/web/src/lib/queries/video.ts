import { infiniteQueryOptions, mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
  ApiResponse,
  QueryVideo,
  Video
} from '@/@types'
import { httpClient } from '../repository/http-client'
// import type { VideoValidators } from '@yukikaze/validator'
import { queryClient } from '@/providers/query-client-provider'

export const keys = {
  all: (opts: QueryVideo) => ['videos', opts],
  one: (id: string) => ['videos', id],
  stream: (id: string) => ['videos', 'stream', id],
  create: () => ['videos', 'create'],
  update: () => ['videos', 'update'],
  delete: () => ['videos', 'delete'],
} as const

export const videoQueries = () => ({
  all: {
    queryOptions: (opts: QueryVideo = {}) =>
      infiniteQueryOptions({
        queryKey: keys.all(opts),
        queryFn: async ({ pageParam }) => {
          const response = await httpClient.get<
            ApiResponse<Video[]>
          >('/videos', { search: opts?.search ?? '', page: pageParam + 1, limit: 15 })
          return response
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          return lastPage.paginate!.totalPages > lastPageParam + 1 ? lastPageParam + 1 : undefined
        }
      }),
  },

  stream: {
    queryOptions: (id: string) =>
      queryOptions({
        queryKey: keys.stream(id),
        queryFn: async () => {
          const { data } = await httpClient.get<ApiResponse<Video>>(
            `/videos/stream/${id}`
          )
          return data
        },
        enabled: !!id,
      }),
  },

  one: {
    queryOptions: (id: string) =>
      queryOptions({
        queryKey: keys.one(id),
        queryFn: async () => {
          const { data } = await httpClient.get<ApiResponse<Video>>(
            `/videos/${id}`
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
          return await httpClient.post<ApiResponse<Video>>('/videos', input)
        },
        onSuccess: () => {
          // invalidates all videos
          queryClient().invalidateQueries({ queryKey: keys.all({}) })
        },
      }),
  },

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
