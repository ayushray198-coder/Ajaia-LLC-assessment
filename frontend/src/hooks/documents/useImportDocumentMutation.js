import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { queryKeys } from '@/api/queryKeys'
import { documentApi } from '@/api/document.api'
import { getAuthIdentity } from '@/lib/auth/identity'

export function useImportDocumentMutation() {
  const queryClient = useQueryClient()
  const identity = useSelector((state) => getAuthIdentity(state.auth))
  return useMutation({
    mutationFn: ({ fileName, content }) => documentApi.importFile(fileName, content),
    onSuccess: (document) => {
      queryClient.setQueryData(queryKeys.document(identity, document._id), document)
      queryClient.invalidateQueries({ queryKey: ['documents', identity] })
    },
  })
}
