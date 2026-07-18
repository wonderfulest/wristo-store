import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import {
  formatRoleAwareAppCount,
  formatRoleAwareDownloadCount,
  hasAdminRole,
} from '@/utils/downloadCount'

export const useCountDisplay = () => {
  const userStore = useUserStore()
  const isAdmin = computed(() => hasAdminRole(userStore.userInfo?.roles))

  const formatDisplayAppCount = (value?: number | null) => (
    formatRoleAwareAppCount(value, isAdmin.value)
  )
  const formatDisplayDownloadCount = (value?: number | null) => (
    formatRoleAwareDownloadCount(value, isAdmin.value)
  )

  return { isAdmin, formatDisplayAppCount, formatDisplayDownloadCount }
}
