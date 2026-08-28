import type {
    ApiResponse,
} from '@/@types'
import { httpClient } from '../repository/http-client'
import { mutationOptions } from '@tanstack/react-query'

export const keys = {
    one: () => ['file', 'one'],
    multiple: () => ['file', 'multiple']
} as const

export const file = () => ({
    all: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.one(),
                mutationFn: async (input: { file: File, subFolder: string }) => {
                    const formData = new FormData()
                    formData.append('subFolder', input.subFolder)
                    formData.append('file', input.file, input.file.name)
                    return await httpClient.post<ApiResponse<string>>('/upload/single', formData)
                },
            }),
    },

    multiple: {
        mutationOptions: () =>
            mutationOptions({
                mutationKey: keys.multiple(),
                mutationFn: async (input: { files: File[], subFolder: string }) => {
                    const formData = new FormData()
                    formData.append('subFolder', input.subFolder)
                    input.files.forEach((file) => formData.append('files[]', file, file.name))
                    return await httpClient.post<ApiResponse<string[]>>(
                        '/upload/multiple',
                        formData
                    )
                },
            }),
    },
})