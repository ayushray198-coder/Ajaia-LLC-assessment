import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { userApi } from '@/api/user.api'

export function useDemoUsersQuery() {
  return useQuery({ queryKey: queryKeys.users, queryFn: userApi.listDemoUsers })
}
