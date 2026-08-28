export type ApiResponse<T = unknown> = {
    message: string
    data?: T
    statusCode?: number
    path?: string
    method?: string
    timestamp?: string
    paginate?: {
        limit: number
        currentPage: number
        totalPages: number
    }
}