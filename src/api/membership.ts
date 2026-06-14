import instance from '@/config/axios'
import type {
  StudioMembership,
  StudioMembershipCheckoutCallbackRequest,
  StudioMembershipCheckoutCallbackResponse,
  StudioMembershipPlan,
} from '@/types/membership'

export const membershipApi = {
  getStudioPlans(): Promise<StudioMembershipPlan[]> {
    return instance.get('/v1/studio/membership/plans')
  },
  getCurrent(): Promise<StudioMembership> {
    return instance.get('/v1/studio/membership/current')
  },
  cancelCurrent(): Promise<StudioMembership> {
    return instance.post('/v1/studio/membership/cancel')
  },
  resumeCurrent(): Promise<StudioMembership> {
    return instance.post('/v1/studio/membership/resume')
  },
  reconcileCheckout(data: StudioMembershipCheckoutCallbackRequest): Promise<StudioMembershipCheckoutCallbackResponse> {
    return instance.post('/public/purchase/callback', data)
  },
}

export default membershipApi
