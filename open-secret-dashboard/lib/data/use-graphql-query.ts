
import { useQuery, type QueryObserverResult } from '@tanstack/react-query'
import { graphqlQLServiceNew } from '@/lib/data/graphql-service'

interface UseGraphQlQueryResult {
    data: any
    error: any
    isLoading: boolean
    refetch: () => Promise<QueryObserverResult<unknown, unknown>>
    isFetching: boolean
    status: 'error' | 'success' | 'loading'
}

export interface GQLQueryOptions {
    queryName: string
    query: string
    variables: Record<string, any>
    queryOpts?: any
    queryParams?: any[]
    customUrl?: string
}

export const useGraphQlQuery = ({
    queryName,
    query,
    variables,
    queryOpts = {},
    queryParams = [],
    customUrl,
}: GQLQueryOptions): UseGraphQlQueryResult => {
    const queryObj =
        queryParams.length > 0 ? [queryName, ...queryParams] : [queryName]

    const { data, error, isLoading, refetch, isFetching, status } = useQuery(
        queryObj,
        () => graphqlQLServiceNew({ query, variables, customUrl }),
        queryOpts
    )

    return { data, error, isLoading, refetch, isFetching, status }
}
