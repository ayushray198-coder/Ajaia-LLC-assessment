import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { queryKeys } from '@/api/queryKeys'
import { documentApi } from '@/api/document.api'
import { getAuthIdentity } from '@/lib/auth/identity'

export function useDocumentsQuery(search = '') {
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useQuery({ queryKey: queryKeys.documents(identity, search), queryFn: () => documentApi.list(search) })
}

export function useDocumentQuery(id) {
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useQuery({ queryKey: queryKeys.document(identity, id), queryFn: () => documentApi.get(id), enabled: Boolean(id) })
}

export function useCreateDocumentMutation() {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: documentApi.create,
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ['documents', identity] })
      queryClient.setQueryData(queryKeys.document(identity, document._id), document)
    },
  })
}

export function useUpdateDocumentMutation(id) {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: (payload) => documentApi.update(id, payload),
    onSuccess: (document, payload) => {
      queryClient.setQueryData(queryKeys.document(identity, id), document)
      if (payload.title !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['documents', identity] })
      } else {
        const lists = queryClient.getQueriesData({ queryKey: ['documents', identity] })
        for (const [key, cached] of lists) {
          if (!Array.isArray(cached)) continue
          queryClient.setQueryData(key, cached.map((item) => item._id === document._id
            ? { ...item, title: document.title, updatedAt: document.updatedAt, owner: document.owner, sharedWith: document.sharedWith }
            : item).sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)))
        }
      }
    },
  })
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: documentApi.remove,
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents', identity] })
      queryClient.removeQueries({ queryKey: queryKeys.document(identity, id) })
    },
  })
}

export function useShareDocumentMutation(id) {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: ({ userId, role }) => documentApi.share(id, userId, role),
    onSuccess: (document) => {
      queryClient.setQueryData(queryKeys.document(identity, id), document)
      queryClient.invalidateQueries({ queryKey: ['documents', identity] })
    },
  })
}

export function useUpdateShareRoleMutation(id) {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: ({ userId, role }) => documentApi.updateShareRole(id, userId, role),
    onSuccess: (document) => {
      queryClient.setQueryData(queryKeys.document(identity, id), document)
      queryClient.invalidateQueries({ queryKey: ['documents', identity] })
    },
  })
}

export function useRevokeShareMutation(id) {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: ({ userId }) => documentApi.revoke(id, userId),
    onSuccess: (document) => {
      queryClient.setQueryData(queryKeys.document(identity, id), document)
      queryClient.invalidateQueries({ queryKey: ['documents', identity] })
    },
  })
}
