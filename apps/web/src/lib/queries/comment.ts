import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { Comment, Query, ApiResponse } from '@/@types'
import { queryClient } from '@/providers/query-client-provider'
import { httpClient } from '../repository/http-client'
import type { CreateCommentInput } from '@yukikaze/validator'

export const keys = {
  all: (songId: string, opts: Query) => ['comments', songId, opts],
  create: () => ['comments', 'create'],
} as const

export const commentQueries = () => ({
  all: {
    queryOptions: (songId: string, opts: Query = {}) =>
      queryOptions({
        queryKey: keys.all(songId, opts),
        queryFn: async () => {
          const { data } = await httpClient.get<ApiResponse<Comment[]>>(
            `/social/comments/${songId}`,
            opts
          )
          return data
        },
        enabled: !!songId,
      }),
  },

  create: {
    mutationOptions: () =>
      mutationOptions({
        mutationKey: keys.create(),
        mutationFn: async (input: CreateCommentInput) => {
          return await httpClient.post<ApiResponse<Comment>>('/social/comments', input)
        },
        onSuccess: () => {
          // invalidates all comments
          queryClient().invalidateQueries({ queryKey: ['comments'] })
        },
      }),
  },
})
